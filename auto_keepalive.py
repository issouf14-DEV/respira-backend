"""
🔥 AUTO KEEP-ALIVE - Maintient automatiquement le serveur Render actif
===================================================================

Ce script envoie une requête toutes les 5 minutes pour empêcher le serveur de s'endormir.
Il fonctionne en continu en arrière-plan.
"""

import requests
import time
import threading
from datetime import datetime
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('auto_keepalive.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('AutoKeepAlive')

class AutoKeepAlive:
    def __init__(self):
        self.server_url = "https://respira-backend.onrender.com"
        self.interval = 300  # 5 minutes en secondes
        self.running = False
        self.stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'start_time': datetime.now()
        }
    
    def send_keepalive_request(self):
        """Envoie une requête keep-alive au serveur"""
        endpoints = [
            '/ping/',
            '/health/', 
            '/wake-up/',
            '/api/v1/'
        ]
        
        self.stats['total_requests'] += 1
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        for endpoint in endpoints:
            try:
                url = f"{self.server_url}{endpoint}"
                logger.info(f"[{timestamp}] Sending keep-alive to {endpoint}")
                
                response = requests.get(
                    url,
                    timeout=30,
                    headers={
                        'User-Agent': 'AutoKeepAlive/1.0',
                        'Accept': 'application/json'
                    }
                )
                
                if response.status_code == 200:
                    self.stats['successful_requests'] += 1
                    logger.info(f"SUCCESS [{timestamp}] Server responded OK via {endpoint}")
                    self.print_stats()
                    return True
                else:
                    logger.warning(f"WARNING [{timestamp}] {endpoint} returned {response.status_code}")
                    
            except requests.exceptions.Timeout:
                logger.warning(f"TIMEOUT [{timestamp}] Timeout on {endpoint}")
            except requests.exceptions.ConnectionError:
                logger.warning(f"CONNECTION [{timestamp}] Connection error on {endpoint}")
            except Exception as e:
                logger.error(f"ERROR [{timestamp}] Error on {endpoint}: {e}")
            
            # Petite pause entre les endpoints
            time.sleep(1)
        
        # Si tous les endpoints échouent
        self.stats['failed_requests'] += 1
        logger.error(f"FAILED [{timestamp}] All endpoints failed!")
        return False
    
    def print_stats(self):
        """Affiche les statistiques"""
        uptime = datetime.now() - self.stats['start_time']
        success_rate = (self.stats['successful_requests'] / max(self.stats['total_requests'], 1)) * 100
        
        # Afficher les stats tous les 10 pings
        if self.stats['total_requests'] % 10 == 0:
            print("\n" + "="*50)
            print("AUTO KEEP-ALIVE STATISTICS")
            print("="*50)
            print(f"Running time: {uptime}")
            print(f"Total requests: {self.stats['total_requests']}")
            print(f"Successful: {self.stats['successful_requests']} ({success_rate:.1f}%)")
            print(f"Failed: {self.stats['failed_requests']}")
            print(f"Target: {self.server_url}")
            print(f"Interval: {self.interval}s ({self.interval//60}min)")
            print("="*50)
    
    def run_forever(self):
        """Lance le keep-alive en continu"""
        self.running = True
        
        print("AUTO KEEP-ALIVE STARTED!")
        print(f"Target: {self.server_url}")
        print(f"Sending requests every {self.interval}s ({self.interval//60} minutes)")
        print("Running in background... Press Ctrl+C to stop")
        print("="*60)
        
        # Premier ping immédiat
        logger.info("Sending initial keep-alive request...")
        self.send_keepalive_request()
        
        try:
            while self.running:
                # Attendre l'intervalle
                next_ping = datetime.now().timestamp() + self.interval
                
                for remaining in range(self.interval, 0, -10):
                    if not self.running:
                        break
                    
                    if remaining % 60 == 0:  # Afficher toutes les minutes
                        next_time = datetime.fromtimestamp(next_ping).strftime("%H:%M:%S")
                        logger.info(f"Next ping in {remaining//60}min at {next_time}")
                    
                    time.sleep(10)  # Vérifier toutes les 10 secondes si on doit arrêter
                
                # Envoyer la requête keep-alive
                if self.running:
                    self.send_keepalive_request()
        
        except KeyboardInterrupt:
            logger.info("STOP: Received stop signal...")
            self.running = False
        
        except Exception as e:
            logger.error(f"ERROR: Unexpected error: {e}")
            self.running = False
        
        finally:
            print("\nAUTO KEEP-ALIVE STOPPED")
            self.print_stats()

def main():
    """Lance le service automatique"""
    keeper = AutoKeepAlive()
    keeper.run_forever()

if __name__ == "__main__":
    main()