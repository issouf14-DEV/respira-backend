from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        # Appliquer le patch JWT ici pour éviter l'erreur 'Apps aren't loaded yet'
        try:
            from core.brutal_security_override import brutal_security_override
            brutal_security_override()
        except Exception as e:
            import warnings
            warnings.warn(f"Brutal security override failed in ready(): {e}")
