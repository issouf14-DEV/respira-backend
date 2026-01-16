"""
Vue Keep-Alive pour maintenir le serveur actif
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def wake_up(request):
    """Endpoint pour réveiller le serveur Render"""
    
    # Log de l'activité
    user_agent = request.headers.get('User-Agent', 'Unknown')
    ip_address = request.META.get('HTTP_X_FORWARDED_FOR', 
                                  request.META.get('REMOTE_ADDR', 'Unknown'))
    
    logger.info(f"🔔 Wake-up call from {ip_address} ({user_agent})")
    
    return Response({
        'status': 'awake',
        'message': '🚀 Serveur RespirIA actif et prêt!',
        'timestamp': timezone.now().isoformat(),
        'server': 'render',
        'uptime_tip': 'Ping toutes les 10 minutes pour maintenir actif'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    """Endpoint ping simple pour keep-alive"""
    return JsonResponse({'pong': True, 'timestamp': timezone.now().isoformat()})

@api_view(['GET'])
@permission_classes([AllowAny])
def server_status(request):
    """Statut détaillé du serveur"""
    return Response({
        'server': 'active',
        'platform': 'render.com',
        'timestamp': timezone.now().isoformat(),
        'free_tier_info': {
            'sleep_after': '15 minutes inactivity',
            'cold_start': '~30 seconds',
            'keep_alive_tip': 'Ping /ping/ toutes les 10 minutes'
        }
    })