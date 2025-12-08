#!/usr/bin/env python3
"""
Script pour générer des données de test réalistes avec toutes les nouvelles features
"""
import os
import sys
import django
from datetime import datetime, timedelta
import random
import json

# Configuration Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'respira_project.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.sensors.models import BraceletDevice, SensorData
from apps.environment.models import AirQuality
from apps.users.models import UserProfile

User = get_user_model()

def create_realistic_sensor_data():
    """Créer des données de capteurs réalistes avec toutes les nouvelles features"""
    
    print("🧪 GÉNÉRATION DE DONNÉES DE TEST AVANCÉES")
    print("=" * 60)
    
    # Créer un utilisateur de test
    user, created = User.objects.get_or_create(
        email='test.advanced@respira.com',
        defaults={
            'username': 'test_advanced',
            'first_name': 'Test',
            'last_name': 'Advanced'
        }
    )
    
    if created:
        user.set_password('TestAdvanced123!')
        user.save()
        print(f"✅ Utilisateur créé: {user.email}")
    
    # Créer un profil
    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'profile_type': 'ASTHMATIC',
            'city': 'Abidjan',
            'alerts_enabled': True
        }
    )
    
    # Créer un bracelet
    bracelet, _ = BraceletDevice.objects.get_or_create(
        user=user,
        device_id='TEST_BRACELET_ADV',
        defaults={
            'device_name': 'Bracelet Test Avancé',
            'is_connected': True,
            'battery_level': 85
        }
    )
    
    print(f"✅ Bracelet: {bracelet.device_name}")
    
    # Scénarios de données réalistes
    scenarios = [
        {
            'name': '😴 Repos - Bonne santé',
            'spo2_range': (96, 99),
            'respiratory_rate_range': (14, 18),
            'heart_rate_range': (60, 80),
            'aqi_range': (25, 50),
            'smoke_detected': False,
            'pollen_level': 'LOW',
            'activity': 'REST'
        },
        {
            'name': '🚶 Marche légère - Légère fatigue',
            'spo2_range': (94, 97),
            'respiratory_rate_range': (18, 24),
            'heart_rate_range': (80, 100),
            'aqi_range': (60, 90),
            'smoke_detected': False,
            'pollen_level': 'MEDIUM',
            'activity': 'WALK'
        },
        {
            'name': '🏃 Exercice intense - Effort',
            'spo2_range': (92, 96),
            'respiratory_rate_range': (22, 30),
            'heart_rate_range': (120, 160),
            'aqi_range': (40, 70),
            'smoke_detected': False,
            'pollen_level': 'LOW',
            'activity': 'RUN'
        },
        {
            'name': '⚠️ Pollution élevée - Risque modéré',
            'spo2_range': (91, 95),
            'respiratory_rate_range': (20, 28),
            'heart_rate_range': (75, 95),
            'aqi_range': (120, 180),
            'smoke_detected': False,
            'pollen_level': 'HIGH',
            'activity': 'REST'
        },
        {
            'name': '🚨 Crise d\'asthme - Critique',
            'spo2_range': (88, 92),
            'respiratory_rate_range': (28, 35),
            'heart_rate_range': (100, 130),
            'aqi_range': (200, 350),
            'smoke_detected': True,
            'pollen_level': 'HIGH',
            'activity': 'REST'
        }
    ]
    
    # Générer des données sur les 7 derniers jours
    end_time = datetime.now()
    start_time = end_time - timedelta(days=7)
    
    print(f"\\n📊 Génération de données du {start_time.date()} au {end_time.date()}")
    
    total_created = 0
    
    for day in range(7):
        day_start = start_time + timedelta(days=day)
        
        # 144 mesures par jour (toutes les 10 minutes)
        for measurement in range(144):
            timestamp = day_start + timedelta(minutes=measurement * 10)
            
            # Choisir un scénario basé sur l'heure et aléatoire
            hour = timestamp.hour
            if 22 <= hour or hour <= 6:  # Nuit
                scenario = scenarios[0]  # Repos
            elif 7 <= hour <= 9 or 17 <= hour <= 19:  # Heures de pointe
                scenario = random.choice(scenarios[3:5])  # Pollution/Crise
            elif 12 <= hour <= 14:  # Midi - exercice possible
                scenario = random.choice(scenarios[1:3])  # Marche/Course
            else:
                scenario = random.choice(scenarios[0:2])  # Repos/Marche
            
            # Générer les valeurs avec variabilité
            spo2 = random.randint(*scenario['spo2_range'])
            respiratory_rate = random.randint(*scenario['respiratory_rate_range'])
            heart_rate = random.randint(*scenario['heart_rate_range'])
            aqi = random.randint(*scenario['aqi_range'])
            
            # Ajouter de la variabilité réaliste
            temperature = round(random.uniform(36.2, 37.8), 1)
            humidity = random.randint(45, 85)
            steps = random.randint(0, 200) if scenario['activity'] == 'REST' else random.randint(150, 800)
            
            # Créer la donnée
            sensor_data = SensorData.objects.create(
                user=user,
                bracelet=bracelet,
                timestamp=timestamp,
                spo2=spo2,
                respiratory_rate=respiratory_rate,
                heart_rate=heart_rate,
                aqi=aqi,
                smoke_detected=scenario['smoke_detected'],
                pollen_level=scenario['pollen_level'],
                temperature=temperature,
                humidity=humidity,
                activity_level=scenario['activity'],
                steps=steps
            )
            
            total_created += 1
            
            # Afficher le progrès
            if total_created % 100 == 0:
                print(f"  📈 {total_created} mesures créées...")
    
    print(f"\\n✅ DONNÉES GÉNÉRÉES AVEC SUCCÈS!")
    print(f"   👤 Utilisateur: {user.email}")
    print(f"   📱 Bracelet: {bracelet.device_name}")
    print(f"   📊 Mesures créées: {total_created}")
    
    # Statistiques par scénario
    print(f"\\n📈 RÉPARTITION DES SCÉNARIOS:")
    for scenario in scenarios:
        count = SensorData.objects.filter(
            user=user,
            timestamp__gte=start_time,
            activity_level=scenario['activity']
        ).count()
        print(f"   {scenario['name']}: {count} mesures")
    
    # Alertes générées
    from apps.sensors.models import RiskAlert
    alerts_count = RiskAlert.objects.filter(user=user).count()
    print(f"\\n🚨 ALERTES GÉNÉRÉES: {alerts_count}")
    
    # Dernières métriques
    latest = SensorData.objects.filter(user=user).first()
    if latest:
        print(f"\\n📊 DERNIÈRE MESURE:")
        print(f"   ⭐ SpO2: {latest.spo2}%")
        print(f"   ⭐ Fréq. resp.: {latest.respiratory_rate}/min") 
        print(f"   ⭐ AQI: {latest.aqi}")
        print(f"   ⭐ Score de risque: {latest.risk_score}")
        print(f"   ⭐ Niveau: {latest.risk_level}")
    
    return user, total_created

