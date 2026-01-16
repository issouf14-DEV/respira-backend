"""
Middleware de sécurité ultra-renforcé pour Django 6.0
Protection contre les vulnérabilités détectées par Dependabot
"""
import logging
import re
from django.conf import settings
from django.http import HttpResponseForbidden
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('security')

class UltraSecurityMiddleware(MiddlewareMixin):
    """
    Middleware ultra-sécurisé pour protéger contre :
    - Fuites d'identifiants .netrc
    - Gestion incorrecte des privilèges JWT
    - Attaques par injection
    - Tentatives d'accès malveillants
    """
    
    # Patterns d'URLs malveillantes à bloquer
    MALICIOUS_PATTERNS = [
        r'\.netrc',
        r'passwd',
        r'shadow',
        r'\.env',
        r'\.git',
        r'\.ssh',
        r'config\.ini',
        r'\.aws',
        r'\.docker',
        r'admin/admin',
        r'phpmyadmin',
        r'wp-admin',
        r'\.php',
        r'\.jsp',
        r'\.asp',
        r'shell',
        r'backdoor',
        r'eval\(',
        r'exec\(',
        r'system\(',
        r'<script',
        r'javascript:',
        r'vbscript:',
        r'onload=',
        r'onerror=',
    ]
    
    # Headers suspects
    SUSPICIOUS_HEADERS = [
        'X-Forwarded-Host',
        'X-Original-URL', 
        'X-Rewrite-URL',
        'X-Real-IP',
    ]
    
    # User agents suspects
    SUSPICIOUS_USER_AGENTS = [
        'sqlmap',
        'nikto',
        'nessus',
        'burp',
        'masscan',
        'nmap',
        'gobuster',
        'dirb',
        'wget',
        'curl',  # En production, on peut bloquer curl
        'python-requests',  # Sauf si on l'utilise légitimement
        'bot',
        'crawler',
        'spider',
        'scanner',
    ]

    def __init__(self, get_response):
        super().__init__(get_response)
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) 
                                for pattern in self.MALICIOUS_PATTERNS]

    def process_request(self, request):
        """
        Analyse la requête pour détecter les tentatives malveillantes
        """
        # 1. Vérification des patterns malveillants dans l'URL
        if self._check_malicious_url(request.path_info):
            logger.warning(f"Tentative d'accès malveillant bloquée: {request.path_info}")
            return HttpResponseForbidden("Accès interdit - URL suspecte détectée")
        
        # 2. Vérification des headers suspects
        if self._check_suspicious_headers(request):
            logger.warning(f"Headers suspects détectés: {request.META}")
            return HttpResponseForbidden("Accès interdit - Headers suspects")
        
        # 3. Vérification du User-Agent
        if self._check_suspicious_user_agent(request):
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            logger.warning(f"User-Agent suspect bloqué: {user_agent}")
            return HttpResponseForbidden("Accès interdit - User-Agent suspect")
        
        # 4. Protection contre les tentatives de JWT privilege escalation
        if self._check_jwt_privilege_escalation(request):
            logger.critical("Tentative d'escalation de privilèges JWT détectée")
            return HttpResponseForbidden("Accès interdit - Tentative d'escalation de privilèges")
        
        # 5. Validation de la taille des requêtes
        if self._check_request_size(request):
            logger.warning("Requête trop volumineuse bloquée")
            return HttpResponseForbidden("Accès interdit - Requête trop volumineuse")
        
        return None

    def _check_malicious_url(self, path):
        """Vérifie si l'URL contient des patterns malveillants"""
        for pattern in self.compiled_patterns:
            if pattern.search(path):
                return True
        return False

    def _check_suspicious_headers(self, request):
        """Vérifie la présence de headers suspects"""
        for header in self.SUSPICIOUS_HEADERS:
            header_key = f"HTTP_{header.replace('-', '_').upper()}"
            if header_key in request.META:
                return True
        return False

    def _check_suspicious_user_agent(self, request):
        """Vérifie si le User-Agent est suspect"""
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        if not user_agent:
            return True  # Pas de User-Agent = suspect
        
        for suspicious_agent in self.SUSPICIOUS_USER_AGENTS:
            if suspicious_agent in user_agent:
                return True
        return False

    def _check_jwt_privilege_escalation(self, request):
        """
        Détecte les tentatives d'escalation de privilèges JWT
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return False
        
        # Vérification de patterns suspects dans le token
        suspicious_jwt_patterns = [
            'admin',
            'superuser', 
            'root',
            'is_staff',
            'is_superuser',
            'groups',
            'permissions',
            'exp":999',  # Expiration très lointaine
            '"alg":"none"',  # Algorithme none = vulnérabilité
        ]
        
        for pattern in suspicious_jwt_patterns:
            if pattern in auth_header:
                return True
        
        return False

    def _check_request_size(self, request):
        """Limite la taille des requêtes pour éviter les attaques DoS"""
        content_length = request.META.get('CONTENT_LENGTH')
        if content_length:
            try:
                size = int(content_length)
                # Limite à 10MB
                if size > 10 * 1024 * 1024:
                    return True
            except ValueError:
                return True
        return False

    def process_response(self, request, response):
        """Ajoute des headers de sécurité à la réponse"""
        # Headers de sécurité supplémentaires
        security_headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';",
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Resource-Policy': 'same-origin',
        }
        
        for header, value in security_headers.items():
            response[header] = value
        
        # Supprimer les headers qui révèlent des informations
        headers_to_remove = ['Server', 'X-Powered-By', 'Via']
        for header in headers_to_remove:
            if header in response:
                del response[header]
        
        return response