"""
Wrapper sécurisé pour les requêtes HTTP
Protection contre la vulnérabilité .netrc de requests
"""
import requests
import os
import tempfile
from urllib.parse import urlparse

class SecureRequests:
    """
    Wrapper sécurisé pour requests qui désactive .netrc et autres vulnérabilités
    """
    
    @staticmethod
    def _create_secure_session():
        """Crée une session sécurisée sans accès aux fichiers de credentials"""
        session = requests.Session()
        
        # Désactiver complètement l'accès aux fichiers .netrc
        session.trust_env = False
        
        # Headers de sécurité par défaut
        session.headers.update({
            'User-Agent': 'RespiraAPI/1.0 (Security-Hardened)',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        })
        
        return session
    
    @classmethod
    def get(cls, url, **kwargs):
        """GET sécurisé"""
        return cls._secure_request('GET', url, **kwargs)
    
    @classmethod
    def post(cls, url, **kwargs):
        """POST sécurisé"""
        return cls._secure_request('POST', url, **kwargs)
    
    @classmethod
    def put(cls, url, **kwargs):
        """PUT sécurisé"""
        return cls._secure_request('PUT', url, **kwargs)
    
    @classmethod
    def delete(cls, url, **kwargs):
        """DELETE sécurisé"""
        return cls._secure_request('DELETE', url, **kwargs)
    
    @classmethod
    def _secure_request(cls, method, url, **kwargs):
        """
        Effectue une requête HTTP sécurisée
        """
        # Validation de l'URL
        if not cls._is_safe_url(url):
            raise ValueError(f"URL non autorisée: {url}")
        
        # Création d'une session sécurisée
        session = cls._create_secure_session()
        
        # Configuration sécurisée
        kwargs.setdefault('timeout', 30)  # Timeout de 30 secondes
        kwargs.setdefault('verify', True)  # Toujours vérifier SSL
        kwargs.setdefault('allow_redirects', False)  # Pas de redirections automatiques
        
        # Suppression des variables d'environnement dangereuses temporairement
        original_env = {}
        dangerous_env_vars = ['HOME', 'USERPROFILE', 'HTTP_PROXY', 'HTTPS_PROXY']
        
        try:
            # Sauvegarder et supprimer les variables dangereuses
            for var in dangerous_env_vars:
                if var in os.environ:
                    original_env[var] = os.environ[var]
                    del os.environ[var]
            
            # Créer un répertoire temporaire isolé
            with tempfile.TemporaryDirectory() as temp_dir:
                # Pointer HOME vers le répertoire temporaire vide
                os.environ['HOME'] = temp_dir
                os.environ['USERPROFILE'] = temp_dir
                
                # Effectuer la requête
                response = session.request(method, url, **kwargs)
                
        finally:
            # Restaurer les variables d'environnement
            for var, value in original_env.items():
                os.environ[var] = value
            
            # Nettoyer les variables temporaires
            for var in ['HOME', 'USERPROFILE']:
                if var not in original_env and var in os.environ:
                    del os.environ[var]
        
        return response
    
    @staticmethod
    def _is_safe_url(url):
        """
        Valide que l'URL est sûre
        """
        try:
            parsed = urlparse(url)
            
            # Vérifier le schéma
            if parsed.scheme not in ['http', 'https']:
                return False
            
            # Bloquer les IPs locales/privées en production
            hostname = parsed.hostname
            if hostname:
                # Bloquer localhost, IPs privées, etc.
                blocked_hosts = [
                    'localhost',
                    '127.',
                    '192.168.',
                    '10.',
                    '172.16.',
                    '172.17.',
                    '172.18.',
                    '172.19.',
                    '172.20.',
                    '172.21.',
                    '172.22.',
                    '172.23.',
                    '172.24.',
                    '172.25.',
                    '172.26.',
                    '172.27.',
                    '172.28.',
                    '172.29.',
                    '172.30.',
                    '172.31.',
                    '169.254.',  # Link-local
                    '::1',       # IPv6 localhost
                ]
                
                for blocked in blocked_hosts:
                    if hostname.startswith(blocked):
                        return False
            
            return True
            
        except Exception:
            return False


# Wrapper global pour remplacer requests dans l'application
def get(*args, **kwargs):
    return SecureRequests.get(*args, **kwargs)

def post(*args, **kwargs):
    return SecureRequests.post(*args, **kwargs)

def put(*args, **kwargs):
    return SecureRequests.put(*args, **kwargs)

def delete(*args, **kwargs):
    return SecureRequests.delete(*args, **kwargs)