from django.db import models
from django.conf import settings

class ChatbotService:
    """Service principal du chatbot"""
    
    def __init__(self, user):
        self.user = user
    
    def detect_provider(self, text):
        """Détecte le provider (pas nécessaire pour l'asthme)"""
        return "openai"
    
    def send_message(self, message, conversation_history=None):
        """Envoie un message au chatbot"""
        from .services.chatbot_service import asthma_chat_advanced
        
        # Convertir l'historique Django en format pour Gemini
        if conversation_history:
            history = []
            for msg in conversation_history:
                history.append({
                    "role": "user" if msg.get("is_user") else "assistant",
                    "content": msg.get("message", "")
                })
        else:
            history = []
        
        # Obtenir la réponse
        result = asthma_chat_advanced(message, history)
        
        return {
            "response": result["answer"],
            "sources": result["sources"],
            "used_search": result["used_web_search"]
        }


class Conversation(models.Model):
    """Modèle pour stocker les conversations"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='asthma_conversations')
    message = models.TextField()
    response = models.TextField()
    is_user = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.created_at}"