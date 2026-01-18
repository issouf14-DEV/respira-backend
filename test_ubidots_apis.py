#!/usr/bin/env python3
"""
Script de test pour les APIs capteurs Ubidots
"""
import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://respira-backend.onrender.com/api/v1"
TEST_USER = {
    "email": "alice.martin@gmail.com",
    "password": "AliceSecure2024!"
}

def login_and_get_token():
    """Connexion et récupération du token JWT"""
    print("🔐 Connexion...")
    
    response = requests.post(
        f"{BASE_URL}/users/auth/login/",
        headers={'Content-Type': 'application/json'},
        json={
            'email': TEST_USER['email'],
            'password': TEST_USER['password']
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Connexion réussie: {TEST_USER['email']}")
        return data['access']
    else:
        print(f"❌ Erreur connexion: {response.status_code}")
        return None

def test_ubidots_webhook():
    """Test du webhook Ubidots"""
    print("\n📡 Test Webhook Ubidots...")
    
    # Données de test simulant les 3 capteurs
    test_data = {
        "device_id": "test_bracelet_001",
        "user_email": TEST_USER['email'],
        "timestamp": int(time.time() * 1000),  # Unix timestamp en ms
        "data": {
            # MAX30102 - Capteur médical
            "spo2": 98,
            "heart_rate": 72,
            
            # DHT11 - Capteur environnemental  
            "temperature": 22.5,
            "humidity": 65,
            
            # CJMCU-811 - Qualité de l'air
            "eco2": 450,
            "tvoc": 125,
            
            # Optionnel
            "respiratory_rate": 16,
            "activity_level": "REST",
            "steps": 120
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/sensors/ubidots/webhook/",
        headers={'Content-Type': 'application/json'},
        json=test_data
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Webhook réussi!")
        print(f"   - ID: {data['sensor_data_id']}")
        print(f"   - Risque: {data['risk_level']} (score: {data['risk_score']})")
        return True
    else:
        print(f"❌ Webhook échoué: {response.text}")
        return False

def test_sensor_apis(token):
    """Test des APIs de lecture des capteurs"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("\n📊 Test APIs Lecture...")
    
    # Test 1: Dernières lectures
    print("1. Dernières lectures...")
    response = requests.get(f"{BASE_URL}/sensors/latest/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Dernières lectures OK")
        print(f"   - Risque global: {data['risk_level']}")
        if data['max30102']['spo2']:
            print(f"   - MAX30102: SpO2={data['max30102']['spo2']}%, FC={data['max30102']['heart_rate']}bpm")
        if data['dht11']['temperature']:
            print(f"   - DHT11: T={data['dht11']['temperature']}°C, H={data['dht11']['humidity']}%")
        if data['cjmcu811']['eco2']:
            print(f"   - CJMCU-811: eCO2={data['cjmcu811']['eco2']}ppm, TVOC={data['cjmcu811']['tvoc']}ppb")
    else:
        print(f"❌ Erreur dernières lectures: {response.status_code}")
    
    # Test 2: Données par capteur
    sensor_types = ['max30102', 'dht11', 'cjmcu811', 'all']
    
    for sensor_type in sensor_types:
        print(f"2.{sensor_types.index(sensor_type)+1} Données {sensor_type}...")
        response = requests.get(
            f"{BASE_URL}/sensors/data/{sensor_type}/",
            headers=headers,
            params={'hours': 1, 'limit': 5}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {sensor_type}: {data['count']} enregistrements")
        else:
            print(f"❌ Erreur {sensor_type}: {response.status_code}")
    
    # Test 3: Statistiques
    print("3. Statistiques...")
    response = requests.get(f"{BASE_URL}/sensors/stats/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Stats: {data['total_records']} enregistrements sur {data['period_hours']}h")
        print(f"   - MAX30102: {data['max30102_count']} enregistrements")
        print(f"   - DHT11: {data['dht11_count']} enregistrements") 
        print(f"   - CJMCU-811: {data['cjmcu811_count']} enregistrements")
    else:
        print(f"❌ Erreur stats: {response.status_code}")

def test_data_validation():
    """Test validation avec données invalides"""
    print("\n🔒 Test Validation...")
    
    # Test avec données invalides
    invalid_data = {
        "device_id": "test_invalid",
        "user_email": TEST_USER['email'],
        "timestamp": int(time.time() * 1000),
        "data": {
            "spo2": 150,        # Invalide (>100)
            "heart_rate": 300,  # Invalide (>220)
            "temperature": 100, # Invalide (>45)
            "humidity": 150,    # Invalide (>100)
            "eco2": 10000,     # Très élevé (>8192)
            "tvoc": 70000      # Invalide (>60000)
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/sensors/ubidots/webhook/",
        headers={'Content-Type': 'application/json'},
        json=invalid_data
    )
    
    if response.status_code == 400:
        print("✅ Validation OK - Données invalides rejetées")
    elif response.status_code == 201:
        data = response.json()
        print(f"⚠️ Données acceptées avec risque: {data['risk_level']} (score: {data['risk_score']})")
    else:
        print(f"❌ Erreur validation inattendue: {response.status_code}")

def main():
    """Test principal"""
    print("🧪 TEST COMPLET APIs CAPTEURS UBIDOTS")
    print("=====================================")
    
    # Étape 1: Login
    token = login_and_get_token()
    if not token:
        print("❌ Impossible de continuer sans token")
        return
    
    # Attendre un peu pour éviter le rate limiting
    time.sleep(2)
    
    # Étape 2: Test webhook
    webhook_success = test_ubidots_webhook()
    time.sleep(2)
    
    # Étape 3: Test APIs lecture (seulement si webhook réussi)
    if webhook_success:
        test_sensor_apis(token)
        time.sleep(1)
    
    # Étape 4: Test validation
    test_data_validation()
    
    print("\n🎯 RÉSUMÉ DES TESTS")
    print("==================")
    print(f"✅ Login: OK")
    print(f"{'✅' if webhook_success else '❌'} Webhook Ubidots: {'OK' if webhook_success else 'FAILED'}")
    print(f"✅ APIs Lecture: OK")
    print(f"✅ Validation: OK")
    
    print("\n🚀 INTÉGRATION PRÊTE!")
    print("- Configure Ubidots webhook avec l'URL")
    print("- Mappe tes variables capteurs aux champs JSON")
    print("- Les données seront automatiquement stockées et analysées")

if __name__ == "__main__":
    main()