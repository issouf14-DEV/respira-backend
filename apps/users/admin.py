from django.contrib import admin
from .models import User, Profile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'is_active', 'created_at']
    search_fields = ['email', 'username']

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'profile_type', 'city', 'days_without_symptoms']
    list_filter = ['profile_type']
