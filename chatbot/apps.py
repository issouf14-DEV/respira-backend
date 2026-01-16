from django.apps import AppConfig


class ChatbotConfig(AppConfig):
    """Configuration de l'application Chatbot"""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chatbot'
    verbose_name = 'Chatbot Asthme'
    
    def ready(self):
        """Code à exécuter au démarrage de l'application"""
        # Importer les signals si vous en avez
        # import chatbot.signals
        
        # Vérifier que la clé API Gemini est configurée
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        
        if not os.getenv("GEMINI_API_KEY"):
            import warnings
            warnings.warn(
                "⚠️ GEMINI_API_KEY n'est pas définie dans le fichier .env ! "
                "Le chatbot ne fonctionnera pas correctement.",
                RuntimeWarning
            )
        else:
            print("✅ Chatbot Asthme initialisé avec succès")