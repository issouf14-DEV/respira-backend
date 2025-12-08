"""
Script pour afficher toutes les routes générées par DefaultRouter
"""
from rest_framework.routers import DefaultRouter
from apps.environment.views import AirQualityViewSet, WeatherViewSet

# Créer un router comme dans urls.py
router = DefaultRouter()
router.register('air-quality', AirQualityViewSet, basename='air-quality')
router.register('weather', WeatherViewSet, basename='weather')

print("\n" + "="*70)
print("ROUTES GÉNÉRÉES AUTOMATIQUEMENT PAR DefaultRouter")
print("="*70)

for url_pattern in router.urls:
    pattern = str(url_pattern.pattern)
    name = url_pattern.name
    
    # Déterminer la méthode HTTP
    methods = []
    if hasattr(url_pattern.callback, 'cls'):
        # C'est un ViewSet
        if hasattr(url_pattern.callback, 'actions'):
            methods = list(url_pattern.callback.actions.keys())
    
    methods_str = ', '.join(methods).upper() if methods else 'GET'
    
    print(f"\n📍 Pattern: {pattern}")
    print(f"   Name: {name}")
    print(f"   Methods: {methods_str}")

print("\n" + "="*70)
print("EXPLICATION:")
print("="*70)
print("""
Le Router analyse votre ViewSet et trouve:

1. Type: ReadOnlyModelViewSet
   → Crée routes en lecture seule (GET uniquement)

2. Méthodes héritées:
   - list()     → GET /air-quality/
   - retrieve() → GET /air-quality/{id}/

3. Actions personnalisées (@action):
   - current()  → GET /air-quality/current/

TOTAL: 3 routes par ViewSet générées automatiquement !
""")