def create_air_quality_data():
    """Créer des données de qualité de l'air"""
    print(f"\\n🌍 Génération des données environnementales...")
    
    cities = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San Pedro']
    
    end_time = datetime.now()
    start_time = end_time - timedelta(days=3)
    
    total_air_data = 0
    
    for city in cities:
        current_time = start_time
        while current_time <= end_time:
            # AQI varie selon la ville et l'heure
            base_aqi = {'Abidjan': 80, 'Bouaké': 45, 'Yamoussoukro': 35, 'San Pedro': 60}[city]
            hour_factor = 1.3 if 7 <= current_time.hour <= 9 or 17 <= current_time.hour <= 19 else 1.0
            aqi = int(base_aqi * hour_factor * random.uniform(0.8, 1.4))
            
            AirQuality.objects.create(
                city=city,
                timestamp=current_time,
                aqi=aqi,
                pm25=round(aqi * 0.6, 2),
                pm10=round(aqi * 0.9, 2),
                pollen_level=random.choice(['LOW', 'MEDIUM', 'HIGH']),
                smoke_detected=random.choice([True, False]) if aqi > 150 else False
            )
            
            total_air_data += 1
            current_time += timedelta(hours=1)
    
    print(f"   ✅ {total_air_data} mesures environnementales créées")

if __name__ == "__main__":
    try:
        user, sensor_count = create_realistic_sensor_data()
        create_air_quality_data()
        
        print(f"\\n🎯 RÉSUMÉ FINAL:")
        print(f"   📧 Connexion: {user.email}")
        print(f"   🔑 Mot de passe: TestAdvanced123!")
        print(f"   📊 Données capteurs: {sensor_count}")
        print(f"   🌍 Données environnementales: créées")
        print(f"\\n🚀 Testez l'API avec ces nouvelles données!")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()