from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']

# Configuration PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'respira_db'),
        'USER': os.getenv('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# ✅ Configuration API Chatbot IA (OpenAI ou Anthropic)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')  # sk-...
# ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')  # Alternative: Claude
