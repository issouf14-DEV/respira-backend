# Type stubs pour éviter les erreurs Pylance
# Ce fichier aide l'IDE à comprendre les imports Django

# Django core
from typing import Any, Optional, Dict, List, Union

class ValidationError(Exception):
    """Exception pour les erreurs de validation"""
    pass

class HttpResponse:
    """Stub pour HttpResponse"""
    def __init__(self, content: str = "", status: int = 200, content_type: str = "text/html"):
        self.status_code = status
        self.content = content

class JsonResponse(HttpResponse):
    """Stub pour JsonResponse"""
    def __init__(self, data: Dict[str, Any], status: int = 200):
        super().__init__(content=str(data), status=status, content_type="application/json")

# Django utils
class timezone:
    @staticmethod
    def now():
        from datetime import datetime
        return datetime.now()

# Cache stub
class cache:
    @staticmethod
    def get(key: str, default: Any = None) -> Any:
        return default
    
    @staticmethod
    def set(key: str, value: Any, timeout: int = 300) -> None:
        pass

# URL validation
def url_has_allowed_host_and_scheme(url: str, allowed_hosts: Optional[set] = None, require_https: bool = False) -> bool:
    """Stub pour url_has_allowed_host_and_scheme"""
    return True

# Django version info
VERSION = (6, 0, 0, 'final', 0)

# defusedxml stub
class ElementTree:
    @staticmethod
    def fromstring(xml_string: str) -> Any:
        """Stub pour defusedxml ElementTree"""
        return None