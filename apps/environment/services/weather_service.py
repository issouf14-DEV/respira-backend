import requests
from django.conf import settings
from django.utils import timezone
from ..models import Weather

class WeatherService:
    """Service pour récupérer les données météo depuis OpenWeatherMap API"""
    
    BASE_URL = "http://api.openweathermap.org/data/2.5"
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
    
    def get_city_weather(self, city='Abidjan'):
        """Récupère la météo pour une ville donnée"""
        if not self.api_key or self.api_key == 'your_key_here':
            # Retourne des données simulées si pas de clé API
            return self._create_mock_data(city)
        
        try:
            url = f"{self.BASE_URL}/weather"
            params = {
                'q': city,
                'appid': self.api_key,
                'units': 'metric',
                'lang': 'fr'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return self._parse_response(data, city)
                
        except Exception as e:
            print(f"Erreur OpenWeather API: {e}")
            return self._create_mock_data(city)
    
    def _parse_response(self, data, city):
        """Parse la réponse de l'API OpenWeatherMap"""
        weather = Weather.objects.create(
            city=city,
            timestamp=timezone.now(),
            temperature=data['main']['temp'],
            humidity=data['main']['humidity'],
            description=data['weather'][0]['description'] if data['weather'] else 'Clair'
        )
        
        return weather
    
    def _create_mock_data(self, city):
        """Crée des données simulées pour le développement"""
        import random
        
        descriptions = ['Ensoleillé', 'Nuageux', 'Partiellement nuageux', 'Clair']
        
        weather = Weather.objects.create(
            city=city,
            timestamp=timezone.now(),
            temperature=random.uniform(25, 32),
            humidity=random.randint(60, 85),
            description=random.choice(descriptions)
        )
        
        return weather
