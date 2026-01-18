from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import ubidots_views

router = DefaultRouter()
router.register('devices', views.BraceletDeviceViewSet, basename='devices')
router.register('data', views.SensorDataViewSet, basename='data')
router.register('alerts', views.RiskAlertViewSet, basename='alerts')
router.register('analytics', views.SensorAnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
    
    # 📡 UBIDOTS WEBHOOK (PUSH)
    path('ubidots/webhook/', ubidots_views.ubidots_webhook, name='ubidots-webhook'),
    
    # 🔄 UBIDOTS API SYNC (PULL)
    path('ubidots/sync/', ubidots_views.sync_ubidots_data, name='ubidots-sync'),
    path('ubidots/devices/', ubidots_views.ubidots_devices, name='ubidots-devices'),
    path('ubidots/devices/<str:device_id>/variables/', ubidots_views.ubidots_variables, name='ubidots-variables'),
    
    # 📊 APIs PAR TYPE DE CAPTEUR
    path('data/<str:sensor_type>/', ubidots_views.sensor_data_by_type, name='sensor-data-by-type'),
    path('stats/', ubidots_views.sensor_stats, name='sensor-stats'),
    path('latest/', ubidots_views.latest_sensor_readings, name='latest-readings'),
]
