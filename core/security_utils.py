"""
Utilitaires de sécurité supplémentaires pour protéger contre les vulnérabilités
Corrections pour les alertes GitHub Dependabot
"""
import re
from django.core.exceptions import ValidationError
from django.db import connection
import logging

logger = logging.getLogger('django.security')


class SQLInjectionProtection:
    """
    Protection contre les injections SQL
    Correction pour CVE-2024-XXXXX (Django SQL injection via _connector)
    """
    
    # Patterns dangereux à bloquer
    SQL_INJECTION_PATTERNS = [
        r'(\bUNION\b.*\bSELECT\b)',
        r'(\bOR\b.*=.*)',
        r'(\bAND\b.*=.*)',
        r'(--|#|/\*|\*/)',
        r'(\bDROP\b.*\bTABLE\b)',
        r'(\bINSERT\b.*\bINTO\b)',
        r'(\bUPDATE\b.*\bSET\b)',
        r'(\bDELETE\b.*\bFROM\b)',
        r'(\bEXEC\b|\bEXECUTE\b)',
        r'(xp_cmdshell)',
        r'(\bCAST\b.*\bAS\b)',
        r'(WAITFOR\s+DELAY)',
    ]
    
    @classmethod
    def validate_input(cls, value, field_name='input'):
        """
        Valider une entrée utilisateur contre les injections SQL
        
        Args:
            value: La valeur à valider
            field_name: Le nom du champ (pour les logs)
            
        Raises:
            ValidationError: Si une tentative d'injection est détectée
        """
        if not value:
            return value
            
        value_str = str(value).upper()
        
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_str, re.IGNORECASE):
                logger.critical(
                    f"Tentative d'injection SQL détectée dans {field_name}: {value[:50]}"
                )
                raise ValidationError(
                    f"Entrée invalide détectée dans {field_name}"
                )
        
        return value
    
    @classmethod
    def validate_queryset_params(cls, params_dict):
        """
        Valider les paramètres d'un queryset
        Protection spécifique contre l'exploitation de _connector
        
        Args:
            params_dict: Dictionnaire de paramètres du queryset
            
        Raises:
            ValidationError: Si des paramètres dangereux sont détectés
        """
        dangerous_keys = ['_connector', '__connector', 'connector']
        
        for key in params_dict.keys():
            # Bloquer les paramètres _connector
            if any(dangerous in key.lower() for dangerous in dangerous_keys):
                logger.critical(
                    f"Tentative d'exploitation _connector détectée: {key}"
                )
                raise ValidationError(
                    "Paramètre de requête non autorisé"
                )
            
            # Valider la valeur
            cls.validate_input(params_dict[key], key)
        
        return params_dict
    
    @classmethod
    def safe_column_alias(cls, alias):
        """
        Valider et nettoyer un alias de colonne
        Protection contre CVE-2024-XXXXX (SQL injection via column aliases)
        
        Args:
            alias: L'alias de colonne à valider
            
        Returns:
            L'alias nettoyé ou None si invalide
        """
        if not alias:
            return None
            
        # Autoriser seulement les caractères alphanumériques et underscore
        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', alias):
            logger.warning(
                f"Alias de colonne invalide détecté: {alias}"
            )
            raise ValidationError(
                "Alias de colonne invalide"
            )
        
        # Limiter la longueur
        if len(alias) > 64:
            raise ValidationError(
                "Alias de colonne trop long"
            )
        
        return alias


class InputSanitizer:
    """
    Nettoyage et validation des entrées utilisateur
    Protection contre diverses attaques par injection
    """
    
    @staticmethod
    def sanitize_filename(filename):
        """
        Nettoyer un nom de fichier
        Protection contre la traversée de répertoires (CVE-2024-XXXXX)
        """
        if not filename:
            return None
            
        # Supprimer les chemins relatifs et absolus
        filename = filename.replace('..', '').replace('/', '').replace('\\', '')
        
        # Autoriser seulement les caractères sûrs
        filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
        
        # Limiter la longueur
        if len(filename) > 255:
            filename = filename[:255]
        
        if not filename:
            raise ValidationError("Nom de fichier invalide")
            
        return filename
    
    @staticmethod
    def sanitize_url(url):
        """
        Valider et nettoyer une URL
        Protection contre les redirections malveillantes (CVE-2024-XXXXX)
        """
        from django.utils.http import url_has_allowed_host_and_scheme
        
        if not url:
            return None
        
        # Liste des hôtes autorisés (à configurer selon vos besoins)
        allowed_hosts = [
            'localhost',
            '127.0.0.1',
            'respira-api.com',  # Remplacez par votre domaine
        ]
        
        # Vérifier que l'URL est sûre
        is_safe = url_has_allowed_host_and_scheme(
            url, 
            allowed_hosts=set(allowed_hosts),
            require_https=True
        )
        
        if not is_safe:
            logger.warning(f"URL non autorisée détectée: {url}")
            raise ValidationError("URL non autorisée")
        
        return url
    
    @staticmethod
    def sanitize_ipv6(ipv6_address):
        """
        Valider une adresse IPv6
        Protection contre DoS via validation IPv6 (CVE-2024-XXXXX)
        """
        import ipaddress
        
        if not ipv6_address:
            return None
        
        try:
            # Utiliser le validateur Python (plus performant que Django < 5.1.5)
            addr = ipaddress.IPv6Address(ipv6_address)
            return str(addr)
        except (ipaddress.AddressValueError, ValueError) as e:
            logger.warning(f"Adresse IPv6 invalide: {ipv6_address}")
            raise ValidationError("Adresse IPv6 invalide")


