"""
Middleware de sécurité personnalisé pour Respira API
"""
import logging
from django.http import HttpResponseForbidden
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger('django.security')

class SecurityMiddleware:
    """
    Middleware personnalisé pour renforcer la sécurité de l'API
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.blocked_ips = set()
        self.rate_limit_cache = {}

    def __call__(self, request):
        # Vérifier l'IP bloquée
        client_ip = self.get_client_ip(request)
        if client_ip in self.blocked_ips:
            logger.warning(f"Blocked IP attempted access: {client_ip}")
            return HttpResponseForbidden("Access denied")
        
        # Vérifier les en-têtes suspects
        if self.has_suspicious_headers(request):
            logger.warning(f"Suspicious headers from {client_ip}: {request.META}")
            return HttpResponseForbidden("Suspicious request")
        
        # Continuer le traitement
        response = self.get_response(request)
        
        # Ajouter des en-têtes de sécurité
        response = self.add_security_headers(response)
        
        return response

    def get_client_ip(self, request):
        """Obtenir l'IP réelle du client"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def has_suspicious_headers(self, request):
        """Détecter les en-têtes suspects"""
        suspicious_patterns = [
            'script', 'javascript:', 'vbscript:', 'onload=', 'onerror=',
            '<script', '</script>', 'eval(', 'document.cookie'
        ]
        
        # Vérifier les en-têtes courants
        headers_to_check = [
            'HTTP_USER_AGENT', 'HTTP_REFERER', 'HTTP_X_FORWARDED_FOR'
        ]
        
        for header in headers_to_check:
            value = request.META.get(header, '').lower()
            if any(pattern in value for pattern in suspicious_patterns):
                return True
        
        return False

    def add_security_headers(self, response):
        """Ajouter des en-têtes de sécurité à la réponse"""
        security_headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Resource-Policy': 'cross-origin'
        }
        
        for header, value in security_headers.items():
            response[header] = value
        
        return response


class APIRateLimitMiddleware:
    """
    Middleware simple de limitation de taux pour l'API
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_cache = {}
    
    def __call__(self, request):
        if not self.check_rate_limit(request):
            logger.warning(f"Rate limit exceeded for {self.get_client_ip(request)}")
            return HttpResponseForbidden("Rate limit exceeded")
        
        return self.get_response(request)
    
    def get_client_ip(self, request):
        """Obtenir l'IP réelle du client"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def check_rate_limit(self, request):
        """Vérifier si la limite de taux est respectée"""
        import time
        
        client_ip = self.get_client_ip(request)
        current_time = time.time()
        
        # Nettoyer les anciennes entrées (plus de 1 minute)
        self.rate_cache = {
            ip: times for ip, times in self.rate_cache.items()
            if any(t > current_time - 60 for t in times)
        }
        
        # Vérifier les requêtes de cette IP
        if client_ip not in self.rate_cache:
            self.rate_cache[client_ip] = []
        
        # Filtrer les requêtes de la dernière minute
        recent_requests = [
            t for t in self.rate_cache[client_ip]
            if t > current_time - 60
        ]
        
        # Limiter à 100 requêtes par minute par IP
        if len(recent_requests) >= 100:
            return False
        
        # Ajouter cette requête
        recent_requests.append(current_time)
        self.rate_cache[client_ip] = recent_requests
        
        return True