"""
Validateurs de sécurité pour les données capteurs
"""
from rest_framework import serializers
from django.core.exceptions import ValidationError

class SensorDataValidator:
    """Validateur de sécurité pour les données capteurs"""
    
    @staticmethod
    def validate_spo2(value):
        """Valider SpO2 - Critique pour la sécurité sanitaire"""
        if value is not None:
            if not (70 <= value <= 100):
                raise ValidationError(f"SpO2 invalide: {value}%. Doit être entre 70-100%")
            if value < 85:
                # Log critique - SpO2 dangereux
                import logging
                logger = logging.getLogger('django.security')
                logger.critical(f"SpO2 critique détectée: {value}% - Alerte médicale requise")
        return value
    
    @staticmethod
    def validate_respiratory_rate(value):
        """Valider fréquence respiratoire - Critique"""
        if value is not None:
            if not (5 <= value <= 60):
                raise ValidationError(f"Fréquence respiratoire invalide: {value}/min. Doit être entre 5-60/min")
            if value < 8 or value > 40:
                import logging
                logger = logging.getLogger('django.security')
                logger.warning(f"Fréquence respiratoire anormale: {value}/min")
        return value
    
    @staticmethod
    def validate_heart_rate(value):
        """Valider fréquence cardiaque"""
        if value is not None:
            if not (30 <= value <= 250):
                raise ValidationError(f"Fréquence cardiaque invalide: {value} bpm. Doit être entre 30-250 bpm")
            if value < 40 or value > 200:
                import logging
                logger = logging.getLogger('django.security')
                logger.warning(f"Fréquence cardiaque anormale: {value} bpm")
        return value
    
    @staticmethod
    def validate_aqi(value):
        """Valider AQI"""
        if value is not None:
            if not (0 <= value <= 500):
                raise ValidationError(f"AQI invalide: {value}. Doit être entre 0-500")
            if value > 300:
                import logging
                logger = logging.getLogger('django.security')
                logger.critical(f"AQI dangereux: {value} - Alerte environnementale")
        return value
    
    @staticmethod
    def validate_temperature(value):
        """Valider température corporelle"""
        if value is not None:
            if not (30.0 <= value <= 45.0):
                raise ValidationError(f"Température invalide: {value}°C. Doit être entre 30-45°C")
            if value < 35.0 or value > 42.0:
                import logging
                logger = logging.getLogger('django.security')
                logger.warning(f"Température corporelle anormale: {value}°C")
        return value
    
    @staticmethod
    def validate_humidity(value):
        """Valider humidité - DHT11"""
        if value is not None:
            if not (0 <= value <= 100):
                raise ValidationError(f"Humidité invalide: {value}%. Doit être entre 0-100%")
        return value
    
    @staticmethod
    def validate_eco2(value):
        """Valider eCO2 - CJMCU-811"""
        if value is not None:
            if not (350 <= value <= 8192):  # Plage typique CJMCU-811
                raise ValidationError(f"eCO2 invalide: {value}ppm. Doit être entre 350-8192ppm")
            if value > 5000:
                import logging
                logger = logging.getLogger('django.security')
                logger.warning(f"eCO2 très élevé: {value}ppm - Ventilation requise")
        return value
    
    @staticmethod
    def validate_tvoc(value):
        """Valider TVOC - CJMCU-811"""
        if value is not None:
            if not (0 <= value <= 60000):  # Plage typique CJMCU-811
                raise ValidationError(f"TVOC invalide: {value}ppb. Doit être entre 0-60000ppb")
            if value > 3300:  # Seuil d'alerte TVOC
                import logging
                logger = logging.getLogger('django.security')
                logger.warning(f"TVOC élevé: {value}ppb - Qualité d'air dégradée")
        return value
    
    @staticmethod
    def validate_data_integrity(data):
        """Valider l'intégrité globale des données"""
        # Vérifier la cohérence entre les métriques médicales
        spo2 = data.get('spo2')
        heart_rate = data.get('heart_rate')
        respiratory_rate = data.get('respiratory_rate')
        
        # Vérifier la cohérence environnementale
        eco2 = data.get('eco2')
        tvoc = data.get('tvoc')
        temperature = data.get('temperature')
        humidity = data.get('humidity')
        
        # Détection d'anomalies médicales corrélées
        if spo2 and heart_rate and respiratory_rate:
            if spo2 < 90 and heart_rate < 60 and respiratory_rate > 30:
                import logging
                logger = logging.getLogger('django.security')
                logger.critical("Combinaison de valeurs médicales suspecte - Possible urgence médicale")
        
        # Cohérence capteurs environnementaux Ubidots
        if eco2 and tvoc:
            # eCO2 et TVOC doivent être corrélés
            if eco2 > 2000 and tvoc < 200:
                import logging
                logger = logging.getLogger('django.security')
                logger.warning("Incohérence eCO2/TVOC détectée - Vérifier capteur CJMCU-811")
        
        return data


