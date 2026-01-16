#!/usr/bin/env python3
"""
Script externe de Keep-Alive pour maintenir le serveur Render actif
À exécuter depuis un serveur externe ou un service de cron
"""
import requests
import time
import sys
from datetime import datetime

def ping_server(url="https://respira-backend.onrender.com"):
    """Ping le serveur RespirIA"""
    try:
        response = requests.get(
            f"{url}/ping/",
            timeout=30,
            headers={'User-Agent': 'RespiraKeepAlive/External'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {datetime.now()}: Server alive - {data.get('timestamp', 'OK')}")
            return True
        else:
            print(f"⚠️ {datetime.now()}: Server returned {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ {datetime.now()}: Ping failed - {e}")
        return False

def wake_up_server(url="https://respira-backend.onrender.com"):
    """Réveille le serveur s'il est endormi"""
    try:
        response = requests.get(
            f"{url}/wake-up/",
            timeout=60,  # Plus long timeout pour cold start
            headers={'User-Agent': 'RespiraKeepAlive/WakeUp'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"🚀 {datetime.now()}: {data.get('message', 'Server awakened')}")
            return True
        else:
            print(f"⚠️ {datetime.now()}: Wake-up returned {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ {datetime.now()}: Wake-up failed - {e}")
        return False

def keep_alive_loop(interval_minutes=10):
    """Boucle de maintien en vie"""
    print(f"🔄 Starting keep-alive loop (every {interval_minutes} minutes)")
    print("Press Ctrl+C to stop")
    
    try:
        while True:
            # Essayer d'abord un ping simple
            if not ping_server():
                print("⏰ Server seems down, trying wake-up...")
                wake_up_server()
                time.sleep(10)  # Attendre après wake-up
            
            # Attendre avant le prochain ping
            time.sleep(interval_minutes * 60)
            
    except KeyboardInterrupt:
        print(f"\n⏹️ Keep-alive stopped by user")
    except Exception as e:
        print(f"❌ Keep-alive loop error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        interval = int(sys.argv[1])
    else:
        interval = 10
    
    print(f"🚀 RespirIA Keep-Alive Script")
    print(f"Target: https://respira-backend.onrender.com")
    print(f"Interval: {interval} minutes")
    print("-" * 50)
    
    keep_alive_loop(interval)