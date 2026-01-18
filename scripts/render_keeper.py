#!/usr/bin/env python3
"""
🔥 RENDER KEEPER - Service Ultra-Robuste pour maintenir le serveur toujours actif
================================================================================

Ce script garantit que votre serveur Render ne s'endort JAMAIS !

Usage:
    python render_keeper.py                    # Mode normal (ping toutes les 8 minutes)
    python render_keeper.py --aggressive      # Mode agressif (ping toutes les 5 minutes)
    python render_keeper.py --interval 300    # Ping toutes les 5 minutes (300 secondes)
    python render_keeper.py --daemon          # Mode daemon (arrière-plan)
"""

import requests
import time
import sys
import argparse
import threading
import logging
from datetime import datetime
from typing import Optional, Dict, Any

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('render_keeper.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class RenderKeeper:
    """Service ultra-robuste pour maintenir Render actif"""
    
    def __init__(self, 
                 server_url: str = "https://respira-backend.onrender.com",
                 ping_interval: int = 480):  # 8 minutes par défaut
        self.server_url = server_url.rstrip('/')
        self.ping_interval = ping_interval
        self.is_running = False
        self.consecutive_failures = 0
        self.max_failures = 3
        self.stats = {
            'total_pings': 0,
            'successful_pings': 0,
            'failed_pings': 0,
            'wake_ups': 0,
            'start_time': datetime.now()
        }
    
    def ping_endpoint(self, endpoint: str, timeout: int = 30) -> Optional[Dict[Any, Any]]:
        """Ping un endpoint spécifique avec retry automatique"""
        url = f"{self.server_url}/{endpoint.lstrip('/')}"
        
        try:
            response = requests.get(
                url,
                timeout=timeout,
                headers={
                    'User-Agent': 'RenderKeeper/2.0 (Ultra-Robust)',
                    'Accept': 'application/json',
                    'Connection': 'keep-alive'
                }
            )
            
            if response.status_code == 200:
                try:
                    return response.json()
                except:
                    return {'status': 'ok', 'text_response': response.text[:100]}
            else:
                logger.warning(f"❌ Endpoint {endpoint} returned {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            logger.warning(f"⏰ Timeout on {endpoint}")
            return None
        except requests.exceptions.ConnectionError:
            logger.warning(f"🔌 Connection error on {endpoint}")
            return None
        except Exception as e:
            logger.error(f"💥 Unexpected error on {endpoint}: {e}")
            return None
    
    def health_check(self) -> bool:
        """Vérification complète de santé du serveur"""
        logger.info("🏥 Starting health check...")
        
        # Tenter plusieurs endpoints par ordre de priorité
        endpoints = [
            ('ping/', 10),      # Endpoint le plus rapide
            ('health/', 20),    # Health check standard
            ('wake-up/', 30),   # Wake-up si nécessaire
            ('api/v1/', 30),    # API principale
            ('', 30)            # Root endpoint
        ]
        
        for endpoint, timeout in endpoints:
            result = self.ping_endpoint(endpoint, timeout)
            if result:
                logger.info(f"✅ Health check OK via /{endpoint}")
                return True
            time.sleep(2)  # Petite pause entre les tentatives
        
        logger.error("💀 All health checks failed!")
        return False
    
    def aggressive_wake_up(self) -> bool:
        """Réveil agressif avec multiples tentatives"""
        logger.info("🚀 Starting aggressive wake-up sequence...")
        
        # Tenter wake-up plusieurs fois avec timeouts croissants
        timeouts = [30, 45, 60, 90]  # Cold start peut prendre du temps
        
        for i, timeout in enumerate(timeouts, 1):
            logger.info(f"🔄 Wake-up attempt {i}/{len(timeouts)} (timeout: {timeout}s)")
            
            result = self.ping_endpoint('wake-up/', timeout)
            if result:
                logger.info(f"🎉 Wake-up successful on attempt {i}!")
                self.stats['wake_ups'] += 1
                
                # Attendre que le serveur soit complètement prêt
                logger.info("⏳ Waiting for server to be fully ready...")
                time.sleep(15)
                
                # Vérifier que tout fonctionne
                if self.health_check():
                    return True
            
            # Pause progressive entre les tentatives
            if i < len(timeouts):
                pause = 10 * i
                logger.info(f"💤 Waiting {pause}s before next attempt...")
                time.sleep(pause)
        
        logger.error("🔥 Aggressive wake-up failed!")
        return False
    
    def ping_cycle(self) -> bool:
        """Un cycle complet de ping avec fallback"""
        self.stats['total_pings'] += 1
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        logger.info(f"📡 Starting ping cycle #{self.stats['total_pings']} at {timestamp}")
        
        # 1. Tenter un ping normal
        if self.health_check():
            self.stats['successful_pings'] += 1
            self.consecutive_failures = 0
            logger.info("✅ Regular ping successful")
            return True
        
        # 2. Si échec, tenter un wake-up agressif
        logger.warning("⚠️ Regular ping failed, attempting wake-up...")
        self.stats['failed_pings'] += 1
        self.consecutive_failures += 1
        
        if self.aggressive_wake_up():
            logger.info("🎯 Recovery successful via wake-up")
            self.consecutive_failures = 0
            return True
        
        # 3. Si toujours en échec
        logger.error(f"💥 Complete ping cycle failed! (Consecutive failures: {self.consecutive_failures})")
        
        if self.consecutive_failures >= self.max_failures:
            logger.critical("🚨 TOO MANY CONSECUTIVE FAILURES! Check server status!")
        
        return False
    
    def print_stats(self):
        """Affiche les statistiques"""
        uptime = datetime.now() - self.stats['start_time']
        success_rate = (self.stats['successful_pings'] / max(self.stats['total_pings'], 1)) * 100
        
        print("\n" + "="*60)
        print("📊 RENDER KEEPER STATISTICS")
        print("="*60)
        print(f"🕐 Uptime: {uptime}")
        print(f"📡 Total pings: {self.stats['total_pings']}")
        print(f"✅ Successful: {self.stats['successful_pings']} ({success_rate:.1f}%)")
        print(f"❌ Failed: {self.stats['failed_pings']}")
        print(f"🚀 Wake-ups: {self.stats['wake_ups']}")
        print(f"⏱️ Ping interval: {self.ping_interval}s ({self.ping_interval/60:.1f}min)")
        print(f"🔄 Next ping in: {self.ping_interval}s")
        print("="*60)
    
    def run(self, daemon: bool = False):
        """Lance le service de keep-alive"""
        self.is_running = True
        
        print(f"🚀 RENDER KEEPER STARTED!")
        print(f"🎯 Target: {self.server_url}")
        print(f"⏱️ Interval: {self.ping_interval}s ({self.ping_interval/60:.1f}min)")
        print(f"🤖 Daemon mode: {daemon}")
        print("="*60)
        
        # Premier ping immédiat
        logger.info("🔥 Initial ping to wake up server...")
        self.ping_cycle()
        
        try:
            while self.is_running:
                # Attendre l'intervalle
                if not daemon:
                    print(f"\n💤 Waiting {self.ping_interval}s until next ping...")
                    print(f"⏰ Next ping at: {(datetime.now() + timedelta(seconds=self.ping_interval)).strftime('%H:%M:%S')}")
                
                time.sleep(self.ping_interval)
                
                # Effectuer le ping
                if self.is_running:  # Vérifier qu'on n'a pas été interrompu
                    self.ping_cycle()
                    
                    # Afficher les stats toutes les 10 minutes en mode non-daemon
                    if not daemon and self.stats['total_pings'] % max(1, 600 // self.ping_interval) == 0:
                        self.print_stats()
        
        except KeyboardInterrupt:
            logger.info("🛑 Received interrupt signal, stopping...")
            self.is_running = False
        
        except Exception as e:
            logger.error(f"💥 Unexpected error in main loop: {e}")
            self.is_running = False
        
        finally:
            print("\n🏁 RENDER KEEPER STOPPED")
            self.print_stats()

def main():
    """Point d'entrée principal"""
    parser = argparse.ArgumentParser(description='RenderKeeper - Keep your Render server always alive!')
    
    parser.add_argument('--interval', '-i', type=int, default=480,
                       help='Ping interval in seconds (default: 480s = 8min)')
    parser.add_argument('--aggressive', '-a', action='store_true',
                       help='Aggressive mode (5 minutes interval)')
    parser.add_argument('--daemon', '-d', action='store_true',
                       help='Run in daemon mode (less verbose)')
    parser.add_argument('--url', '-u', type=str, default='https://respira-backend.onrender.com',
                       help='Server URL to keep alive')
    
    args = parser.parse_args()
    
    # Mode agressif = 5 minutes
    if args.aggressive:
        args.interval = 300
    
    # Validation de l'intervalle
    if args.interval < 60:
        print("⚠️ Warning: Interval < 60s may be too aggressive")
    if args.interval > 900:  # 15 minutes
        print("⚠️ Warning: Interval > 15min may let server sleep")
    
    # Créer et lancer le keeper
    keeper = RenderKeeper(server_url=args.url, ping_interval=args.interval)
    keeper.run(daemon=args.daemon)

if __name__ == "__main__":
    from datetime import timedelta
    main()