from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('air-quality', views.AirQualityViewSet, basename='air-quality')
router.register('weather', views.WeatherViewSet, basename='weather')

urlpatterns = [path('', include(router.urls))]
