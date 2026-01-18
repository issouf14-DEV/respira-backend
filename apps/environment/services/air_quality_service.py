"""
Service pour la qualité de l'air - Optimisé pour IA
"""
from Security.core.secure_requests import get as secure_get
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class AirQualityService:
    """Service optimisé pour récupérer données qualité de l'air"""
    
    def __init__(self, timeout=5):
        self.api_key = settings.IQAIR_API_KEY
        self.base_url = "http://api.airvisual.com/v2"
        self.timeout = timeout  # Timeout optimisé pour IA
    
    def get_air_quality_data(self, city):
        """Récupérer données qualité air avec fallback"""
        if not self.api_key or self.api_key == 'your_key_here':
            return self._create_fallback_data(city)
        
        try:
            url = f"{self.base_url}/city"
            params = {
                'city': city,
                'state': '',
                'country': 'CI' if city.lower() == 'abidjan' else 'FR',
                'key': self.api_key
            }
            
            response = secure_get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            
            if data['status'] == 'success':
                pollution = data['data']['current']['pollution']
                weather = data['data']['current']['weather']
                
                return {
                    'aqi': pollution['aqius'],
                    'quality_level': self._get_quality_level(pollution['aqius']),
                    'main_pollutant': pollution.get('mainus', 'pm25'),
                    'pollutants': {
                        'pm25': pollution.get('aqius', 50),  # Utilise AQI comme approx
                        'pm10': pollution.get('aqius', 50) * 1.2,
                        'no2': 30.0,  # Valeurs approximatives
                        'o3': 60.0
                    },
                    'health_recommendations': self._get_health_recommendations(pollution['aqius']),
                    'temperature': weather.get('tp', 25),
                    'humidity': weather.get('hu', 60),
                    'timestamp': timezone.now()
                }
            else:
                return self._create_fallback_data(city)
                
        except Exception as e:
            logger.warning(f"AirQuality API error for {city}: {e}")
            return self._create_fallback_data(city)
    
    def _get_quality_level(self, aqi):
        """Convertir AQI en niveau de qualité"""
        if aqi <= 50:
            return "Good"
        elif aqi <= 100:
            return "Moderate"
        elif aqi <= 150:
            return "Unhealthy for Sensitive"
        elif aqi <= 200:
            return "Unhealthy"
        elif aqi <= 300:
            return "Very Unhealthy"
        else:
            return "Hazardous"
    
    def _get_health_recommendations(self, aqi):
        """Recommandations santé selon AQI"""
        if aqi <= 50:
            return ["Air quality is good. Normal outdoor activities recommended."]
        elif aqi <= 100:
            return ["Air quality is acceptable for most people.", "Sensitive individuals may experience minor irritation."]
        elif aqi <= 150:
            return ["Sensitive individuals should limit prolonged outdoor activities.", "General public not affected."]
        else:
            return ["Everyone should limit outdoor activities.", "Sensitive groups should avoid outdoor activities."]
    
    def _create_fallback_data(self, city):
        """Données par défaut si API indisponible"""
        import random
        
        base_aqi = 50 if city.lower() in ['abidjan', 'paris'] else 60
        aqi = random.randint(base_aqi - 10, base_aqi + 20)
        
        return {
            'aqi': aqi,
            'quality_level': self._get_quality_level(aqi),
            'main_pollutant': 'pm25',
            'pollutants': {
                'pm25': aqi * 0.5,
                'pm10': aqi * 0.7,
                'no2': 25.0,
                'o3': 55.0
            },
            'health_recommendations': self._get_health_recommendations(aqi),
            'temperature': 25.0,
            'humidity': 60,
            'timestamp': timezone.now(),
            'fallback': True
        }