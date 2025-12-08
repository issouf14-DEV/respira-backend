from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg, Max, Min, Count
from .models import BraceletDevice, SensorData, SensorAnalytics, RiskAlert
from .serializers import (
    BraceletDeviceSerializer, SensorDataSerializer, 
    SensorDataCreateSerializer, SensorAnalyticsSerializer, RiskAlertSerializer,
    SecureHealthSummarySerializer
)
from core.security import APISecurityValidator, DataEncryptionHelper, SensorDataValidator

class BraceletDeviceViewSet(viewsets.ModelViewSet):
    serializer_class = BraceletDeviceSerializer
    
    def get_queryset(self):
        return BraceletDevice.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SensorDataViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SensorDataCreateSerializer
        return SensorDataSerializer
    
    def get_queryset(self):
        # Sécurité: isolation des données par utilisateur
        return SensorData.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Log sécurisé de création de données
        import logging
        logger = logging.getLogger('django.security')
        hashed_user = DataEncryptionHelper.hash_user_identifier(self.request.user.id)
        logger.info(f"Création données capteurs: User#{hashed_user}")
        
        bracelet = BraceletDevice.objects.filter(
            user=self.request.user, is_connected=True
        ).first()
        
        if not bracelet:
            from apps.users.models import CustomUser
            user: CustomUser = self.request.user  # type: ignore
            bracelet = BraceletDevice.objects.create(
                user=user,
                device_id=f"default_{user.id}",
                is_connected=True
            )
        
        bracelet.last_sync = timezone.now()
        bracelet.save()
        
        # Sauvegarder avec calculs automatiques
        instance = serializer.save(user=self.request.user, bracelet=bracelet)
        
        # Créer une alerte si nécessaire
        self._check_and_create_alerts(instance)
        
        return Response(SensorDataSerializer(instance).data, status=status.HTTP_201_CREATED)
    
    def _check_and_create_alerts(self, sensor_data):
        """Créer automatiquement des alertes basées sur les données"""
        alerts = []
        
        # Log sécurisé pour valeurs critiques
        import logging
        logger = logging.getLogger('django.security')
        hashed_user = DataEncryptionHelper.hash_user_identifier(sensor_data.user.id)
        
        # ⭐⭐⭐⭐⭐ SpO2 critique
        if sensor_data.spo2 and sensor_data.spo2 < 90:
            logger.critical(f"SpO2 critique User#{hashed_user}: {sensor_data.spo2}%")
            alerts.append({
                'alert_type': 'LOW_SPO2',
                'severity': 'CRITICAL',
                'message': f'SpO2 critique détectée: {sensor_data.spo2}% (normal: >95%)'
            })
        
        # ⭐⭐⭐⭐⭐ Fréquence respiratoire anormale
        if sensor_data.respiratory_rate:
            if sensor_data.respiratory_rate > 30:
                logger.warning(f"FR élevée User#{hashed_user}: {sensor_data.respiratory_rate}/min")
                alerts.append({
                    'alert_type': 'HIGH_RESPIRATORY_RATE',
                    'severity': 'WARNING',
                    'message': f'Fréquence respiratoire élevée: {sensor_data.respiratory_rate}/min (normal: 12-20/min)'
                })
        
        # ⭐⭐⭐⭐⭐ Qualité de l'air dangereuse
        if sensor_data.aqi and sensor_data.aqi > 150:
            logger.warning(f"AQI dangereux User#{hashed_user}: {sensor_data.aqi}")
            alerts.append({
                'alert_type': 'POOR_AIR_QUALITY',
                'severity': 'CRITICAL' if sensor_data.aqi > 300 else 'WARNING',
                'message': f'Qualité de l\'air dangereuse: AQI {sensor_data.aqi} (bon: <50)'
            })
        
        # ⭐⭐⭐⭐ Fumée détectée
        if sensor_data.smoke_detected:
            logger.critical(f"Fumée détectée User#{hashed_user}")
            alerts.append({
                'alert_type': 'SMOKE_DETECTED',
                'severity': 'CRITICAL',
                'message': 'Fumée détectée dans votre environnement!'
            })
        
        # ⭐⭐⭐⭐ Pollen élevé
        if sensor_data.pollen_level == 'HIGH':
            alerts.append({
                'alert_type': 'HIGH_POLLEN',
                'severity': 'INFO',
                'message': 'Niveau de pollen élevé aujourd\'hui'
            })
        
        # Créer les alertes
        for alert_data in alerts:
            RiskAlert.objects.create(
                user=sensor_data.user,
                sensor_data=sensor_data,
                **alert_data
            )
    
    @action(detail=False)
    def latest(self, request):
        data = self.get_queryset().first()
        if not data:
            return Response({'message': 'Aucune donnée'}, status=404)
        return Response(self.get_serializer(data).data)
    
    @action(detail=False)
    def risk_score(self, request):
        latest = self.get_queryset().first()
        if not latest:
            return Response({'risk_score': 0, 'risk_level': 'UNKNOWN'})
        return Response({
            'risk_score': latest.risk_score or 0,
            'risk_level': latest.risk_level or 'UNKNOWN',
            'timestamp': latest.timestamp
        })
    
    @action(detail=False)
    def stats(self, request):
        period = request.query_params.get('period', '24h')
        hours = {'24h': 24, '7d': 168, '30d': 720}[period]
        start = timezone.now() - timedelta(hours=hours)
        
        qs = self.get_queryset().filter(timestamp__gte=start)
        
        # Stats de base
        stats = qs.aggregate(
            avg_spo2=Avg('spo2'),
            min_spo2=Min('spo2'),
            max_spo2=Max('spo2'),
            avg_heart_rate=Avg('heart_rate'),
            min_heart_rate=Min('heart_rate'),
            max_heart_rate=Max('heart_rate'),
            avg_respiratory_rate=Avg('respiratory_rate'),
            avg_aqi=Avg('aqi'),
            max_aqi=Max('aqi'),
            avg_risk_score=Avg('risk_score')
        )
        
        # Stats par niveau de risque
        risk_distribution = qs.values('risk_level').annotate(count=Count('id'))
        
        return Response({
            'period': period,
            'stats': stats,
            'risk_distribution': risk_distribution,
            'total_readings': qs.count()
        })
    
    @action(detail=False)
    def health_summary(self, request):
        """Résumé de santé intelligent basé sur toutes les métriques"""
        latest = self.get_queryset().first()
        last_24h = self.get_queryset().filter(
            timestamp__gte=timezone.now() - timedelta(hours=24)
        )
        
        if not latest:
            return Response({'message': 'Aucune donnée disponible'}, status=404)
        
        # Calcul du score de santé respiratoire
        health_score = 100
        warnings = []
        
        # Analyse SpO2 ⭐⭐⭐⭐⭐
        if latest.spo2:
            if latest.spo2 < 95:
                health_score -= 30
                warnings.append(f"SpO2 faible: {latest.spo2}%")
        
        # Analyse fréquence respiratoire ⭐⭐⭐⭐⭐  
        if latest.respiratory_rate:
            if latest.respiratory_rate > 25 or latest.respiratory_rate < 12:
                health_score -= 25
                warnings.append(f"Fréquence respiratoire anormale: {latest.respiratory_rate}/min")
        
        # Analyse environnementale ⭐⭐⭐⭐⭐
        if latest.aqi and latest.aqi > 100:
            health_score -= 20
            warnings.append(f"Qualité de l'air médiocre: AQI {latest.aqi}")
        
        # Détection de fumée ⭐⭐⭐⭐
        if latest.smoke_detected:
            health_score -= 40
            warnings.append("Fumée détectée!")
        
        health_score = max(0, health_score)
        
        return Response({
            'health_score': health_score,
            'health_level': 'EXCELLENT' if health_score > 80 else 
                          'GOOD' if health_score > 60 else 
                          'FAIR' if health_score > 40 else 'POOR',
            'warnings': warnings,
            'latest_data': SensorDataSerializer(latest).data,
            'readings_24h': last_24h.count()
        })


class RiskAlertViewSet(viewsets.ModelViewSet):
    serializer_class = RiskAlertSerializer
    
    def get_queryset(self):
        return RiskAlert.objects.filter(user=self.request.user)
    
    @action(detail=False)
    def unread(self, request):
        """Alertes non lues"""
        alerts = self.get_queryset().filter(is_read=False)
        return Response(self.get_serializer(alerts, many=True).data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marquer une alerte comme lue"""
        alert = self.get_object()
        alert.is_read = True
        alert.save()
        return Response({'status': 'marked_read'})


class SensorAnalyticsViewSet(viewsets.ModelViewSet):
    serializer_class = SensorAnalyticsSerializer
    
    def get_queryset(self):
        return SensorAnalytics.objects.filter(user=self.request.user)
