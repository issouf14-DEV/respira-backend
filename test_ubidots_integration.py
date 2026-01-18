#!/usr/bin/env python3
"""
Script pour tester l'intégration Ubidots avec l'API RespirIA
"""
import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://respira-backend.onrender.com/api/v1"
# BASE_URL = "http://localhost:8000/api/v1"  # Pour tests locaux

def test_ubidots_integration(email, password, ubidots_token):
    """Tester l'intégration complète Ubidots"""
    print("🧪 TEST INTÉGRATION UBIDOTS")
    print("=" * 50)
    
    # 1. Login pour obtenir le token JWT
    print("1️⃣ Connexion utilisateur...")
    login_data = {
        "email": email,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/users/auth/login/", json=login_data)
    if response.status_code != 200:
        print(f"❌ Erreur login: {response.status_code}")
        print(response.text)
        return False
    
    jwt_token = response.json()["access"]
    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Content-Type": "application/json"
    }
    print("✅ Connexion réussie")
    
    # 2. Lister les devices Ubidots
    print("\n2️⃣ Récupération des devices Ubidots...")
    response = requests.get(
        f"{BASE_URL}/sensors/ubidots/devices/",
        headers=headers,
        params={"api_token": ubidots_token}
    )
    
    if response.status_code != 200:
        print(f"❌ Erreur récupération devices: {response.status_code}")
        print(response.text)
        return False
    
    devices_data = response.json()
    devices = devices_data.get('devices', [])
    print(f"✅ {len(devices)} devices trouvés:")
    
    for device in devices:
        print(f"   📱 {device['label']} (ID: {device['id']})")
    
    if not devices:
        print("⚠️ Aucun device trouvé. Vérifiez votre token Ubidots.")
        return False
    
    # 3. Lister les variables du premier device
    device_id = devices[0]['id']
    print(f"\n3️⃣ Variables du device {devices[0]['label']}...")
    
    response = requests.get(
        f"{BASE_URL}/sensors/ubidots/devices/{device_id}/variables/",
        headers=headers,
        params={"api_token": ubidots_token}
    )
    
    if response.status_code == 200:
        variables_data = response.json()
        variables = variables_data.get('variables', [])
        print(f"✅ {len(variables)} variables trouvées:")
        
        for var in variables:
            print(f"   📊 {var['label']} ({var.get('unit', 'no unit')})")
    else:
        print(f"❌ Erreur récupération variables: {response.status_code}")
    
    # 4. Synchroniser les données (dernières 2 heures)
    print(f"\n4️⃣ Synchronisation des données (2h)...")
    sync_data = {
        "api_token": ubidots_token,
        "hours": 2
    }
    
    response = requests.post(
        f"{BASE_URL}/sensors/ubidots/sync/",
        headers=headers,
        json=sync_data
    )
    
    if response.status_code == 200:
        sync_result = response.json()
        print(f"✅ Synchronisation réussie:")
        print(f"   📊 {sync_result.get('total_synced', 0)} nouveaux enregistrements")
        print(f"   📱 {sync_result.get('devices_processed', 0)} devices traités")
    else:
        print(f"❌ Erreur synchronisation: {response.status_code}")
        print(response.text)
        return False
    
    # 5. Vérifier les données synchronisées
    print(f"\n5️⃣ Vérification données synchronisées...")
    
    response = requests.get(
        f"{BASE_URL}/sensors/latest/",
        headers=headers
    )
    
    if response.status_code == 200:
        latest_data = response.json()
        print("✅ Dernières données:")
        print(f"   🩺 MAX30102: SpO2={latest_data['max30102']['spo2']}, HR={latest_data['max30102']['heart_rate']}")
        print(f"   🌡️ DHT11: Temp={latest_data['dht11']['temperature']}°C, Hum={latest_data['dht11']['humidity']}%")
        print(f"   💨 CJMCU811: eCO2={latest_data['cjmcu811']['eco2']}ppm, TVOC={latest_data['cjmcu811']['tvoc']}ppb")
        print(f"   ⚠️ Risque: {latest_data['risk_level']} (Score: {latest_data['risk_score']})")
    else:
        print(f"❌ Aucune donnée trouvée: {response.status_code}")
    
    # 6. Test des APIs par capteur
    print(f"\n6️⃣ Test APIs par type de capteur...")
    
    sensor_types = ['max30102', 'dht11', 'cjmcu811', 'all']
    for sensor_type in sensor_types:
        response = requests.get(
            f"{BASE_URL}/sensors/data/{sensor_type}/",
            headers=headers,
            params={"hours": 2, "limit": 5}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   📊 {sensor_type.upper()}: {data['count']} enregistrements")
        else:
            print(f"   ❌ {sensor_type.upper()}: Erreur {response.status_code}")
    
    print(f"\n🎉 TESTS TERMINÉS AVEC SUCCÈS !")
    return True

def main():
    """Point d'entrée principal"""
    print("🔧 CONFIGURATION UBIDOTS")
    print("=" * 30)
    
    # Demander les informations
    email = input("📧 Email utilisateur RespirIA: ")
    password = input("🔐 Mot de passe: ")
    ubidots_token = input("🔑 Token API Ubidots: ")
    
    if not all([email, password, ubidots_token]):
        print("❌ Toutes les informations sont requises")
        return
    
    # Lancer les tests
    try:
        test_ubidots_integration(email, password, ubidots_token)
    except Exception as e:
        print(f"❌ Erreur durant les tests: {e}")
        return

if __name__ == "__main__":
    main()