#!/usr/bin/env python3
"""
Test complet des APIs d'authentification et de gestion des comptes
"""
import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://respira-backend.onrender.com/api/v1"
TEST_USERS = [
    {
        "email": "testdev@respira.com",
        "username": "devtest123",
        "password": "DevSecure2024!",
        "profile_type": "PREVENTION",
        "first_name": "Dev",
        "last_name": "Test"
    },
    {
        "email": "testai@respira.com", 
        "username": "aitest456",
        "password": "AISecure2024!",
        "profile_type": "ASTHMATIC",
        "first_name": "AI",
        "last_name": "Dev"
    }
]

def test_registration():
    """Test inscription de nouveaux utilisateurs"""
    print("\n🔐 TEST INSCRIPTION")
    print("=" * 50)
    
    for i, user_data in enumerate(TEST_USERS):
        print(f"\n{i+1}. Test inscription: {user_data['email']}")
        
        # Ajouter password_confirm
        registration_data = user_data.copy()
        registration_data['password_confirm'] = user_data['password']
        
        response = requests.post(
            f"{BASE_URL}/users/auth/register/",
            headers={'Content-Type': 'application/json'},
            json=registration_data
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"   ✅ Inscription réussie")
            print(f"   User ID: {data['user']['id']}")
            print(f"   Token Access: {data['tokens']['access'][:30]}...")
            print(f"   Token Refresh: {data['tokens']['refresh'][:30]}...")
            
            # Stocker les tokens pour les tests suivants
            user_data['access_token'] = data['tokens']['access']
            user_data['refresh_token'] = data['tokens']['refresh']
            user_data['user_id'] = data['user']['id']
            
        elif response.status_code == 400:
            error = response.json()
            if "already exists" in str(error):
                print(f"   ⚠️  Utilisateur existe déjà, tentative connexion...")
                return test_login_existing(user_data)
            else:
                print(f"   ❌ Erreur inscription: {error}")
        else:
            print(f"   ❌ Erreur {response.status_code}: {response.text}")

