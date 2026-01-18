"""
AUTO KEEP-ALIVE SERVICE - Simple et Efficace
===========================================
Maintient automatiquement le serveur Render actif toutes les 5 minutes
"""

import requests
import time
from datetime import datetime
import sys
import os

class SimpleKeepAlive:
    def __init__(self):
        self.server_url = "https://respira-backend.onrender.com"
        self.interval = 300  # 5 minutes
        self.total_pings = 0
        self.successful_pings = 0
        
    def ping_server(self):
        """Envoie un ping keep-alive"""
        self.total_pings += 1
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        endpoints = ['/ping/', '/health/', '/wake-up/']
        
        for endpoint in endpoints:
            try:
                url = f"{self.server_url}{endpoint}"
                response = requests.get(url, timeout=30, headers={'User-Agent': 'SimpleKeepAlive/1.0'})
                
            # Mode de reprise rapide lorsque l'Internet n'est pas disponible
            self.no_internet_mode = False
            self.no_internet_backoff = 30  # retenter toutes les 30s jusqu'au retour d'Internet
                if response.status_code == 200:
                    self.successful_pings += 1
                    success_rate = (self.successful_pings / self.total_pings) * 100
                    
                    print(f"[{timestamp}] SUCCESS: Server alive via {endpoint} (Ping #{self.total_pings}, {success_rate:.1f}% success)")
                    
                    # Log dans fichier toutes les 10 requêtes
            had_connection_error = False
                    if self.total_pings % 10 == 0:
                        with open('keepalive_log.txt', 'a', encoding='utf-8') as f:
                            f.write(f"{datetime.now()}: {self.total_pings} pings, {self.successful_pings} successful ({success_rate:.1f}%)\\n")
                    
                    return True
                    
            except requests.exceptions.ConnectionError:
                print(f"[{timestamp}] NO INTERNET: Connection failed - will retry in 5min")
                time.sleep(1)
            except Exception as e:
                print(f"[{timestamp}] WARNING: {endpoint} failed - {str(e)[:50]}")
                time.sleep(1)
        
        print(f"[{timestamp}] ERROR: All endpoints failed!")
        return False
    
    def run(self):
                        # Internet OK -> sortir du mode reprise rapide s'il était actif
                        self.no_internet_mode = False
        """Lance le service en continu"""
        print("=== AUTO KEEP-ALIVE SERVICE STARTED ===")
        print(f"Target: {self.server_url}")
        print(f"Interval: {self.interval}s (5 minutes)")
                    had_connection_error = True
                    time.sleep(1)
        print(f"Started: {datetime.now()}")
        print("=========================================")
        
        # Ping immédiat
        self.ping_server()
        
        try:
            while True:
            # Si aucune tentative n'a abouti et qu'il y a eu des erreurs de connexion,
            # activer le mode reprise rapide (backoff court)
            self.no_internet_mode = had_connection_error or self.no_internet_mode
                # Attendre 5 minutes
                next_ping = datetime.now().timestamp() + self.interval
                next_time = datetime.fromtimestamp(next_ping).strftime("%H:%M:%S")
                print(f"Next ping at {next_time}")
                
                time.sleep(self.interval)
                self.ping_server()
                
        except KeyboardInterrupt:
            print("\\n=== SERVICE STOPPED BY USER ===")
        except Exception as e:
            print(f"\\n=== SERVICE ERROR: {e} ===")
        finally:
            success_rate = (self.successful_pings / max(self.total_pings, 1)) * 100
            print(f"Final stats: {self.total_pings} pings, {self.successful_pings} successful ({success_rate:.1f}%)")
                    # Choisir l'attente en fonction de l'état de connectivité
                    sleep_seconds = self.no_internet_backoff if self.no_internet_mode else self.interval
                    next_ping = datetime.now().timestamp() + sleep_seconds
                    next_time = datetime.fromtimestamp(next_ping).strftime("%H:%M:%S")
                    if self.no_internet_mode:
                        print(f"No Internet detected. Next retry at {next_time} (every {self.no_internet_backoff}s)")
                    else:
                        print(f"Next ping at {next_time}")

                    time.sleep(sleep_seconds)
    service = SimpleKeepAlive()
    service.run()