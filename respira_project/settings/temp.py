from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']

# Base de données temporaire SQLite pour les migrations
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db_temp.sqlite3',
    }
}