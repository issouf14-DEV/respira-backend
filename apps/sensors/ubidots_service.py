"""
Service pour récupérer les données depuis l'API Ubidots
"""
import requests
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from apps.sensors.models import SensorData, BraceletDevice
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

class UbidotsService:
    def __init__(self, api_token=None):
        self.api_token = api_token or getattr(settings, 'UBIDOTS_API_TOKEN', None)
        self.base_url = 'https://industrial.api.ubidots.com/api/v1.6'
        self.headers = {
            'X-Auth-Token': self.api_token,
            'Content-Type': 'application/json'
        }
        
        if not self.api_token:
            logger.warning("UBIDOTS_API_TOKEN non configuré dans settings")
    
    def get_devices(self):
        """Récupérer tous les devices Ubidots"""
        try:
            response = requests.get(
                f"{self.base_url}/devices/",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Erreur récupération devices Ubidots: {e}")
            return []
    
    def get_device_variables(self, device_id):
        """Récupérer les variables d'un device"""
        try:
            response = requests.get(
                f"{self.base_url}/devices/{device_id}/",
                headers=self.headers
            )
            response.raise_for_status()
            device_data = response.json()
            return device_data.get('variables', [])
        except Exception as e:
            logger.error(f"Erreur récupération variables device {device_id}: {e}")
            return []
    
    def get_variable_values(self, variable_id, start_time=None, end_time=None, page_size=1000):
        """Récupérer les valeurs d'une variable"""
        try:
            params = {'page_size': page_size}
            
            # Filtres temporels (timestamps Unix en millisecondes)
            if start_time:
                if isinstance(start_time, datetime):
                    params['start'] = int(start_time.timestamp() * 1000)
                else:
                    params['start'] = start_time
                    
            if end_time:
                if isinstance(end_time, datetime):
                    params['end'] = int(end_time.timestamp() * 1000)
                else:
                    params['end'] = end_time
            
            response = requests.get(
                f"{self.base_url}/variables/{variable_id}/values/",
                headers=self.headers,
                params=params
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Erreur récupération valeurs variable {variable_id}: {e}")
            return []
    
    def sync_sensor_data(self, user_email, device_mapping=None, hours_back=24):
        """
        Synchroniser les données capteurs depuis Ubidots
        
        Args:
            user_email: Email de l'utilisateur
            device_mapping: Mapping device_id -> user_email si différent
            hours_back: Nombre d'heures à récupérer
        """
        try:
            # Trouver l'utilisateur
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                logger.error(f"Utilisateur non trouvé: {user_email}")
                return {'error': 'Utilisateur non trouvé'}
            
            # Période de récupération
            end_time = timezone.now()
            start_time = end_time - timedelta(hours=hours_back)
            
            logger.info(f"🔄 Synchronisation Ubidots pour {user_email} - {hours_back}h")
            
            # Récupérer les devices
            devices = self.get_devices()
            if not devices:
                return {'error': 'Aucun device Ubidots trouvé'}
            
            total_synced = 0
            
            for device in devices:
                device_id = device['id']
                device_label = device.get('label', device_id)
                
                logger.info(f"📱 Device: {device_label} ({device_id})")
                
                # Trouver ou créer le bracelet Django
                bracelet, created = BraceletDevice.objects.get_or_create(
                    user=user,
                    device_id=f"ubidots_{device_id}",
                    defaults={
                        'device_name': f"Ubidots {device_label}",
                        'is_connected': True,
                        'battery_level': 100
                    }
                )
                
                # Récupérer les variables du device
                variables = self.get_device_variables(device_id)
                
                # Mapper les variables aux champs de données
                variable_map = {}
                for var in variables:
                    var_label = var.get('label', '').lower()
                    var_id = var['id']
                    
                    # Mapping des labels Ubidots vers nos champs
                    if var_label in ['spo2', 'spo_2', 'oxygen']:
                        variable_map['spo2'] = var_id
                    elif var_label in ['heart_rate', 'heartrate', 'hr', 'bpm']:
                        variable_map['heart_rate'] = var_id
                    elif var_label in ['temperature', 'temp', 't']:
                        variable_map['temperature'] = var_id
                    elif var_label in ['humidity', 'hum', 'h']:
                        variable_map['humidity'] = var_id
                    elif var_label in ['eco2', 'co2', 'carbon']:
                        variable_map['eco2'] = var_id
                    elif var_label in ['tvoc', 'voc', 'volatile']:
                        variable_map['tvoc'] = var_id
                    elif var_label in ['respiratory_rate', 'breathing', 'resp']:
                        variable_map['respiratory_rate'] = var_id
                
                logger.info(f"📊 Variables mappées: {list(variable_map.keys())}")
                
                # Récupérer les données pour chaque variable
                sensor_data_batch = {}
                
                for field, var_id in variable_map.items():
                    values = self.get_variable_values(var_id, start_time, end_time)
                    
                    for value_data in values:
                        timestamp_ms = value_data['timestamp']
                        timestamp = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)
                        value = value_data['value']
                        
                        # Grouper par timestamp
                        if timestamp_ms not in sensor_data_batch:
                            sensor_data_batch[timestamp_ms] = {
                                'timestamp': timestamp,
                                'ubidots_timestamp': timestamp_ms,
                                'ubidots_device_id': device_id
                            }
                        
                        sensor_data_batch[timestamp_ms][field] = value
                
                # Créer les enregistrements SensorData
                for timestamp_ms, data in sensor_data_batch.items():
                    # Vérifier si déjà existant
                    existing = SensorData.objects.filter(
                        user=user,
                        ubidots_timestamp=timestamp_ms,
                        ubidots_device_id=device_id
                    ).first()
                    
                    if existing:
                        continue  # Skip si déjà existant
                    
                    # Créer nouveau record
                    sensor_data = SensorData.objects.create(
                        user=user,
                        bracelet=bracelet,
                        timestamp=data['timestamp'],
                        ubidots_device_id=data['ubidots_device_id'],
                        ubidots_timestamp=data['ubidots_timestamp'],
                        
                        # Données capteurs
                        spo2=data.get('spo2'),
                        heart_rate=data.get('heart_rate'),
                        temperature=data.get('temperature'),
                        humidity=data.get('humidity'),
                        eco2=data.get('eco2'),
                        tvoc=data.get('tvoc'),
                        respiratory_rate=data.get('respiratory_rate'),
                        
                        activity_level='REST'
                    )
                    
                    total_synced += 1
                
                # Mettre à jour le bracelet
                bracelet.last_sync = timezone.now()
                bracelet.save()
            
            logger.info(f"✅ Synchronisation terminée: {total_synced} nouveaux enregistrements")
            
            return {
                'success': True,
                'total_synced': total_synced,
                'period_hours': hours_back,
                'devices_processed': len(devices)
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur synchronisation Ubidots: {e}")
            return {'error': str(e)}
    
    def get_latest_values(self, device_id, variable_labels):
        """Récupérer les dernières valeurs pour des variables spécifiques"""
        try:
            variables = self.get_device_variables(device_id)
            latest_data = {}
            
            for var in variables:
                var_label = var.get('label', '').lower()
                if var_label in variable_labels:
                    values = self.get_variable_values(var['id'], page_size=1)
                    if values:
                        latest_data[var_label] = {
                            'value': values[0]['value'],
                            'timestamp': values[0]['timestamp']
                        }
            
            return latest_data
            
        except Exception as e:
            logger.error(f"Erreur récupération dernières valeurs: {e}")
            return {}