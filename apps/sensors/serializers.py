from rest_framework import serializers
from .models import BraceletDevice, SensorData, SensorAnalytics, RiskAlert

class BraceletDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BraceletDevice
        fields = '__all__'
        read_only_fields = ['user']

class SensorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorData
        fields = [
            'id', 'timestamp', 'created_at',
            # ⭐⭐⭐⭐⭐ CRITIQUES
            'spo2', 'respiratory_rate', 'aqi',
            # ⭐⭐⭐⭐ IMPORTANTES  
            'heart_rate', 'smoke_detected', 'pollen_level',
            # ⭐⭐⭐ MODÉRÉES
            'temperature', 'humidity', 'activity_level', 'steps',
            # ⭐⭐ UTILES
            'hour_of_day',
            # ANALYSES AVANCÉES
            'spo2_variation_1h', 'aqi_avg_3h',
            # RISQUE
            'risk_score', 'risk_level'
        ]
        read_only_fields = [
            'user', 'bracelet', 'risk_level', 'hour_of_day', 
            'spo2_variation_1h', 'aqi_avg_3h'
        ]

class SensorDataCreateSerializer(serializers.ModelSerializer):
    """Serializer optimisé pour la création de données capteurs"""
    class Meta:
        model = SensorData
        fields = [
            'timestamp', 'spo2', 'respiratory_rate', 'aqi',
            'heart_rate', 'smoke_detected', 'pollen_level',
            'temperature', 'humidity', 'activity_level', 'steps'
        ]

class SensorAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorAnalytics
        fields = '__all__'
        read_only_fields = ['user']

class RiskAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskAlert
        fields = '__all__'
        read_only_fields = ['user']
