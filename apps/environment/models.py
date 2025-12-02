from django.db import models

class AirQuality(models.Model):
    city = models.CharField(max_length=100)
    timestamp = models.DateTimeField(db_index=True)
    
    # ⭐⭐⭐⭐⭐ AQI Principal
    aqi = models.IntegerField(help_text="Air Quality Index (0-500)")
    aqi_level = models.CharField(max_length=20, choices=[
        ('GOOD', 'Bon'),           # 0-50
        ('MODERATE', 'Modéré'),    # 51-100
        ('UNHEALTHY', 'Mauvais'),  # 101-150
        ('HAZARDOUS', 'Dangereux') # 151+
    ])
    
    # Particules détaillées
    pm25 = models.FloatField(null=True, blank=True, help_text="Particules PM2.5")
    pm10 = models.FloatField(null=True, blank=True, help_text="Particules PM10")
    
    # ⭐⭐⭐⭐ Niveau de pollen
    pollen_level = models.CharField(max_length=10, blank=True, choices=[
        ('LOW', 'Faible'),
        ('MEDIUM', 'Moyen'),
        ('HIGH', 'Élevé')
    ], help_text="Niveau de pollen")
    
    # ⭐⭐⭐⭐ Détection de fumée environnementale
    smoke_detected = models.BooleanField(default=False, help_text="Fumée détectée dans l'environnement")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['city', '-timestamp']),
            models.Index(fields=['aqi_level', '-timestamp']),
        ]
    
    def save(self, *args, **kwargs):
        # Auto-calculer le niveau AQI
        if self.aqi is not None:
            if self.aqi <= 50:
                self.aqi_level = 'GOOD'
            elif self.aqi <= 100:
                self.aqi_level = 'MODERATE'
            elif self.aqi <= 150:
                self.aqi_level = 'UNHEALTHY'
            else:
                self.aqi_level = 'HAZARDOUS'
        super().save(*args, **kwargs)

class Weather(models.Model):
    city = models.CharField(max_length=100)
    timestamp = models.DateTimeField(db_index=True)
    temperature = models.FloatField(help_text="°C")
    humidity = models.IntegerField(help_text="%")
    description = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
