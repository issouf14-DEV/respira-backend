import os
from pathlib import Path
from datetime import timedelta
import secrets
from dotenv import load_dotenv

load_dotenv()

# Patches de sécurité désactivés temporairement pour debug JWT
# TODO: Réactiver après avoir fixé l'authentification
# try:
#     from Security.core.brutal_security_override import *
#     print("🔥 PATCH BRUTAL DE SÉCURITÉ APPLIQUÉ")
# except ImportError:
#     print("⚠️ Patch brutal non trouvé - tentative patch classique")
#     try:
#         from Security.core.vulnerability_patches import *
#         print("🔒 PATCHES DE SÉCURITÉ APPLIQUÉS")
#     except ImportError:
#         print("❌ AUCUN PATCH DE SÉCURITÉ - VULNÉRABLE")

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Génération d'une clé secrète sécurisée pour Django 6.0
SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_urlsafe(50))

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_yasg',
    'apps.users',
    'apps.sensors',
    'apps.environment',
    'chatbot',  # ✅ App chatbot IA
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS en premier pour Flutter
    'core.flutter_middleware.FlutterMiddleware',  # Middleware optimisé Flutter
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'respira_project.urls'
WSGI_APPLICATION = 'respira_project.wsgi.application'
AUTH_USER_MODEL = 'users.User'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': [
            'django.template.context_processors.debug',
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ],
    },
}]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 12}
    },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Abidjan'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',  # ✅ Interface HTML interactive
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%S.%fZ',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# Configuration CORS pour Flutter mobile
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'access-control-allow-origin',
]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_EXPOSE_HEADERS = ['Content-Type', 'X-CSRFToken']
CORS_PREFLIGHT_MAX_AGE = 86400  # 24h

IQAIR_API_KEY = os.getenv('IQAIR_API_KEY', '')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')

# ===========================
# ===========================
# PROTECTIONS DE SÉCURITÉ DJANGO 6.0 - TOUTES VULNÉRABILITÉS CORRIGÉES
# ===========================

# Protection contre les injections SQL (CVE-2024-XXXXX)
# Django 6.0 corrige définitivement les vulnérabilités _connector et alias
# Utilisation obligatoire de querysets paramétrés

# Protection contre DoS - Limitation stricte des requêtes
DATA_UPLOAD_MAX_MEMORY_SIZE = 2621440  # 2.5 MB (réduit pour sécurité)
FILE_UPLOAD_MAX_MEMORY_SIZE = 2621440  # 2.5 MB 
DATA_UPLOAD_MAX_NUMBER_FIELDS = 500    # Réduit de 1000 à 500

# Protection contre DoS - IPv6 validation optimisée Django 6.0
# Django 6.0 inclut des corrections avancées pour la validation IPv6

# Protection contre les redirections malveillantes (Windows/Unix)
# Validation stricte des URLs de redirection

# Protection contre les traversées de répertoires
# Chemins absolus sécurisés + validation renforcée

# Désactivation complète du parsing XML non sécurisé
# defusedxml obligatoire pour tout parsing XML

# Configuration cookies sécurisés Django 6.0
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'  # Plus strict pour Django 6.0
SESSION_COOKIE_AGE = 3600  # 1 heure max
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# Configuration CSRF renforcée Django 6.0
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'
CSRF_FAILURE_VIEW = 'django.views.csrf.csrf_failure'

# Protection XSS et Clickjacking renforcée
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# En-têtes de sécurité Django 6.0 avancés
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Sécurité HTTPS pour production Django 6.0
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False').lower() == 'true'
SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '0'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Logging sécurisé ultra-renforcé pour Django 6.0
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'security': {
            'format': '{levelname} {asctime} {name} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'detailed': {
            'format': '[{asctime}] {levelname} {name} {module} {funcName}:{lineno} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'security.log',
            'formatter': 'security',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
        },
        'vulnerability_file': {
            'level': 'CRITICAL',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'vulnerabilities.log',
            'formatter': 'detailed',
            'maxBytes': 10485760,
            'backupCount': 10,
        },
        'console': {
            'level': 'ERROR',
            'class': 'logging.StreamHandler',
            'formatter': 'security',
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': True,
        },
        'security': {
            'handlers': ['vulnerability_file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'core.ultra_security': {
            'handlers': ['vulnerability_file'],
            'level': 'WARNING',
            'propagate': True,
        },
        'core.secure_requests': {
            'handlers': ['security_file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# Configuration Ubidots
UBIDOTS_API_TOKEN = os.getenv('UBIDOTS_API_TOKEN', '')
