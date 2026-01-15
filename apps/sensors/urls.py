from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('devices', views.BraceletDeviceViewSet, basename='devices')
router.register('data', views.SensorDataViewSet, basename='data')
router.register('alerts', views.RiskAlertViewSet, basename='alerts')
router.register('analytics', views.SensorAnalyticsViewSet, basename='analytics')

urlpatterns = [path('', include(router.urls))]
