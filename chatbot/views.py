from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ChatbotService, Conversation


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    """Vue pour le chat"""
    message = request.data.get("message", "")
    
    if not message:
        return Response({"error": "Message vide"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Récupérer l'historique de conversation
        history = list(Conversation.objects.filter(user=request.user).values('message', 'is_user')[:10])
        
        # Créer le service chatbot
        chatbot = ChatbotService(request.user)
        
        # Obtenir la réponse
        result = chatbot.send_message(message, history)
        
        # Sauvegarder la question
        Conversation.objects.create(
            user=request.user,
            message=message,
            response="",
            is_user=True
        )
        
        # Sauvegarder la réponse
        Conversation.objects.create(
            user=request.user,
            message="",
            response=result["response"],
            is_user=False
        )
        
        return Response({
            "success": True,
            "response": result["response"],
            "sources": result["sources"],
            "used_search": result["used_search"]
        })
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_history(request):
    """Récupérer l'historique de conversation"""
    conversations = Conversation.objects.filter(user=request.user)
    
    data = []
    for conv in conversations:
        data.append({
            "message": conv.message if conv.is_user else conv.response,
            "is_user": conv.is_user,
            "created_at": conv.created_at.isoformat()
        })
    
    return Response({"conversations": data})