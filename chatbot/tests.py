from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from .models import Conversation, ChatbotService
import json

User = get_user_model()


class ChatbotServiceTestCase(TestCase):
    """Tests pour le service chatbot"""
    
    def setUp(self):
        """Configuration initiale des tests"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.chatbot = ChatbotService(self.user)
    
    def test_detect_provider(self):
        """Test de détection du provider"""
        provider = self.chatbot.detect_provider("test message")
        self.assertEqual(provider, "openai")
    
    def test_send_message_without_history(self):
        """Test d'envoi de message sans historique"""
        result = self.chatbot.send_message("C'est quoi l'asthme ?")
        
        print(f"\n📤 Question: C'est quoi l'asthme ?")
        print(f"🤖 Réponse: {result.get('response', 'N/A')}")
        print(f"🔍 Sources: {result.get('sources', [])}")
        
        self.assertIn("response", result)
        self.assertIn("sources", result)
        self.assertIn("used_search", result)
        self.assertIsInstance(result["response"], str)
        self.assertGreater(len(result["response"]), 0)
    
    def test_send_message_with_history(self):
        """Test d'envoi de message avec historique"""
        history = [
            {"message": "Bonjour", "is_user": True},
            {"message": "Bonjour ! Comment puis-je vous aider ?", "is_user": False}
        ]
        
        result = self.chatbot.send_message("Parle-moi de l'asthme", history)
        
        print(f"\n📤 Question: Parle-moi de l'asthme")
        print(f"🤖 Réponse: {result.get('response', 'N/A')}")
        
        self.assertIsNotNone(result)
        self.assertIn("response", result)


class ConversationModelTestCase(TestCase):
    """Tests pour le modèle Conversation"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_conversation(self):
        """Test de création d'une conversation"""
        conv = Conversation.objects.create(
            user=self.user,
            message="Test question",
            response="Test response",
            is_user=True
        )
        
        self.assertEqual(conv.user, self.user)
        self.assertEqual(conv.message, "Test question")
        self.assertTrue(conv.is_user)
        self.assertIsNotNone(conv.created_at)
    
    def test_conversation_ordering(self):
        """Test de l'ordre des conversations"""
        conv1 = Conversation.objects.create(
            user=self.user,
            message="Message 1",
            response="",
            is_user=True
        )
        conv2 = Conversation.objects.create(
            user=self.user,
            message="Message 2",
            response="",
            is_user=True
        )
        
        conversations = Conversation.objects.all()
        self.assertEqual(conversations[0], conv1)
        self.assertEqual(conversations[1], conv2)


class ChatbotViewsTestCase(APITestCase):
    """Tests pour les vues du chatbot"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        # Utiliser les noms de routes sans namespace
        self.chat_url = '/api/v1/chatbot/chat/'
        self.history_url = '/api/v1/chatbot/history/'
    
    def test_chat_view_requires_login(self):
        """Test que la vue chat nécessite une authentification"""
        response = self.client.post(
            self.chat_url, 
            {"message": "test"},
            format='json'
        )
        # 401 Unauthorized ou 403 Forbidden
        self.assertIn(response.status_code, [401, 403, 302])
    
    def test_chat_view_post_success(self):
        """Test d'envoi de message réussi"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(
            self.chat_url,
            {"message": "C'est quoi l'asthme ?"},
            format='json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        print(f"\n📤 Question API: C'est quoi l'asthme ?")
        print(f"🤖 Réponse API: {data.get('response', 'N/A')}")
        
        self.assertTrue(data.get('success'))
        self.assertIn('response', data)
        self.assertIsInstance(data['response'], str)
    
    def test_chat_view_empty_message(self):
        """Test avec un message vide"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(
            self.chat_url,
            {"message": ""},
            format='json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
    
    def test_chat_view_invalid_method(self):
        """Test avec une méthode HTTP invalide"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.chat_url)
        self.assertEqual(response.status_code, 405)
    
    def test_get_conversation_history(self):
        """Test de récupération de l'historique"""
        self.client.force_authenticate(user=self.user)
        
        # Créer quelques conversations
        Conversation.objects.create(
            user=self.user,
            message="Question 1",
            response="",
            is_user=True
        )
        Conversation.objects.create(
            user=self.user,
            message="",
            response="Réponse 1",
            is_user=False
        )
        
        response = self.client.get(self.history_url)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn('conversations', data)
        self.assertEqual(len(data['conversations']), 2)
    
    def test_conversation_saved_in_database(self):
        """Test que les conversations sont bien sauvegardées"""
        self.client.force_authenticate(user=self.user)
        
        initial_count = Conversation.objects.filter(user=self.user).count()
        
        self.client.post(
            self.chat_url,
            {"message": "Test message"},
            format='json'
        )
        
        final_count = Conversation.objects.filter(user=self.user).count()
        
        # Au moins 1 nouvelle entrée (la question ou question+réponse)
        self.assertGreater(final_count, initial_count)


class IntegrationTestCase(APITestCase):
    """Tests d'intégration complets"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.chat_url = '/api/v1/chatbot/chat/'
        self.history_url = '/api/v1/chatbot/history/'
    
    def test_complete_conversation_flow(self):
        """Test d'un flux complet de conversation"""
        self.client.force_authenticate(user=self.user)
        
        # 1. Première question
        response1 = self.client.post(
            self.chat_url,
            {"message": "C'est quoi l'asthme ?"},
            format='json'
        )
        self.assertEqual(response1.status_code, 200)
        data1 = response1.json()
        print(f"\n🔄 FLUX CONVERSATION:")
        print(f"📤 Q1: C'est quoi l'asthme ?")
        print(f"🤖 R1: {data1.get('response', 'N/A')[:200]}...")
        
        # 2. Deuxième question (avec contexte)
        response2 = self.client.post(
            self.chat_url,
            {"message": "Quels sont les symptômes ?"},
            format='json'
        )
        data2 = response2.json()
        print(f"📤 Q2: Quels sont les symptômes ?")
        print(f"🤖 R2: {data2.get('response', 'N/A')[:200]}...")
        self.assertEqual(response2.status_code, 200)
        
        # 3. Vérifier l'historique
        history_response = self.client.get(self.history_url)
        self.assertEqual(history_response.status_code, 200)
        
        history_data = history_response.json()
        self.assertIn('conversations', history_data)
        # Au moins 2 messages dans l'historique
        self.assertGreaterEqual(len(history_data['conversations']), 2)
