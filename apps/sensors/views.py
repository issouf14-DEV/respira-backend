from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg, Max, Min
from .models import BraceletDevice, SensorData
from .serializers import BraceletDeviceSerializer, SensorDataSerializer

class BraceletDeviceViewSet(viewsets.ModelViewSet):
    serializer_class = BraceletDeviceSerializer
    
    def get_queryset(self):
        return BraceletDevice.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SensorDataViewSet(viewsets.ModelViewSet):
    serializer_class = SensorDataSerializer
    
    def get_queryset(self):
        return SensorData.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
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
        
        serializer.save(user=self.request.user, bracelet=bracelet)
    
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
        start = timezone.now() - timedelta(hours=24 if period=='24h' else 168)
        
        qs = self.get_queryset().filter(timestamp__gte=start)
        stats = qs.aggregate(
            avg_spo2=Avg('spo2'),
            min_spo2=Min('spo2'),
            avg_heart_rate=Avg('heart_rate'),
            max_heart_rate=Max('heart_rate')
        )
        
        return Response({'period': period, 'stats': stats})