class RateLimitProtection:
    """
    Protection contre les attaques par déni de service (DoS)
    Limitation du taux de requêtes
    """
    
    @staticmethod
    def check_rate_limit(user_identifier, endpoint, limit=60, period=60):
        """
        Vérifier la limite de taux pour un utilisateur/endpoint
        
        Args:
            user_identifier: Identifiant de l'utilisateur (ID, IP, etc.)
            endpoint: Nom de l'endpoint
            limit: Nombre maximum de requêtes
            period: Période en secondes
            
        Raises:
            ValidationError: Si la limite est dépassée
        """
        from django.core.cache import cache
        from django.utils import timezone
        
        cache_key = f"rate_limit:{user_identifier}:{endpoint}"
        
        # Obtenir le compteur actuel
        request_count = cache.get(cache_key, 0)
        
        if request_count >= limit:
            logger.warning(
                f"Rate limit dépassé: {user_identifier} sur {endpoint} "
                f"({request_count}/{limit})"
            )
            raise ValidationError(
                f"Trop de requêtes. Limite: {limit}/{period}s"
            )
        
        # Incrémenter le compteur
        cache.set(cache_key, request_count + 1, period)
        
        return True


class XMLSecurityHelper:
    """
    Protection contre les attaques via XML
    Correction pour CVE-2024-XXXXX (DoS via XML serializer)
    """
    
    @staticmethod
    def safe_xml_parse(xml_string, max_size=1048576):  # 1 MB max
        """
        Parser XML de manière sécurisée
        Utilise defusedxml pour éviter les attaques XXE et DoS
        
        Args:
            xml_string: Chaîne XML à parser
            max_size: Taille maximale en octets
            
        Returns:
            ElementTree parsé ou None si erreur
        """
        try:
            from defusedxml import ElementTree as DefusedET
        except ImportError:
            logger.error("defusedxml non installé - Parsing XML non sécurisé!")
            raise ImportError(
                "defusedxml requis pour le parsing XML sécurisé. "
                "Installez-le avec: pip install defusedxml"
            )
        
        # Vérifier la taille
        if len(xml_string) > max_size:
            logger.warning(f"XML trop volumineux: {len(xml_string)} octets")
            raise ValidationError(
                f"Document XML trop volumineux (max: {max_size} octets)"
            )
        
        try:
            # Parser avec defusedxml (protection XXE et bomb)
            tree = DefusedET.fromstring(xml_string)
            return tree
        except Exception as e:
            logger.error(f"Erreur parsing XML: {str(e)}")
            raise ValidationError("Document XML invalide")


class LogSecurityHelper:
    """
    Helper pour un logging sécurisé
    Protection contre l'injection de logs (CVE-2024-XXXXX)
    """
    
    @staticmethod
    def sanitize_log_message(message):
        """
        Nettoyer un message de log pour éviter l'injection
        
        Args:
            message: Message à nettoyer
            
        Returns:
            Message nettoyé
        """
        if not message:
            return ""
        
        # Supprimer les caractères de nouvelle ligne et de contrôle
        message = re.sub(r'[\n\r\t]', ' ', str(message))
        
        # Limiter la longueur
        if len(message) > 1000:
            message = message[:1000] + "..."
        
        return message
    
    @staticmethod
    def safe_log(logger_instance, level, message, **kwargs):
        """
        Logger de manière sécurisée
        
        Args:
            logger_instance: Instance du logger
            level: Niveau de log ('info', 'warning', 'error', etc.)
            message: Message à logger
            **kwargs: Arguments supplémentaires à logger
        """
        # Nettoyer le message
        clean_message = LogSecurityHelper.sanitize_log_message(message)
        
        # Nettoyer les kwargs
        clean_kwargs = {
            key: LogSecurityHelper.sanitize_log_message(value)
            for key, value in kwargs.items()
        }
        
        # Logger selon le niveau
        log_method = getattr(logger_instance, level, logger_instance.info)
        log_method(clean_message, extra=clean_kwargs)


# Décorateur pour protéger les vues contre les injections SQL
def protect_against_sql_injection(view_func):
    """
    Décorateur pour protéger une vue contre les injections SQL
    Valide tous les paramètres GET et POST
    """
    from functools import wraps
    
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Valider les paramètres GET
        for key, value in request.GET.items():
            try:
                SQLInjectionProtection.validate_input(value, f"GET.{key}")
            except ValidationError as e:
                from django.http import JsonResponse
                return JsonResponse(
                    {'error': str(e)},
                    status=400
                )
        
        # Valider les paramètres POST
        for key, value in request.POST.items():
            try:
                SQLInjectionProtection.validate_input(value, f"POST.{key}")
            except ValidationError as e:
                from django.http import JsonResponse
                return JsonResponse(
                    {'error': str(e)},
                    status=400
                )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper
