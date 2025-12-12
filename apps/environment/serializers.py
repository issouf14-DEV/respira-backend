from rest_framework import serializers
from .models import AirQuality, Weather

class AirQualitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AirQuality
        fields = '__all__'

class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weather
        fields = '__all__'
