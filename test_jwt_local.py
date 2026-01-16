#!/usr/bin/env python
"""Test JWT token generation localement"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'respira_project.settings.development')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.users.serializers import RegisterSerializer

User = get_user_model()

print("\n" + "="*60)
print("  TEST JWT ET INSCRIPTION LOCALE")
print("="*60 + "\n")

# Test 1: JWT sur utilisateur existant
print("🧪 Test 1: Génération JWT sur utilisateur existant")
try:
    user = User.objects.first()
    if user:
        token = RefreshToken.for_user(user)
        print(f"✅ SUCCESS - JWT généré pour {user.username}")
        print(f"   Access token: {str(token.access_token)[:30]}...")
    else:
        print("⚠️ Aucun utilisateur en base")
except Exception as e:
    print(f"❌ FAILED: {e}")

# Test 2: Validation serializer
print("\n🧪 Test 2: Validation serializer inscription")
data = {
    'username': 'test_local_user',
    'email': 'test.local@gmail.com',
    'password': 'MotDePasseSecure2024!',
    'password_confirm': 'MotDePasseSecure2024!',
    'profile_type': 'PREVENTION',
    'first_name': 'Test',
    'last_name': 'Local'
}

try:
    serializer = RegisterSerializer(data=data)
    if serializer.is_valid():
        print("✅ SUCCESS - Serializer valide")
        print("   Données validées:", serializer.validated_data.keys())
    else:
        print("❌ FAILED - Erreurs validation:")
        for field, errors in serializer.errors.items():
            print(f"   {field}: {errors}")
except Exception as e:
    print(f"❌ FAILED: {e}")

# Test 3: Création complète
print("\n🧪 Test 3: Création utilisateur + JWT")
data['username'] = 'test_jwt_' + str(hash(os.urandom(4)))[:6]
data['email'] = f"test.jwt.{hash(os.urandom(4)) % 10000}@gmail.com"

try:
    serializer = RegisterSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        token = RefreshToken.for_user(user)
        print(f"✅ SUCCESS - Utilisateur créé et JWT généré")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Profile: {user.profile_type}")
        print(f"   Access token: {str(token.access_token)[:30]}...")
        # Nettoyer
        user.delete()
        print("   ✓ Utilisateur test supprimé")
    else:
        print("❌ FAILED - Erreurs:", serializer.errors)
except Exception as e:
    print(f"❌ FAILED: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
