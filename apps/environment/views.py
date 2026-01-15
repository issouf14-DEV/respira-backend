from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import AirQuality, Weather
from .serializers import AirQualitySerializer, WeatherSerializer
from .services.iqair_service import IQAirService
from .services.weather_service import WeatherService

class AirQualityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AirQualitySerializer
    
    def get_queryset(self):
        city = self.request.query_params.get('city', 'Abidjan')
        return AirQuality.objects.filter(city=city)
    
    @action(detail=False)
    def current(self, request):
        city = request.query_params.get('city', request.user.profile.city)
        
        # Vérifier si on a des données récentes (moins de 1 heure)
        one_hour_ago = timezone.now() - timedelta(hours=1)
        latest = AirQuality.objects.filter(
            city=city,
            timestamp__gte=one_hour_ago
        ).first()
        
        if not latest:
            # Récupérer nouvelles données depuis l'API
            service = IQAirService()
            latest = service.get_city_air_quality(city)
        
        return Response(self.get_serializer(latest).data)

class WeatherViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WeatherSerializer
    
    def get_queryset(self):
        city = self.request.query_params.get('city', 'Abidjan')
        return Weather.objects.filter(city=city)
    
    @action(detail=False)
    def current(self, request):
        city = request.query_params.get('city', request.user.profile.city)
        
        # Vérifier si on a des données récentes (moins de 30 minutes)
        thirty_minutes_ago = timezone.now() - timedelta(minutes=30)
        latest = Weather.objects.filter(
            city=city,
            timestamp__gte=thirty_minutes_ago
        ).first()
        
        if not latest:
            # Récupérer nouvelles données depuis l'API
            service = WeatherService()
            latest = service.get_city_weather(city)
        
        return Response(self.get_serializer(latest).data)
