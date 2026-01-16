from django.contrib import admin
from .models import BraceletDevice, SensorData

@admin.register(BraceletDevice)
class BraceletDeviceAdmin(admin.ModelAdmin):
    list_display = ['device_name', 'user', 'battery_level', 'is_connected']

@admin.register(SensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display = ['user', 'timestamp', 'spo2', 'heart_rate', 'risk_level']
    list_filter = ['risk_level']