class APISecurityValidator:
    """Validateur de sécurité pour les API"""
    
    @staticmethod
    def validate_request_frequency(user, endpoint):
        """Valider la fréquence des requêtes"""
        from django.utils import timezone
        from datetime import timedelta
        from django.core.cache import cache
        
        now = timezone.now()
        cache_key = f"api_freq_{user.id}_{endpoint}"
        
        # Obtenir les requêtes de la dernière minute
        requests = cache.get(cache_key, [])
        
        # Nettoyer les requêtes anciennes
        minute_ago = now - timedelta(minutes=1)
        requests = [req_time for req_time in requests if req_time > minute_ago]
        
        # Limites par endpoint
        limits = {
            'sensor_data': 60,  # 60 requêtes/minute max pour données capteurs
            'alerts': 30,       # 30 requêtes/minute pour alertes
            'stats': 10,        # 10 requêtes/minute pour stats
            'health_summary': 5 # 5 requêtes/minute pour résumé santé
        }
        
        limit = limits.get(endpoint, 20)  # Limite par défaut
        
        if len(requests) >= limit:
            import logging
            logger = logging.getLogger('django.security')
            logger.warning(f"Rate limit dépassé pour {user.email} sur {endpoint}: {len(requests)}/{limit}")
            raise ValidationError(f"Limite de fréquence dépassée pour {endpoint}")
        
        # Ajouter cette requête
        requests.append(now)
        cache.set(cache_key, requests, 60)  # Cache 1 minute
        
        return True
    
    @staticmethod
    def validate_sensitive_data_access(user, data_type):
        """Valider l'accès aux données sensibles"""
        sensitive_types = ['health_summary', 'critical_alerts', 'medical_data']
        
        if data_type in sensitive_types:
            # Log l'accès aux données sensibles
            import logging
            logger = logging.getLogger('django.security')
            logger.info(f"Accès données sensibles: {user.email} -> {data_type}")
            
            # Vérifier que l'utilisateur a les permissions appropriées
            if not user.is_active:
                raise ValidationError("Compte utilisateur non actif")
                
        return True


class DataEncryptionHelper:
    """Helper pour le chiffrement des données sensibles"""
    
    @staticmethod
    def encrypt_sensitive_field(value):
        """Chiffrer un champ sensible (placeholder - implémentez selon vos besoins)"""
        if not value:
            return value
            
        # TODO: Implémenter le chiffrement réel avec cryptography
        # from cryptography.fernet import Fernet
        # return encrypted_value
        
        return value  # Pour l'instant, retourne la valeur non chiffrée
    
    @staticmethod
    def hash_user_identifier(user_id):
        """Hasher un identifiant utilisateur pour les logs"""
        import hashlib
        return hashlib.sha256(str(user_id).encode()).hexdigest()[:8]


class SecurityMiddleware:
    """Middleware de sécurité pour les APIs médicales"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Pré-traitement sécurisé
        if request.path.startswith('/api/v1/sensors/'):
            self._check_medical_api_security(request)
            
        response = self.get_response(request)
        
        # Post-traitement sécurisé
        if request.path.startswith('/api/v1/sensors/'):
            self._log_medical_api_access(request, response)
            
        return response
    
    def _check_medical_api_security(self, request):
        """Vérifications de sécurité spécifiques aux APIs médicales"""
        if request.user.is_authenticated:
            # Log d'accès aux données médicales
            import logging
            logger = logging.getLogger('django.security')
            hashed_user = DataEncryptionHelper.hash_user_identifier(request.user.id)
            logger.info(f"Accès API médicale: User#{hashed_user} -> {request.path}")
    
    def _log_medical_api_access(self, request, response):
        """Logger les accès aux données médicales pour audit"""
        if response.status_code >= 400:
            import logging
            logger = logging.getLogger('django.security')
            hashed_user = DataEncryptionHelper.hash_user_identifier(request.user.id) if request.user.is_authenticated else "Anonymous"
            logger.warning(f"Échec API médicale: User#{hashed_user} -> {request.path} (Status: {response.status_code})")