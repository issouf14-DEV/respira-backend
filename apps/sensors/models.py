from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class BraceletDevice(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bracelets')
    device_id = models.CharField(max_length=100, unique=True)
    device_name = models.CharField(max_length=100, default='Mon Bracelet')
    battery_level = models.IntegerField(default=100)
    is_connected = models.BooleanField(default=False)
    last_sync = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.device_name} - {self.user.email}"

class SensorData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bracelet = models.ForeignKey(BraceletDevice, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(db_index=True)
    
    # ⭐⭐⭐⭐⭐ FEATURES CRITIQUES
    spo2 = models.IntegerField(null=True, blank=True, help_text="SpO2 (70-100%)")
    respiratory_rate = models.IntegerField(null=True, blank=True, help_text="Fréquence respiratoire (10-40/min)")
    aqi = models.IntegerField(null=True, blank=True, help_text="Air Quality Index (0-500)")
    
    # ⭐⭐⭐⭐ FEATURES IMPORTANTES
    heart_rate = models.IntegerField(null=True, blank=True, help_text="Fréquence cardiaque (30-220 bpm)")
    smoke_detected = models.BooleanField(default=False, help_text="Fumée détectée")
    pollen_level = models.CharField(max_length=10, blank=True, choices=[
        ('LOW', 'Faible'),
        ('MEDIUM', 'Moyen'),
        ('HIGH', 'Élevé')
    ], help_text="Niveau de pollen")
    
    # ⭐⭐⭐ FEATURES MODÉRÉES
    temperature = models.FloatField(null=True, blank=True, help_text="Température (°C)")
    humidity = models.IntegerField(null=True, blank=True, help_text="Humidité (%)")
    activity_level = models.CharField(max_length=20, blank=True, choices=[
        ('REST', 'Repos'),
        ('WALK', 'Marche'),
        ('RUN', 'Course')
    ], help_text="Niveau d'activité")
    steps = models.IntegerField(default=0)
    
    # ⭐⭐ FEATURES UTILES
    hour_of_day = models.IntegerField(null=True, blank=True, help_text="Heure du jour (0-23)")
    
    # ⭐⭐⭐⭐ ANALYSES AVANCÉES
    spo2_variation_1h = models.FloatField(null=True, blank=True, help_text="Variation SpO2 sur 1h")
    aqi_avg_3h = models.FloatField(null=True, blank=True, help_text="AQI moyen sur 3h")
    
    # CALCULS DE RISQUE
    risk_score = models.IntegerField(null=True, blank=True, help_text="Score de risque calculé (0-100)")
    risk_level = models.CharField(max_length=20, blank=True, choices=[
        ('LOW', 'Faible'),
        ('MODERATE', 'Modéré'),
        ('HIGH', 'Élevé'),
        ('CRITICAL', 'Critique')
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['risk_level', '-timestamp']),
            models.Index(fields=['spo2', '-timestamp']),
        ]
    
    def save(self, *args, **kwargs):
        # Auto-calculer l'heure du jour
        if self.timestamp:
            self.hour_of_day = self.timestamp.hour
        
        # Calcul intelligent du score de risque
        if self.spo2 is not None or self.aqi is not None:
            self.risk_score = self.calculate_risk_score()
            
            if self.risk_score < 25:
                self.risk_level = 'LOW'
            elif self.risk_score < 50:
                self.risk_level = 'MODERATE'
            elif self.risk_score < 75:
                self.risk_level = 'HIGH'
            else:
                self.risk_level = 'CRITICAL'
                
        super().save(*args, **kwargs)
    
    def calculate_risk_score(self):
        """Calcul intelligent du score de risque basé sur toutes les métriques"""
        score = 0
        
        # ⭐⭐⭐⭐⭐ SpO2 (poids max: 30 points)
        if self.spo2 is not None:
            if self.spo2 < 90:
                score += 30
            elif self.spo2 < 95:
                score += 20
            elif self.spo2 < 98:
                score += 10
        
        # ⭐⭐⭐⭐⭐ Fréquence respiratoire (poids: 25 points)
        if self.respiratory_rate is not None:
            if self.respiratory_rate > 30 or self.respiratory_rate < 12:
                score += 25
            elif self.respiratory_rate > 25 or self.respiratory_rate < 15:
                score += 15
        
        # ⭐⭐⭐⭐⭐ AQI (poids: 20 points)
        if self.aqi is not None:
            if self.aqi > 300:
                score += 20
            elif self.aqi > 150:
                score += 15
            elif self.aqi > 100:
                score += 10
            elif self.aqi > 50:
                score += 5
        
        # ⭐⭐⭐⭐ Fréquence cardiaque (poids: 15 points)
        if self.heart_rate is not None:
            if self.heart_rate > 120 or self.heart_rate < 50:
                score += 15
            elif self.heart_rate > 100 or self.heart_rate < 60:
                score += 8
        
        # ⭐⭐⭐⭐ Fumée détectée (poids: 10 points)
        if self.smoke_detected:
            score += 10
        
        return min(score, 100)  # Maximum 100
    
    def __str__(self):
        return f"{self.user.email} - {self.timestamp} - Risque: {self.risk_level}"


class SensorAnalytics(models.Model):
    """Table pour les analyses et moyennes glissantes"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(db_index=True)
    
    # ⭐⭐⭐⭐ ANALYSES TEMPORELLES AVANCÉES
    spo2_variation_1h = models.FloatField(null=True, blank=True, help_text="Variation SpO2 sur 1h (%)")
    spo2_avg_1h = models.FloatField(null=True, blank=True, help_text="Moyenne SpO2 sur 1h")
    spo2_min_1h = models.FloatField(null=True, blank=True, help_text="Min SpO2 sur 1h")
    
    # ⭐⭐⭐ AQI MOYENS GLISSANTS
    aqi_avg_3h = models.FloatField(null=True, blank=True, help_text="AQI moyen sur 3h")
    aqi_avg_6h = models.FloatField(null=True, blank=True, help_text="AQI moyen sur 6h")
    aqi_avg_24h = models.FloatField(null=True, blank=True, help_text="AQI moyen sur 24h")
    
    # FRÉQUENCE CARDIAQUE
    heart_rate_avg_1h = models.FloatField(null=True, blank=True, help_text="FC moyenne sur 1h")
    heart_rate_variability = models.FloatField(null=True, blank=True, help_text="Variabilité FC")
    
    # FRÉQUENCE RESPIRATOIRE 
    respiratory_rate_avg_1h = models.FloatField(null=True, blank=True, help_text="FR moyenne sur 1h")
    
    # SCORES COMPOSITES
    respiratory_health_score = models.IntegerField(null=True, blank=True, help_text="Score santé respiratoire (0-100)")
    environmental_risk_score = models.IntegerField(null=True, blank=True, help_text="Score risque environnemental (0-100)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
        ]
        
    def __str__(self):
        return f"Analytics {self.user.email} - {self.timestamp}"


class RiskAlert(models.Model):
    """Table pour les alertes de risque automatiques"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sensor_data = models.ForeignKey(SensorData, on_delete=models.CASCADE, null=True, blank=True)
    
    alert_type = models.CharField(max_length=30, choices=[
        ('LOW_SPO2', 'SpO2 Faible'),
        ('HIGH_RESPIRATORY_RATE', 'Fréquence Respiratoire Élevée'),
        ('POOR_AIR_QUALITY', 'Mauvaise Qualité Air'),
        ('SMOKE_DETECTED', 'Fumée Détectée'),
        ('HIGH_POLLEN', 'Pollen Élevé'),
        ('COMPOSITE_RISK', 'Risque Composite'),
    ])
    
    severity = models.CharField(max_length=20, choices=[
        ('INFO', 'Information'),
        ('WARNING', 'Attention'),
        ('CRITICAL', 'Critique'),
    ])
    
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"Alert {self.alert_type} - {self.user.email}"
