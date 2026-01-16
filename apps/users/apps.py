from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        # Patches de sécurité désactivés - causent erreur JWT
        # TODO: Réactiver après correction
        pass
