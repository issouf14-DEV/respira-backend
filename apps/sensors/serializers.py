from rest_framework import serializers
from .models import BraceletDevice, SensorData, SensorAnalytics, RiskAlert
from Security.core.security import SensorDataValidator, APISecurityValidator

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
            # ⭐⭐⭐⭐⭐ CAPTEURS MÉDICAUX CRITIQUES (MAX30102)
            'spo2', 'heart_rate', 'respiratory_rate',
            # ⭐⭐⭐⭐⭐ CAPTEURS ENVIRONNEMENTAUX UBIDOTS
            'temperature', 'humidity',  # DHT11
            'eco2', 'tvoc',            # CJMCU-811
            # ⭐⭐⭐⭐ QUALITÉ DE L'AIR
            'aqi', 'smoke_detected', 'pollen_level',
            # ⭐⭐⭐ ACTIVITÉ & MÉTADONNÉES
            'activity_level', 'steps', 'hour_of_day',
            # ⭐⭐ UBIDOTS METADATA
            'ubidots_device_id', 'ubidots_timestamp',
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
    """Serializer sécurisé pour la création de données capteurs"""
    
    class Meta:
        model = SensorData
        fields = [
            'timestamp', 'spo2', 'respiratory_rate', 'aqi',
            'heart_rate', 'smoke_detected', 'pollen_level',
            'temperature', 'humidity', 'activity_level', 'steps'
        ]
    
    def validate_spo2(self, value):
        """Validation sécurisée du SpO2"""
        return SensorDataValidator.validate_spo2(value)
    
    def validate_respiratory_rate(self, value):
        """Validation sécurisée de la fréquence respiratoire"""
        return SensorDataValidator.validate_respiratory_rate(value)
    
    def validate_heart_rate(self, value):
        """Validation sécurisée de la fréquence cardiaque"""
        return SensorDataValidator.validate_heart_rate(value)
    
    def validate_aqi(self, value):
        """Validation sécurisée de l'AQI"""
        return SensorDataValidator.validate_aqi(value)
    
    def validate_temperature(self, value):
        """Validation sécurisée de la température"""
        return SensorDataValidator.validate_temperature(value)
    
    def validate_humidity(self, value):
        """Validation sécurisée de l'humidité - DHT11"""
        return SensorDataValidator.validate_humidity(value)
    
    def validate_eco2(self, value):
        """Validation sécurisée de l'eCO2 - CJMCU-811"""
        return SensorDataValidator.validate_eco2(value)
    
    def validate_tvoc(self, value):
        """Validation sécurisée du TVOC - CJMCU-811"""
        return SensorDataValidator.validate_tvoc(value)
    
    def validate(self, data):
        """Validation globale de l'intégrité des données"""
        # Validation de l'intégrité des données
        SensorDataValidator.validate_data_integrity(data)
        
        # Validation de la fréquence des requêtes
        request = self.context.get('request')
        if request and request.user:
            APISecurityValidator.validate_request_frequency(request.user, 'sensor_data')
            APISecurityValidator.validate_sensitive_data_access(request.user, 'medical_data')
        
        return data

class SecureHealthSummarySerializer(serializers.Serializer):
    """Serializer sécurisé pour le résumé de santé"""
    health_score = serializers.IntegerField(min_value=0, max_value=100)
    health_level = serializers.CharField()
    warnings = serializers.ListField(child=serializers.CharField())
    latest_data = SensorDataSerializer(read_only=True)
    readings_24h = serializers.IntegerField()
    
    def validate(self, data):
        request = self.context.get('request')
        if request and request.user:
            APISecurityValidator.validate_request_frequency(request.user, 'health_summary')
            APISecurityValidator.validate_sensitive_data_access(request.user, 'health_summary')
        return data

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
    
    def validate(self, data):
        request = self.context.get('request')
        if request and request.user:
            APISecurityValidator.validate_request_frequency(request.user, 'alerts')
            APISecurityValidator.validate_sensitive_data_access(request.user, 'critical_alerts')
        return data
