"""
Middleware optimisé pour Flutter mobile
"""


class FlutterMiddleware:
    """
    Middleware pour faciliter les requêtes depuis Flutter mobile
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Ajouter des en-têtes CORS pour Flutter
        response = self.get_response(request)
        
        # Permettre les requêtes cross-origin depuis Flutter
        if request.method == 'OPTIONS':
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-CSRFToken'
            response['Access-Control-Max-Age'] = '86400'
        
        # Autoriser les credentials
        if 'HTTP_ORIGIN' in request.META:
            response['Access-Control-Allow-Credentials'] = 'true'
        
        return response
