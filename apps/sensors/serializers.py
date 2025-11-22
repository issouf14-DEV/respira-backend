from rest_framework import serializers
from .models import BraceletDevice, SensorData

class BraceletDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BraceletDevice
        fields = '__all__'
        read_only_fields = ['user']

class SensorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorData
        fields = '__all__'
        read_only_fields = ['user', 'bracelet', 'risk_level']
