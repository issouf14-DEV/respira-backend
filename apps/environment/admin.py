from django.contrib import admin
from .models import AirQuality, Weather

@admin.register(AirQuality)
class AirQualityAdmin(admin.ModelAdmin):
    list_display = ['city', 'aqi', 'aqi_level', 'timestamp']

@admin.register(Weather)
class WeatherAdmin(admin.ModelAdmin):
    list_display = ['city', 'temperature', 'humidity', 'timestamp']
