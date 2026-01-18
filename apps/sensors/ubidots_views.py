"""
API Views pour l'intégration Ubidots et l'accès aux données capteurs
"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db.models import Q, Avg, Max, Min
from datetime import datetime, timedelta
import json
import logging

from .models import SensorData, BraceletDevice
from .serializers import SensorDataSerializer, SensorDataCreateSerializer
from .ubidots_service import UbidotsService
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])  # Ubidots webhook ne peut pas s'authentifier
def ubidots_webhook(request):
    """
    Webhook pour recevoir les données des capteurs depuis Ubidots
    """
    try:
        payload = request.data
        logger.info(f"📡 Données Ubidots reçues: {payload}")
        
        # Validation des champs requis
        if not all(key in payload for key in ['device_id', 'user_email', 'timestamp', 'data']):
            return Response({
                'error': 'Champs manquants: device_id, user_email, timestamp, data requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Trouver l'utilisateur
        try:
            user = User.objects.get(email=payload['user_email'])
        except User.DoesNotExist:
            logger.warning(f"Utilisateur non trouvé: {payload['user_email']}")
            return Response({
                'error': 'Utilisateur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Trouver ou créer le bracelet/device
        bracelet, created = BraceletDevice.objects.get_or_create(
            user=user,
            device_id=payload['device_id'],
            defaults={
                'device_name': f"Capteurs Ubidots {payload['device_id'][-3:]}",
                'is_connected': True,
                'battery_level': 100
            }
        )
        
        # Convertir timestamp Unix (ms) en datetime
        timestamp = datetime.fromtimestamp(payload['timestamp'] / 1000, tz=timezone.utc)
        
        # Créer les données capteur
        sensor_data = SensorData.objects.create(
            user=user,
            bracelet=bracelet,
            timestamp=timestamp,
            spo2=payload['data'].get('spo2'),
            heart_rate=payload['data'].get('heart_rate'),
            temperature=payload['data'].get('temperature'),
            humidity=payload['data'].get('humidity'),
            eco2=payload['data'].get('eco2'),
            tvoc=payload['data'].get('tvoc'),
            ubidots_device_id=payload['device_id'],
            ubidots_timestamp=payload['timestamp'],
            respiratory_rate=payload['data'].get('respiratory_rate'),
            activity_level=payload['data'].get('activity_level', 'REST'),
            steps=payload['data'].get('steps', 0)
        )
        
        # Mettre à jour la dernière sync du bracelet
        bracelet.last_sync = timezone.now()
        bracelet.is_connected = True
        bracelet.save()
        
        return Response({
            'status': 'success',
            'message': 'Données capteurs enregistrées',
            'sensor_data_id': sensor_data.id,
            'risk_level': sensor_data.risk_level,
            'risk_score': sensor_data.risk_score
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"❌ Erreur webhook Ubidots: {str(e)}")
        return Response({
            'error': 'Erreur serveur lors du traitement des données'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def sensor_data_by_type(request, sensor_type):
    """API pour récupérer les données par type de capteur"""
    user = request.user
    
    hours = int(request.GET.get('hours', 24))
    limit = int(request.GET.get('limit', 100))
    start_time = timezone.now() - timedelta(hours=hours)
    
    queryset = SensorData.objects.filter(
        user=user,
        timestamp__gte=start_time
    ).order_by('-timestamp')[:limit]
    
    # Filtrer selon le type de capteur
    if sensor_type == 'max30102':
        queryset = queryset.filter(Q(spo2__isnull=False) | Q(heart_rate__isnull=False))
        fields = ['timestamp', 'spo2', 'heart_rate', 'risk_level']
    elif sensor_type == 'dht11':
        queryset = queryset.filter(Q(temperature__isnull=False) | Q(humidity__isnull=False))
        fields = ['timestamp', 'temperature', 'humidity']
    elif sensor_type == 'cjmcu811':
        queryset = queryset.filter(Q(eco2__isnull=False) | Q(tvoc__isnull=False))
        fields = ['timestamp', 'eco2', 'tvoc']
    elif sensor_type == 'all':
        fields = ['timestamp', 'spo2', 'heart_rate', 'temperature', 'humidity', 'eco2', 'tvoc', 'risk_level']
    else:
        return Response({
            'error': f'Type de capteur invalide: {sensor_type}',
            'valid_types': ['max30102', 'dht11', 'cjmcu811', 'all']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Sérialiser les données
    data = []
    for item in queryset:
        row = {}
        for field in fields:
            row[field] = getattr(item, field)
        data.append(row)
    
    return Response({
        'sensor_type': sensor_type,
        'period_hours': hours,
        'count': len(data),
        'data': data
    })


@api_view(['GET'])
def sensor_stats(request):
    """Statistiques des capteurs"""
    user = request.user
    hours = int(request.GET.get('hours', 24))
    start_time = timezone.now() - timedelta(hours=hours)
    
    queryset = SensorData.objects.filter(user=user, timestamp__gte=start_time)
    
    return Response({
        'period_hours': hours,
        'total_records': queryset.count(),
        'max30102_count': queryset.filter(Q(spo2__isnull=False) | Q(heart_rate__isnull=False)).count(),
        'dht11_count': queryset.filter(Q(temperature__isnull=False) | Q(humidity__isnull=False)).count(),
        'cjmcu811_count': queryset.filter(Q(eco2__isnull=False) | Q(tvoc__isnull=False)).count()
    })


@api_view(['GET'])
def latest_sensor_readings(request):
    """Dernières lectures de tous les capteurs"""
    user = request.user
    
    latest = SensorData.objects.filter(user=user).order_by('-timestamp').first()
    
    if not latest:
        return Response({'message': 'Aucune donnée trouvée'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'timestamp': latest.timestamp,
        'risk_level': latest.risk_level,
        'risk_score': latest.risk_score,
        'max30102': {
            'spo2': latest.spo2,
            'heart_rate': latest.heart_rate
        },
        'dht11': {
            'temperature': latest.temperature,
            'humidity': latest.humidity
        },
        'cjmcu811': {
            'eco2': latest.eco2,
            'tvoc': latest.tvoc
        }
    })


@api_view(['POST'])
def sync_ubidots_data(request):
    """Synchroniser les données depuis l'API Ubidots"""
    user = request.user
    
    # Paramètres
    hours_back = int(request.data.get('hours', 24))
    api_token = request.data.get('api_token')  # Token Ubidots fourni par l'utilisateur
    
    if not api_token:
        return Response({
            'error': 'api_token Ubidots requis'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Initialiser le service Ubidots
    ubidots_service = UbidotsService(api_token=api_token)
    
    # Synchroniser les données
    result = ubidots_service.sync_sensor_data(
        user_email=user.email,
        hours_back=hours_back
    )
    
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(result)


@api_view(['GET'])
def ubidots_devices(request):
    """Lister les devices Ubidots disponibles"""
    api_token = request.GET.get('api_token')
    
    if not api_token:
        return Response({
            'error': 'api_token Ubidots requis en paramètre'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    ubidots_service = UbidotsService(api_token=api_token)
    devices = ubidots_service.get_devices()
    
    # Simplifier les informations des devices
    simplified_devices = []
    for device in devices:
        simplified_devices.append({
            'id': device['id'],
            'label': device.get('label', device['id']),
            'name': device.get('name', ''),
            'is_active': device.get('isActive', False),
            'last_activity': device.get('lastActivity')
        })
    
    return Response({
        'devices': simplified_devices,
        'count': len(simplified_devices)
    })


@api_view(['GET'])
def ubidots_variables(request, device_id):
    """Lister les variables d'un device Ubidots"""
    api_token = request.GET.get('api_token')
    
    if not api_token:
        return Response({
            'error': 'api_token Ubidots requis'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    ubidots_service = UbidotsService(api_token=api_token)
    variables = ubidots_service.get_device_variables(device_id)
    
    # Simplifier les informations des variables
    simplified_variables = []
    for var in variables:
        simplified_variables.append({
            'id': var['id'],
            'label': var.get('label', ''),
            'name': var.get('name', ''),
            'unit': var.get('unit', ''),
            'description': var.get('description', '')
        })
    
    return Response({
        'device_id': device_id,
        'variables': simplified_variables,
        'count': len(simplified_variables)
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def ubidots_max30102_data(request):
    """Récupérer les données SPO2 et fréquence cardiaque (MAX30102) depuis Ubidots.
    Paramètres:
      - api_token (obligatoire)
      - device_id (optionnel) pour cibler un device précis
      - device_label (optionnel) pour filtrer par label Ubidots
      - hours (optionnel, défaut 24) période à récupérer
    Retourne: liste d'objets { spo2, heart_rate, timestamp, device_id, device_label }
    """
    try:
        api_token = request.GET.get('api_token')
        device_id_filter = request.GET.get('device_id')
        device_label_filter = request.GET.get('device_label')
        hours = int(request.GET.get('hours', 24))

        if not api_token:
            return Response({'error': 'api_token Ubidots requis'}, status=status.HTTP_400_BAD_REQUEST)

        service = UbidotsService(api_token=api_token)

        end_time = timezone.now()
        start_time = end_time - timedelta(hours=hours)

        devices = service.get_devices() or []

        def normalize_values(values):
            # Ubidots peut renvoyer {'results': [...]} ou directement une liste
            if isinstance(values, dict) and 'results' in values:
                return values['results']
            return values or []

        all_entries = []

        for device in devices:
            did = device.get('id')
            dlabel = device.get('label', did)

            if device_id_filter and did != device_id_filter:
                continue
            if device_label_filter and dlabel != device_label_filter:
                continue

            variables = service.get_device_variables(did) or []

            spo2_var = None
            hr_var = None
            for var in variables:
                vlabel = (var.get('label') or '').lower()
                if vlabel in ['spo2', 'spo_2', 'oxygen']:
                    spo2_var = var['id']
                elif vlabel in ['heart_rate', 'heartrate', 'hr', 'bpm']:
                    hr_var = var['id']

            # Récupérer les valeurs
            spo2_values = normalize_values(service.get_variable_values(spo2_var, start_time, end_time)) if spo2_var else []
            hr_values = normalize_values(service.get_variable_values(hr_var, start_time, end_time)) if hr_var else []

            # Indexer par timestamp (ms)
            merged = {}
            for item in spo2_values:
                ts = item.get('timestamp')
                if ts is None:
                    continue
                merged.setdefault(ts, {})
                merged[ts]['spo2'] = item.get('value')
            for item in hr_values:
                ts = item.get('timestamp')
                if ts is None:
                    continue
                merged.setdefault(ts, {})
                merged[ts]['heart_rate'] = item.get('value')

            # Construire les entrées
            for ts_ms, vals in merged.items():
                ts_dt = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)
                all_entries.append({
                    'spo2': vals.get('spo2'),
                    'heart_rate': vals.get('heart_rate'),
                    'timestamp': ts_dt.isoformat().replace('+00:00', 'Z'),
                    'device_id': did,
                    'device_label': dlabel
                })

        # Trier par timestamp croissant
        all_entries.sort(key=lambda x: x['timestamp'])

        return Response({
            'sensor': 'max30102',
            'hours': hours,
            'count': len(all_entries),
            'data': all_entries
        })
    except Exception as e:
        logger.error(f"❌ Erreur ubidots_max30102_data: {e}")
        return Response({'error': 'Erreur serveur lors de la récupération des données'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)