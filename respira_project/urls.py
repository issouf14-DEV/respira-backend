from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from apps.users.health import health_check

schema_view = get_schema_view(
    openapi.Info(
        title="RespirIA API",
        default_version='v1',
        description="API Backend pour application Flutter RespirIA",
        contact=openapi.Contact(email="support@respira.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

def api_root(request):
    """Vue racine de l'API avec informations pour Flutter"""
    return JsonResponse({
        'message': 'Bienvenue sur l\'API RespirIA',
        'version': 'v1.0.0',
        'platform': 'Flutter-ready',
        'endpoints': {
            'api': '/api/v1/',
            'admin': '/admin/',
            'documentation': '/swagger/',
            'auth': {
                'register': '/api/v1/users/auth/register/',
                'login': '/api/v1/users/auth/login/',
                'refresh': '/api/v1/users/auth/refresh/',
            },
            'users': '/api/v1/users/',
            'sensors': '/api/v1/sensors/',
            'environment': '/api/v1/environment/',
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/v1/', include('api.v1.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/chatbot/', include('chatbot.urls')),
]
