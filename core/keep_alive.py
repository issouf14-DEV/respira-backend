"""
Service Keep-Alive pour maintenir le serveur Render actif
"""
import requests
import threading
import time
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class KeepAliveService:
    """Service pour maintenir le serveur actif sur Render"""
    
    def __init__(self):
        self.server_url = "https://respira-backend.onrender.com"
        self.ping_interval = 10 * 60  # 10 minutes
        self.is_running = False
        self.thread = None
    
    def ping_server(self):
        """Ping le serveur pour le maintenir actif"""
        try:
            response = requests.get(
                f"{self.server_url}/health/",
                timeout=30,
                headers={'User-Agent': 'RespiraKeepAlive/1.0'}
            )
            if response.status_code == 200:
                logger.info("✅ Keep-alive ping successful")
                return True
            else:
                logger.warning(f"⚠️ Keep-alive ping returned {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Keep-alive ping failed: {e}")
            return False
    
    def keep_alive_loop(self):
        """Boucle de maintien en vie"""
        logger.info("🔄 Keep-alive service started")
        while self.is_running:
            self.ping_server()
            time.sleep(self.ping_interval)
        logger.info("⏹️ Keep-alive service stopped")
    
    def start(self):
        """Démarre le service keep-alive"""
        if self.is_running:
            return
        
        self.is_running = True
        self.thread = threading.Thread(target=self.keep_alive_loop, daemon=True)
        self.thread.start()
        logger.info("🚀 Keep-alive service launched")
    
    def stop(self):
        """Arrête le service keep-alive"""
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("⏹️ Keep-alive service stopped")

# Instance globale
keep_alive_service = KeepAliveService()