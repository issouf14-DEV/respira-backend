from django.contrib import admin
from .models import Conversation

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Interface d'administration pour les conversations"""
    
    list_display = ['id', 'user', 'get_preview', 'is_user', 'created_at']
    list_filter = ['is_user', 'created_at', 'user']
    search_fields = ['message', 'response', 'user__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    def get_preview(self, obj):
        """Afficher un aperçu du message"""
        text = obj.message if obj.is_user else obj.response
        return text[:50] + "..." if len(text) > 50 else text
    
    get_preview.short_description = 'Aperçu'
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('user', 'is_user', 'created_at')
        }),
        ('Contenu', {
            'fields': ('message', 'response')
        }),
    )
    
    def has_add_permission(self, request):
        """Désactiver l'ajout manuel depuis l'admin"""
        return False