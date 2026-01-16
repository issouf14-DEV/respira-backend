from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, RegisterSerializer, ProfileSerializer
import logging

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Tentative d'inscription: {request.data.get('email')}")
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"Inscription réussie: {user.email}")
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Erreur inscription: {str(e)}", exc_info=True)
            return Response({
                'error': str(e),
                'detail': 'Erreur lors de l\'inscription'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        # Type hint pour Pylance
        from apps.users.models import CustomUser
        user: CustomUser = self.request.user  # type: ignore
        return user.profile
