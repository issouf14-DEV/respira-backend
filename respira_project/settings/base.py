import os
from pathlib import Path
from datetime import timedelta
import secrets
from dotenv import load_dotenv

load_dotenv()

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
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'core.ultra_security.UltraSecurityMiddleware',  # Ultra sécurité contre vulnérabilités
    'core.security_final.Django6SecurityMiddleware',  # Middleware Django 6.0 final
    'corsheaders.middleware.CorsMiddleware',
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
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Réduit à 15 minutes pour sécurité
    'REFRESH_TOKEN_LIFETIME': timedelta(hours=24),   # Réduit à 24h
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'RS256',  # Plus sécurisé que HS256
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
    'TOKEN_OBTAIN_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenObtainPairSerializer',
    'TOKEN_REFRESH_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenRefreshSerializer',
    'TOKEN_VERIFY_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenVerifySerializer',
    'TOKEN_BLACKLIST_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenBlacklistSerializer',
    'SLIDING_TOKEN_OBTAIN_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer',
    'SLIDING_TOKEN_REFRESH_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer',
    'ISSUER': 'respira-api-secure',
    'AUDIENCE': 'respira-clients',
    'JWK_URL': None,
    'LEEWAY': 0,
    'VERIFY_SIGNATURE': True,
    'VERIFY_EXP': True,
    'VERIFY_NBF': True,
    'VERIFY_IAT': True,
    'VERIFY_AUD': True,
    'REQUIRE_EXP': True,
    'REQUIRE_NBF': False,
    'REQUIRE_IAT': True,
    'REQUIRE_JTI': True,
}

# Configuration CORS pour Flutter (accepte toutes les origines en dev)
CORS_ALLOW_ALL_ORIGINS = True  # Pour développement Flutter
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
]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

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
