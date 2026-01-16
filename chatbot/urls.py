from django.urls import path
from . import views

# Namespace retiré pour éviter le conflit
urlpatterns = [
    path('chat/', views.chat_view, name='chatbot-chat'),
    path('history/', views.get_conversation_history, name='chatbot-history'),
]