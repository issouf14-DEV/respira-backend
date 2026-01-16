from Security.core.secure_requests import get as secure_get
from django.conf import settings
from django.utils import timezone
from ..models import AirQuality

class IQAirService:
    """Service pour récupérer les données de qualité de l'air depuis IQAir API"""
    
    BASE_URL = "http://api.airvisual.com/v2"
    
    def __init__(self):
        self.api_key = settings.IQAIR_API_KEY
    
    def get_city_air_quality(self, city='Abidjan', country='Cote d\'Ivoire'):
        """Récupère la qualité de l'air pour une ville donnée"""
        if not self.api_key or self.api_key == 'your_key_here':
            # Retourne des données simulées si pas de clé API
            return self._create_mock_data(city)
        
        try:
            url = f"{self.BASE_URL}/city"
            params = {
                'city': city,
                'country': country,
                'key': self.api_key
            }
            
            response = secure_get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('status') == 'success':
                return self._parse_response(data['data'], city)
            else:
                return self._create_mock_data(city)
                
        except Exception as e:
            print(f"Erreur IQAir API: {e}")
            return self._create_mock_data(city)
    
    def _parse_response(self, data, city):
        """Parse la réponse de l'API IQAir"""
        pollution = data.get('current', {}).get('pollution', {})
        aqi = pollution.get('aqius', 50)
        
        # Déterminer le niveau de qualité de l'air
        if aqi <= 50:
            aqi_level = 'GOOD'
        elif aqi <= 100:
            aqi_level = 'MODERATE'
        else:
            aqi_level = 'UNHEALTHY'
        
        air_quality = AirQuality.objects.create(
            city=city,
            timestamp=timezone.now(),
            aqi=aqi,
            aqi_level=aqi_level,
            pm25=pollution.get('p2', {}).get('conc', 0)
        )
        
        return air_quality
    
    def _create_mock_data(self, city):
        """Crée des données simulées pour le développement"""
        import random
        
        aqi = random.randint(30, 80)
        aqi_level = 'GOOD' if aqi <= 50 else 'MODERATE'
        
        air_quality = AirQuality.objects.create(
            city=city,
            timestamp=timezone.now(),
            aqi=aqi,
            aqi_level=aqi_level,
            pm25=random.uniform(10, 35)
        )
        
        return air_quality
