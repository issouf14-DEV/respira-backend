from rest_framework import serializers
from .models import Conversation
from django.contrib.auth.models import User


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer pour les conversations"""
    
    username = serializers.CharField(source='user.username', read_only=True)
    preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'user', 'username', 'message', 'response', 
                  'is_user', 'created_at', 'preview']
        read_only_fields = ['id', 'created_at', 'username']
    
    def get_preview(self, obj):
        """Retourne un aperçu du message"""
        text = obj.message if obj.is_user else obj.response
        return text[:100] + "..." if len(text) > 100 else text


class ChatMessageSerializer(serializers.Serializer):
    """Serializer pour envoyer un message au chatbot"""
    
    message = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=2000,
        help_text="Question à poser au chatbot"
    )
    
    def validate_message(self, value):
        """Validation du message"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Le message doit contenir au moins 3 caractères"
            )
        return value.strip()


class ChatResponseSerializer(serializers.Serializer):
    """Serializer pour la réponse du chatbot"""
    
    success = serializers.BooleanField(default=True)
    response = serializers.CharField()
    sources = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True
    )
    used_search = serializers.BooleanField(default=False)
    conversation_id = serializers.IntegerField(required=False)


class ConversationHistorySerializer(serializers.Serializer):
    """Serializer pour l'historique de conversation"""
    
    conversations = ConversationSerializer(many=True, read_only=True)
    total_count = serializers.IntegerField(read_only=True)
    user = serializers.CharField(source='user.username', read_only=True)