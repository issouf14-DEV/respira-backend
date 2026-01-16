"""
Vue de diagnostic pour vérifier l'état du backend
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection
import os


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Endpoint de diagnostic"""
    
    checks = {
        'status': 'ok',
        'database': False,
        'migrations': False,
        'jwt_config': {},
        'env_vars': {},
        'errors': []
    }
    
    # Vérifier la base de données
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks['database'] = True
    except Exception as e:
        checks['status'] = 'error'
        checks['errors'].append(f"Database error: {str(e)}")
    
    # Vérifier les migrations
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        User.objects.count()
        checks['migrations'] = True
    except Exception as e:
        checks['status'] = 'error'
        checks['errors'].append(f"Migration error: {str(e)}")
    
    # Vérifier la config JWT
    try:
        from django.conf import settings
        jwt_settings = getattr(settings, 'SIMPLE_JWT', {})
        checks['jwt_config'] = {
            'algorithm': jwt_settings.get('ALGORITHM', 'NOT SET'),
            'signing_key_type': type(jwt_settings.get('SIGNING_KEY')).__name__,
            'signing_key_prefix': str(jwt_settings.get('SIGNING_KEY', ''))[:10] + '...',
            'verifying_key': jwt_settings.get('VERIFYING_KEY'),
        }
    except Exception as e:
        checks['errors'].append(f"JWT config error: {str(e)}")
    
    # Vérifier les variables d'environnement
    checks['env_vars'] = {
        'DATABASE_URL': bool(os.getenv('DATABASE_URL')),
        'SECRET_KEY': bool(os.getenv('SECRET_KEY')),
        'GEMINI_API_KEY': bool(os.getenv('GEMINI_API_KEY')),
        'OPENWEATHER_API_KEY': bool(os.getenv('OPENWEATHER_API_KEY')),
        'IQAIR_API_KEY': bool(os.getenv('IQAIR_API_KEY')),
    }
    
    return Response(checks)
