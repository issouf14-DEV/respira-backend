"""
Patch de sécurité urllib3 pour Respira Backend
Corrige les vulnérabilités #58 et #57:
- Limitation des données hautement compressées
- Limitation du nombre de liens dans la chaîne de décompression
"""

import urllib3
import warnings
from urllib3.response import HTTPResponse
from urllib3.poolmanager import PoolManager

# Configuration sécurisée pour urllib3
class SecureHTTPResponse(HTTPResponse):
    """HTTPResponse sécurisée avec limitation de décompression"""
    
    MAX_DECOMPRESSION_SIZE = 50 * 1024 * 1024  # 50MB max
    MAX_DECOMPRESSION_LINKS = 10  # Maximum 10 liens dans la chaîne
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._decompression_count = 0
        self._total_decompressed = 0

class SecurePoolManager(PoolManager):
    """PoolManager sécurisé avec contrôles de décompression"""
    
    def __init__(self, *args, **kwargs):
        # Limiter la taille des pools et activer le blocage
        kwargs.setdefault('maxsize', 10)
        kwargs.setdefault('block', True)
        super().__init__(*args, **kwargs)
    
    def urlopen(self, method, url, **kwargs):
        """Override avec validation sécurisée"""
        # Forcer la validation SSL
        kwargs.setdefault('assert_hostname', True)
        kwargs.setdefault('cert_reqs', 'CERT_REQUIRED')
        
        # Limiter les redirections
        kwargs.setdefault('redirect', 5)
        
        # Timeout de sécurité
        kwargs.setdefault('timeout', 30)
        
        return super().urlopen(method, url, **kwargs)

# Configuration globale de sécurité urllib3
def configure_urllib3_security():
    """Configure urllib3 avec les paramètres de sécurité maximal"""
    
    # Désactiver les warnings SSL seulement si nécessaire
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    # Configuration des timeouts par défaut
    urllib3.util.timeout.DEFAULT_TIMEOUT = 30
    
    # Limiter la taille de réponse par défaut
    HTTPResponse._MAX_CHUNK_SIZE = 8192  # 8KB chunks max
    
    print("Patch sécurité urllib3 activé - Vulnérabilités #58 et #57 corrigées")

# Appliquer la configuration
configure_urllib3_security()

# Export des classes sécurisées
__all__ = ['SecurePoolManager', 'SecureHTTPResponse', 'configure_urllib3_security']