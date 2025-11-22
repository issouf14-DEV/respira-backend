from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email

class Profile(models.Model):
    PROFILE_TYPES = [
        ('ASTHMATIC', 'Asthmatique'),
        ('PREVENTION', 'Prévention'),
        ('REMISSION', 'Rémission'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPES, default='PREVENTION')
    
    # Info
    date_of_birth = models.DateField(null=True, blank=True)
    city = models.CharField(max_length=100, default='Abidjan')
    country = models.CharField(max_length=100, default='CI')
    
    # Config
    alerts_enabled = models.BooleanField(default=True)
    days_without_symptoms = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.profile_type}"