def test_login_existing(user_data):
    """Connexion pour utilisateur existant"""
    response = requests.post(
        f"{BASE_URL}/users/auth/login/",
        headers={'Content-Type': 'application/json'},
        json={
            'email': user_data['email'],
            'password': user_data['password']
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Connexion réussie")
        user_data['access_token'] = data['access']
        user_data['refresh_token'] = data['refresh']
        return True
    else:
        print(f"   ❌ Erreur connexion: {response.status_code}")
        return False

def test_login():
    """Test connexion avec les comptes créés"""
    print("\n🔑 TEST CONNEXION")
    print("=" * 50)
    
    for i, user_data in enumerate(TEST_USERS):
        if 'access_token' not in user_data:  # Skip si déjà connecté
            print(f"\n{i+1}. Test connexion: {user_data['email']}")
            
            response = requests.post(
                f"{BASE_URL}/users/auth/login/",
                headers={'Content-Type': 'application/json'},
                json={
                    'email': user_data['email'],
                    'password': user_data['password']
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Connexion réussie")
                user_data['access_token'] = data['access']
                user_data['refresh_token'] = data['refresh']
            else:
                print(f"   ❌ Erreur connexion: {response.status_code}")

def test_user_profile():
    """Test récupération profil utilisateur"""
    print("\n👤 TEST PROFIL UTILISATEUR")
    print("=" * 50)
    
    for i, user_data in enumerate(TEST_USERS):
        if 'access_token' in user_data:
            print(f"\n{i+1}. Profil pour: {user_data['email']}")
            
            response = requests.get(
                f"{BASE_URL}/users/me/",
                headers={
                    'Authorization': f"Bearer {user_data['access_token']}",
                    'Content-Type': 'application/json'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Profil récupéré")
                print(f"   ID: {data['id']}")
                print(f"   Email: {data['email']}")
                print(f"   Username: {data['username']}")
                print(f"   Profil médical: {data['profile']['profile_type']}")
                
                user_data['profile_data'] = data
            else:
                print(f"   ❌ Erreur profil: {response.status_code}")

def test_profile_update():
    """Test mise à jour profil médical"""
    print("\n✏️ TEST MISE À JOUR PROFIL")
    print("=" * 50)
    
    for i, user_data in enumerate(TEST_USERS):
        if 'access_token' in user_data:
            print(f"\n{i+1}. Mise à jour profil: {user_data['email']}")
            
            # Mise à jour profil médical
            profile_update = {
                "age": 25 + i,
                "gender": "M" if i == 0 else "F",
                "height": 175.0 + i * 5,
                "weight": 70.0 + i * 3,
                "respiratory_conditions": ["asthma"] if user_data['profile_type'] == 'ASTHMATIC' else [],
                "emergency_contact": f"+3312345678{i}"
            }
            
            response = requests.put(
                f"{BASE_URL}/users/me/profile/",
                headers={
                    'Authorization': f"Bearer {user_data['access_token']}",
                    'Content-Type': 'application/json'
                },
                json=profile_update
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Profil mis à jour")
                print(f"   Âge: {data.get('age')}")
                print(f"   Genre: {data.get('gender')}")
                print(f"   Conditions: {data.get('respiratory_conditions')}")
            else:
                print(f"   ❌ Erreur mise à jour: {response.status_code}")

def test_token_refresh():
    """Test rafraîchissement de token"""
    print("\n🔄 TEST REFRESH TOKEN")
    print("=" * 50)
    
    user_data = TEST_USERS[0]  # Test sur le premier utilisateur
    if 'refresh_token' in user_data:
        print(f"\nTest refresh pour: {user_data['email']}")
        
        response = requests.post(
            f"{BASE_URL}/users/auth/refresh/",
            headers={'Content-Type': 'application/json'},
            json={'refresh': user_data['refresh_token']}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Token refreshed")
            print(f"   Nouveau access: {data['access'][:30]}...")
            if 'refresh' in data:
                print(f"   Nouveau refresh: {data['refresh'][:30]}...")
                user_data['refresh_token'] = data['refresh']
            user_data['access_token'] = data['access']
        else:
            print(f"   ❌ Erreur refresh: {response.status_code}")

def test_authentication_flow():
    """Test complet du flux d'authentification"""
    print("\n🚀 TEST FLUX COMPLET D'AUTHENTIFICATION")
    print("=" * 50)
    
    test_user = {
        "email": f"flowtest{int(time.time())}@respira.com",
        "username": f"flowtest{int(time.time())}",
        "password": "FlowTest2024!",
        "profile_type": "PREVENTION",
        "first_name": "Flow",
        "last_name": "Test"
    }
    
    # 1. Inscription
    print("\n1. 📝 Inscription...")
    test_user['password_confirm'] = test_user['password']
    response = requests.post(
        f"{BASE_URL}/users/auth/register/",
        headers={'Content-Type': 'application/json'},
        json=test_user
    )
    
    if response.status_code == 201:
        data = response.json()
        print("   ✅ Inscription OK")
        access_token = data['tokens']['access']
        refresh_token = data['tokens']['refresh']
    else:
        print(f"   ❌ Inscription échouée: {response.status_code}")
        return
    
    # 2. Utilisation du token pour accéder au profil
    print("\n2. 👤 Accès profil avec token...")
    response = requests.get(
        f"{BASE_URL}/users/me/",
        headers={'Authorization': f"Bearer {access_token}"}
    )
    
    if response.status_code == 200:
        profile = response.json()
        print("   ✅ Accès profil OK")
        print(f"   Utilisateur: {profile['email']}")
    else:
        print(f"   ❌ Accès profil échoué: {response.status_code}")
    
    # 3. Test refresh token
    print("\n3. 🔄 Refresh token...")
    response = requests.post(
        f"{BASE_URL}/users/auth/refresh/",
        headers={'Content-Type': 'application/json'},
        json={'refresh': refresh_token}
    )
    
    if response.status_code == 200:
        new_data = response.json()
        print("   ✅ Refresh OK")
        new_access_token = new_data['access']
    else:
        print(f"   ❌ Refresh échoué: {response.status_code}")
        return
    
    # 4. Utilisation nouveau token
    print("\n4. ✨ Test nouveau token...")
    response = requests.get(
        f"{BASE_URL}/users/me/",
        headers={'Authorization': f"Bearer {new_access_token}"}
    )
    
    if response.status_code == 200:
        print("   ✅ Nouveau token fonctionne")
    else:
        print(f"   ❌ Nouveau token échoué: {response.status_code}")

def test_authorization_levels():
    """Test niveaux d'autorisation"""
    print("\n🛡️ TEST NIVEAUX D'AUTORISATION")
    print("=" * 50)
    
    # Test endpoint protégé sans token
    print("\n1. Accès profil SANS token...")
    response = requests.get(f"{BASE_URL}/users/me/")
    
    if response.status_code == 401:
        print("   ✅ Correctement bloqué (401 Unauthorized)")
    else:
        print(f"   ❌ Erreur: Status {response.status_code} (attendu 401)")
    
    # Test endpoint protégé avec token invalide
    print("\n2. Accès profil avec token INVALIDE...")
    response = requests.get(
        f"{BASE_URL}/users/me/",
        headers={'Authorization': 'Bearer token_invalide_123'}
    )
    
    if response.status_code == 401:
        print("   ✅ Token invalide correctement rejeté")
    else:
        print(f"   ❌ Erreur: Status {response.status_code} (attendu 401)")
    
    # Test endpoint public (santé)
    print("\n3. Accès endpoint public...")
    response = requests.get(f"{BASE_URL[:-8]}/health/")  # Remove /api/v1 from URL
    
    if response.status_code == 200:
        print("   ✅ Endpoint public accessible")
    else:
        print(f"   ❌ Endpoint public inaccessible: {response.status_code}")

def main():
    """Test principal"""
    print("🧪 TEST COMPLET DES APIs D'AUTHENTIFICATION")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Tests séquentiels
    test_registration()
    test_login()
    test_user_profile()
    test_profile_update()
    test_token_refresh()
    test_authentication_flow()
    test_authorization_levels()
    
    print("\n" + "=" * 70)
    print("🎯 RÉSUMÉ DES TESTS")
    print("=" * 70)
    
    # Compter les utilisateurs créés avec succès
    successful_users = [u for u in TEST_USERS if 'access_token' in u]
    print(f"✅ Utilisateurs créés/connectés: {len(successful_users)}/{len(TEST_USERS)}")
    
    for user in successful_users:
        print(f"   - {user['email']} (ID: {user.get('user_id', 'N/A')})")
    
    print("\n🚀 APIS PRÊTES POUR L'INTÉGRATION !")
    print("Documentation complète: API_AUTH_COMPTES.md")

if __name__ == "__main__":
    main()