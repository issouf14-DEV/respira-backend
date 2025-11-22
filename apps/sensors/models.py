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
    
    # Données vitales
    spo2 = models.IntegerField(null=True, blank=True, help_text="SpO2 (%)")
    heart_rate = models.IntegerField(null=True, blank=True, help_text="BPM")
    respiratory_rate = models.IntegerField(null=True, blank=True, help_text="/min")
    temperature = models.FloatField(null=True, blank=True, help_text="°C")
    
    # Activité
    activity_level = models.CharField(max_length=20, blank=True, choices=[
        ('REST', 'Repos'),
        ('LIGHT', 'Léger'),
        ('MODERATE', 'Modéré'),
        ('INTENSE', 'Intense')
    ])
    steps = models.IntegerField(default=0)
    
    # Risque
    risk_score = models.IntegerField(null=True, blank=True)
    risk_level = models.CharField(max_length=20, blank=True, choices=[
        ('LOW', 'Faible'),
        ('MODERATE', 'Modéré'),
        ('HIGH', 'Élevé'),
        ('CRITICAL', 'Critique')
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def save(self, *args, **kwargs):
        if self.risk_score is not None:
            if self.risk_score < 40:
                self.risk_level = 'LOW'
            elif self.risk_score < 70:
                self.risk_level = 'MODERATE'
            elif self.risk_score < 90:
                self.risk_level = 'HIGH'
            else:
                self.risk_level = 'CRITICAL'
        super().save(*args, **kwargs)
