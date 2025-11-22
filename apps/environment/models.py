from django.db import models

class AirQuality(models.Model):
    city = models.CharField(max_length=100)
    timestamp = models.DateTimeField(db_index=True)
    aqi = models.IntegerField(help_text="Air Quality Index")
    aqi_level = models.CharField(max_length=20, choices=[
        ('GOOD', 'Bon'),
        ('MODERATE', 'Modéré'),
        ('UNHEALTHY', 'Mauvais'),
    ])
    pm25 = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']

class Weather(models.Model):
    city = models.CharField(max_length=100)
    timestamp = models.DateTimeField(db_index=True)
    temperature = models.FloatField(help_text="°C")
    humidity = models.IntegerField(help_text="%")
    description = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
