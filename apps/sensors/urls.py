from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('devices', views.BraceletDeviceViewSet, basename='devices')
router.register('data', views.SensorDataViewSet, basename='data')

urlpatterns = [path('', include(router.urls))]
