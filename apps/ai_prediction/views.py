"""
API optimisée spécialement pour le modèle IA de prédiction
Combine météo, qualité air, capteurs et profil utilisateur
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, Max, Min, Q
from datetime import timedelta
from apps.environment.services.weather_service import WeatherService
from apps.environment.services.air_quality_service import AirQualityService
from apps.sensors.models import SensorData
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_prediction_data(request):
    """
    Endpoint unifié pour le modèle IA - Données complètes optimisées < 5s
    GET /api/v1/ai/prediction-data/
    """
    start_time = timezone.now()
    user = request.user
    
    try:
        # Paramètres
        hours_back = int(request.GET.get('hours', 24))
        city_override = request.GET.get('city')
        
        # Déterminer la ville
        city = city_override
        if not city and hasattr(user, 'profile') and user.profile.city:
            city = user.profile.city
        else:
            city = "Abidjan"  # Ville par défaut
        
        # Initialiser services avec timeout optimisé
        weather_service = WeatherService(timeout=3)  # 3s max
        air_service = AirQualityService(timeout=3)    # 3s max
        
        # 1. DONNÉES UTILISATEUR (instantané)
        user_profile = {
            "age": user.profile.age if hasattr(user, 'profile') else None,
            "gender": user.profile.gender if hasattr(user, 'profile') else None,
            "has_asthma": user.profile.has_asthma if hasattr(user, 'profile') else False,
            "city": city,
            "account_type": "premium" if user.is_staff else "free"
        }
        
        # 2. DONNÉES MÉTÉO (cache 10 min)
        try:
            weather_data = weather_service.get_weather_data(city)
            weather = {
                "temperature": weather_data.get('temperature'),
                "humidity": weather_data.get('humidity'), 
                "pressure": weather_data.get('pressure'),
                "wind_speed": weather_data.get('wind_speed'),
                "weather_condition": weather_data.get('weather_main'),
                "timestamp": weather_data.get('timestamp')
            }
        except Exception as e:
            logger.warning(f"Météo indisponible: {e}")
            weather = {
                "temperature": 25.0,  # Valeurs par défaut
                "humidity": 60,
                "pressure": 1013,
                "wind_speed": 5.0,
                "weather_condition": "Clear",
                "timestamp": timezone.now()
            }
        
        # 3. DONNÉES QUALITÉ AIR (cache 15 min)
        try:
            air_data = air_service.get_air_quality_data(city)
            air_quality = {
                "aqi": air_data.get('aqi'),
                "pm25": air_data.get('pollutants', {}).get('pm25'),
                "pm10": air_data.get('pollutants', {}).get('pm10'),
                "no2": air_data.get('pollutants', {}).get('no2'),
                "o3": air_data.get('pollutants', {}).get('o3'),
                "quality_level": air_data.get('quality_level'),
                "timestamp": air_data.get('timestamp')
            }
        except Exception as e:
            logger.warning(f"Qualité air indisponible: {e}")
            air_quality = {
                "aqi": 50,  # Valeurs par défaut "bon"
                "pm25": 10.0,
                "pm10": 15.0,
                "no2": 25.0,
                "o3": 60.0,
                "quality_level": "Good",
                "timestamp": timezone.now()
            }
        
        # 4. DONNÉES CAPTEURS RÉCENTES (optimisé avec index)
        end_time = timezone.now()
        start_time_sensors = end_time - timedelta(hours=hours_back)
        
        sensors_query = SensorData.objects.filter(
            user=user,
            timestamp__gte=start_time_sensors
        ).order_by('-timestamp')
        
        # Dernière valeur de chaque capteur
        latest_sensor = sensors_query.first()
        
        if latest_sensor:
            sensors_current = {
                "spo2": latest_sensor.spo2,
                "heart_rate": latest_sensor.heart_rate,
                "respiratory_rate": latest_sensor.respiratory_rate,
                "temperature_body": latest_sensor.temperature,
                "humidity_ambient": latest_sensor.humidity,
                "eco2": latest_sensor.eco2,
                "tvoc": latest_sensor.tvoc,
                "risk_score": latest_sensor.risk_score,
                "risk_level": latest_sensor.risk_level,
                "timestamp": latest_sensor.timestamp
            }
            
            # Statistiques sur la période
            stats = sensors_query.aggregate(
                avg_spo2=Avg('spo2'),
                min_spo2=Min('spo2'),
                max_spo2=Max('spo2'),
                avg_heart_rate=Avg('heart_rate'),
                max_heart_rate=Max('heart_rate'),
                avg_risk_score=Avg('risk_score')
            )
            
            sensors_trends = {
                "avg_spo2": round(stats['avg_spo2'], 1) if stats['avg_spo2'] else None,
                "min_spo2": stats['min_spo2'],
                "max_spo2": stats['max_spo2'],
                "avg_heart_rate": round(stats['avg_heart_rate'], 1) if stats['avg_heart_rate'] else None,
                "max_heart_rate": stats['max_heart_rate'],
                "avg_risk_score": round(stats['avg_risk_score'], 1) if stats['avg_risk_score'] else None,
                "total_readings": sensors_query.count()
            }
        else:
            sensors_current = {
                "spo2": None, "heart_rate": None, "respiratory_rate": None,
                "temperature_body": None, "humidity_ambient": None,
                "eco2": None, "tvoc": None,
                "risk_score": 0, "risk_level": "UNKNOWN",
                "timestamp": None
            }
            sensors_trends = {
                "avg_spo2": None, "min_spo2": None, "max_spo2": None,
                "avg_heart_rate": None, "max_heart_rate": None,
                "avg_risk_score": 0, "total_readings": 0
            }
        
        # 5. CONTEXTE TEMPOREL
        now = timezone.now()
        time_context = {
            "hour_of_day": now.hour,
            "day_of_week": now.weekday(),  # 0=Lundi, 6=Dimanche
            "is_weekend": now.weekday() >= 5,
            "season": get_season(now.month),
            "timestamp": now
        }
        
        # Calcul temps de réponse
        response_time = (timezone.now() - start_time).total_seconds()
        
        # Réponse unifiée pour l'IA
        response_data = {
            "meta": {
                "user_id": user.id,
                "response_time_seconds": round(response_time, 3),
                "data_freshness": {
                    "weather": "cached_10min",
                    "air_quality": "cached_15min", 
                    "sensors": f"last_{hours_back}h"
                },
                "timestamp": timezone.now()
            },
            
            "user_profile": user_profile,
            "environmental": {
                "weather": weather,
                "air_quality": air_quality,
                "location": {
                    "city": city,
                    "coordinates": get_city_coordinates(city)
                }
            },
            
            "sensors": {
                "current": sensors_current,
                "trends": sensors_trends,
                "period_hours": hours_back
            },
            
            "temporal_context": time_context,
            
            "prediction_features": {
                # Features pré-calculées pour l'IA
                "health_score": calculate_health_score(sensors_current, user_profile),
                "environmental_risk": calculate_environmental_risk(weather, air_quality),
                "combined_risk": calculate_combined_risk(sensors_current, weather, air_quality),
                "trend_direction": calculate_trend_direction(sensors_trends)
            }
        }
        
        logger.info(f"✅ AI API response: {response_time:.3f}s - User: {user.email}")
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"❌ AI API error: {e}")
        return Response({
            "error": "Service temporairement indisponible",
            "fallback_data": get_fallback_data(user),
            "timestamp": timezone.now()
        }, status=503)


def get_season(month):
    """Déterminer la saison"""
    if month in [12, 1, 2]:
        return "winter"
    elif month in [3, 4, 5]:
        return "spring"
    elif month in [6, 7, 8]:
        return "summer"
    else:
        return "autumn"


def get_city_coordinates(city):
    """Coordonnées approximatives des villes principales"""
    coords_map = {
        "Abidjan": {"lat": 5.36, "lon": -4.01},
        "Paris": {"lat": 48.86, "lon": 2.35},
        "London": {"lat": 51.51, "lon": -0.13},
        "New York": {"lat": 40.71, "lon": -74.01}
    }
    return coords_map.get(city, {"lat": 0, "lon": 0})


def calculate_health_score(sensors, profile):
    """Score de santé basé capteurs + profil"""
    if not sensors.get('spo2'):
        return 50  # Score neutre
    
    score = 100
    
    # SpO2 impact
    spo2 = sensors.get('spo2', 95)
    if spo2 < 90:
        score -= 50
    elif spo2 < 95:
        score -= 25
    
    # Fréquence cardiaque
    hr = sensors.get('heart_rate', 70)
    if hr < 50 or hr > 120:
        score -= 20
    
    # Asthme = plus sensible
    if profile.get('has_asthma'):
        score -= 10
    
    return max(0, min(100, score))


def calculate_environmental_risk(weather, air_quality):
    """Risque environnemental"""
    risk = 0
    
    # AQI impact
    aqi = air_quality.get('aqi', 50)
    if aqi > 150:
        risk += 40
    elif aqi > 100:
        risk += 25
    elif aqi > 50:
        risk += 10
    
    # Température extrême
    temp = weather.get('temperature', 25)
    if temp < 10 or temp > 35:
        risk += 15
    
    # Humidité
    humidity = weather.get('humidity', 50)
    if humidity > 85 or humidity < 30:
        risk += 10
    
    return min(100, risk)


def calculate_combined_risk(sensors, weather, air_quality):
    """Risque combiné global"""
    sensor_risk = sensors.get('risk_score', 0)
    env_risk = calculate_environmental_risk(weather, air_quality)
    
    # Moyenne pondérée
    combined = (sensor_risk * 0.7) + (env_risk * 0.3)
    return round(combined, 1)


def calculate_trend_direction(trends):
    """Direction de la tendance"""
    if not trends.get('avg_spo2'):
        return "stable"
    
    avg_spo2 = trends['avg_spo2']
    min_spo2 = trends.get('min_spo2', avg_spo2)
    
    if avg_spo2 > min_spo2 + 2:
        return "improving"
    elif avg_spo2 < min_spo2 - 2:
        return "declining"
    else:
        return "stable"


def get_fallback_data(user):
    """Données par défaut en cas d'erreur"""
    return {
        "user_profile": {
            "has_asthma": False,
            "city": "Abidjan"
        },
        "environmental": {
            "weather": {"temperature": 25, "humidity": 60},
            "air_quality": {"aqi": 50, "quality_level": "Good"}
        },
        "sensors": {
            "current": {"risk_level": "UNKNOWN", "risk_score": 0}
        },
        "prediction_features": {
            "health_score": 50,
            "environmental_risk": 25,
            "combined_risk": 35
        }
    }