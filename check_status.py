#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'respira_project.settings.development')

# Add the project root to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

django.setup()

from django.urls import get_resolver
from django.conf import settings

print("🔍 VÉRIFICATION DU BACKEND RESPIRA")
print("="*50)
print(f"✅ Django version: {django.get_version()}")
print(f"✅ Debug mode: {settings.DEBUG}")
print(f"✅ Database: {settings.DATABASES['default']['ENGINE']}")
print(f"✅ Database name: {settings.DATABASES['default']['NAME']}")

print("\n📡 ENDPOINTS API DISPONIBLES:")
print("-"*30)
resolver = get_resolver()

def show_urls(urlpatterns, prefix=''):
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            show_urls(pattern.url_patterns, prefix + str(pattern.pattern))
        else:
            print(f"  {prefix}{pattern.pattern} -> {pattern.callback}")

show_urls(resolver.url_patterns)

print("\n🔑 CONFIGURATION API KEYS:")
print("-"*30)
print(f"IQAIR_API_KEY: {'✅ Configuré' if settings.IQAIR_API_KEY else '❌ Manquant'}")
print(f"OPENWEATHER_API_KEY: {'✅ Configuré' if settings.OPENWEATHER_API_KEY else '❌ Manquant'}")

print(f"\n🚀 PRÊT POUR RENDER: {'✅ OUI' if not settings.DEBUG else '⚠️ Configurer production'}")