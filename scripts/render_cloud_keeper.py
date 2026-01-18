"""
🌐 RENDER CLOUD KEEPER - Service cloud pour maintenir Render actif 24/7
=======================================================================

Ce script est conçu pour être déployé sur un service cloud gratuit (comme Heroku, 
Railway, ou un VPS) pour maintenir votre serveur Render principal actif en permanence.

Fonctionnalités:
- Multi-endpoint monitoring
- Auto-recovery intelligent  
- Webhook notifications
- Health checks avancés
- Métriques et logging
"""

import os
import json
import time
import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from flask import Flask, jsonify, request

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('RenderCloudKeeper')

@dataclass
class ServerStats:
    total_checks: int = 0
    successful_checks: int = 0
    failed_checks: int = 0
    wake_ups: int = 0
    last_success: Optional[datetime] = None
    last_failure: Optional[datetime] = None
    consecutive_failures: int = 0
    uptime_start: datetime = datetime.now()

class RenderCloudKeeper:
    """Service cloud de keep-alive pour Render"""
    
    def __init__(self):
        self.server_url = os.getenv('TARGET_SERVER_URL', 'https://respira-backend.onrender.com')
        self.check_interval = int(os.getenv('CHECK_INTERVAL', '300'))  # 5 minutes
        self.max_consecutive_failures = int(os.getenv('MAX_FAILURES', '3'))
        self.webhook_url = os.getenv('WEBHOOK_URL')  # Pour notifications Discord/Slack
        
        self.stats = ServerStats()
        self.is_running = False
        
        # Endpoints à surveiller par ordre de priorité
        self.endpoints = [
            {'path': 'ping/', 'timeout': 10, 'critical': True},
            {'path': 'health/', 'timeout': 20, 'critical': True},
            {'path': 'wake-up/', 'timeout': 60, 'critical': False},
            {'path': 'api/v1/', 'timeout': 30, 'critical': False},
            {'path': '', 'timeout': 30, 'critical': False}
        ]
    
    async def check_endpoint(self, session: aiohttp.ClientSession, endpoint: Dict) -> bool:
        """Vérifie un endpoint spécifique"""
        url = f"{self.server_url.rstrip('/')}/{endpoint['path']}"
        
        try:
            timeout = aiohttp.ClientTimeout(total=endpoint['timeout'])
            async with session.get(
                url, 
                timeout=timeout,
                headers={'User-Agent': 'RenderCloudKeeper/1.0'}
            ) as response:
                
                if response.status == 200:
                    # Tenter de parser JSON si possible
                    try:
                        data = await response.json()
                        logger.info(f"✅ {endpoint['path']} OK - {data.get('status', 'success')}")
                    except:
                        text = await response.text()
                        logger.info(f"✅ {endpoint['path']} OK - {len(text)} bytes")
                    return True
                else:
                    logger.warning(f"❌ {endpoint['path']} returned {response.status}")
                    return False
                    
        except asyncio.TimeoutError:
            logger.warning(f"⏰ {endpoint['path']} timeout ({endpoint['timeout']}s)")
            return False
        except aiohttp.ClientError as e:
            logger.warning(f"🔌 {endpoint['path']} connection error: {e}")
            return False
        except Exception as e:
            logger.error(f"💥 {endpoint['path']} unexpected error: {e}")
            return False
    
    async def health_check(self) -> bool:
        """Effectue un health check complet"""
        logger.info("🏥 Starting comprehensive health check...")
        
        async with aiohttp.ClientSession() as session:
            # Vérifier les endpoints critiques d'abord
            critical_endpoints = [ep for ep in self.endpoints if ep.get('critical', False)]
            
            for endpoint in critical_endpoints:
                if await self.check_endpoint(session, endpoint):
                    logger.info(f"✅ Critical endpoint {endpoint['path']} is healthy")
                    return True
                
                # Petite pause entre les tentatives critiques
                await asyncio.sleep(2)
            
            # Si les critiques échouent, tenter les autres
            logger.warning("⚠️ Critical endpoints failed, trying others...")
            other_endpoints = [ep for ep in self.endpoints if not ep.get('critical', False)]
            
            for endpoint in other_endpoints:
                if await self.check_endpoint(session, endpoint):
                    logger.info(f"✅ Fallback endpoint {endpoint['path']} responded")
                    return True
                await asyncio.sleep(1)
        
        logger.error("💀 All health checks failed!")
        return False
    
    async def aggressive_wake_up(self) -> bool:
        """Réveil agressif avec multiple tentatives"""
        logger.info("🚀 Starting aggressive wake-up sequence...")
        
        wake_endpoints = ['wake-up/', 'ping/', 'health/']
        timeouts = [60, 45, 30]  # Timeouts dégressifs
        
        async with aiohttp.ClientSession() as session:
            for attempt in range(3):
                logger.info(f"🔄 Wake-up attempt {attempt + 1}/3")
                
                for endpoint in wake_endpoints:
                    timeout = timeouts[min(attempt, len(timeouts) - 1)]
                    
                    if await self.check_endpoint(session, {'path': endpoint, 'timeout': timeout}):
                        logger.info(f"🎉 Wake-up successful via {endpoint}!")
                        self.stats.wake_ups += 1
                        
                        # Attendre que le serveur soit prêt
                        logger.info("⏳ Waiting for server to stabilize...")
                        await asyncio.sleep(20)
                        
                        # Vérifier que tout va bien
                        if await self.health_check():
                            return True
                
                # Pause entre les tentatives
                if attempt < 2:
                    pause = 15 * (attempt + 1)
                    logger.info(f"💤 Waiting {pause}s before next attempt...")
                    await asyncio.sleep(pause)
        
        logger.error("🔥 All wake-up attempts failed!")
        return False
    
    async def send_notification(self, message: str, level: str = "info"):
        """Envoie une notification webhook"""
        if not self.webhook_url:
            return
        
        payload = {
            'text': f"🤖 RenderCloudKeeper: {message}",
            'timestamp': datetime.now().isoformat(),
            'level': level,
            'server': self.server_url,
            'stats': asdict(self.stats)
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(self.webhook_url, json=payload, timeout=10)
                logger.info(f"📢 Notification sent: {message}")
        except Exception as e:
            logger.warning(f"📢 Failed to send notification: {e}")
    
    async def monitoring_cycle(self):
        """Un cycle complet de monitoring"""
        self.stats.total_checks += 1
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        logger.info(f"📡 Starting monitoring cycle #{self.stats.total_checks} at {timestamp}")
        
        # 1. Health check normal
        if await self.health_check():
            self.stats.successful_checks += 1
            self.stats.last_success = datetime.now()
            self.stats.consecutive_failures = 0
            
            # Notification de récupération si on sort d'une panne
            if self.stats.consecutive_failures == 0 and self.stats.failed_checks > 0:
                await self.send_notification("✅ Server recovered and healthy", "success")
            
            logger.info("✅ Monitoring cycle successful")
            return True
        
        # 2. Échec détecté
        self.stats.failed_checks += 1
        self.stats.last_failure = datetime.now()
        self.stats.consecutive_failures += 1
        
        logger.warning(f"⚠️ Health check failed (consecutive: {self.stats.consecutive_failures})")
        
        # 3. Tentative de récupération
        if await self.aggressive_wake_up():
            logger.info("🎯 Recovery successful via wake-up")
            await self.send_notification("🚀 Server awakened successfully", "recovery")
            return True
        
        # 4. Échec total
        logger.error(f"💥 Complete monitoring cycle failed!")
        
        # Notification d'alerte si trop d'échecs consécutifs
        if self.stats.consecutive_failures >= self.max_consecutive_failures:
            await self.send_notification(
                f"🚨 CRITICAL: {self.stats.consecutive_failures} consecutive failures!",
                "critical"
            )
        
        return False
    
    async def run_monitoring(self):
        """Lance le monitoring en continu"""
        self.is_running = True
        
        logger.info(f"🚀 RENDER CLOUD KEEPER STARTED!")
        logger.info(f"🎯 Target: {self.server_url}")
        logger.info(f"⏱️ Check interval: {self.check_interval}s ({self.check_interval/60:.1f}min)")
        
        # Notification de démarrage
        await self.send_notification("🚀 RenderCloudKeeper started", "info")
        
        # Premier check immédiat
        await self.monitoring_cycle()
        
        try:
            while self.is_running:
                await asyncio.sleep(self.check_interval)
                await self.monitoring_cycle()
                
        except Exception as e:
            logger.error(f"💥 Error in monitoring loop: {e}")
            await self.send_notification(f"💥 Monitoring error: {e}", "error")
        
        finally:
            logger.info("🛑 Monitoring stopped")
            await self.send_notification("🛑 RenderCloudKeeper stopped", "warning")
    
    def get_stats(self) -> Dict:
        """Retourne les statistiques actuelles"""
        uptime = datetime.now() - self.stats.uptime_start
        success_rate = (self.stats.successful_checks / max(self.stats.total_checks, 1)) * 100
        
        return {
            'server_url': self.server_url,
            'uptime_seconds': int(uptime.total_seconds()),
            'uptime_human': str(uptime),
            'total_checks': self.stats.total_checks,
            'successful_checks': self.stats.successful_checks,
            'failed_checks': self.stats.failed_checks,
            'wake_ups': self.stats.wake_ups,
            'success_rate': round(success_rate, 2),
            'consecutive_failures': self.stats.consecutive_failures,
            'last_success': self.stats.last_success.isoformat() if self.stats.last_success else None,
            'last_failure': self.stats.last_failure.isoformat() if self.stats.last_failure else None,
            'check_interval': self.check_interval,
            'status': 'healthy' if self.stats.consecutive_failures == 0 else 'degraded'
        }

# =====================================
# WEB API pour monitoring et contrôle
# =====================================

app = Flask(__name__)
keeper = RenderCloudKeeper()

@app.route('/')
def index():
    """Page d'accueil du service"""
    return jsonify({
        'service': 'RenderCloudKeeper',
        'version': '1.0.0',
        'status': 'running' if keeper.is_running else 'stopped',
        'endpoints': {
            'stats': '/stats',
            'health': '/health',
            'start': '/start',
            'stop': '/stop'
        }
    })

@app.route('/stats')
def get_stats():
    """Retourne les statistiques de monitoring"""
    return jsonify(keeper.get_stats())

@app.route('/health')
def health():
    """Health check du keeper lui-même"""
    stats = keeper.get_stats()
    is_healthy = (
        keeper.is_running and 
        stats['consecutive_failures'] < keeper.max_consecutive_failures
    )
    
    return jsonify({
        'status': 'healthy' if is_healthy else 'unhealthy',
        'keeper_running': keeper.is_running,
        'consecutive_failures': stats['consecutive_failures'],
        'max_failures': keeper.max_consecutive_failures
    }), 200 if is_healthy else 503

@app.route('/start', methods=['POST'])
def start_monitoring():
    """Démarre le monitoring"""
    if keeper.is_running:
        return jsonify({'message': 'Already running'}), 400
    
    # Lancer le monitoring en arrière-plan
    asyncio.create_task(keeper.run_monitoring())
    
    return jsonify({'message': 'Monitoring started'})

@app.route('/stop', methods=['POST'])
def stop_monitoring():
    """Arrête le monitoring"""
    keeper.is_running = False
    return jsonify({'message': 'Monitoring stopped'})

def main():
    """Point d'entrée pour déploiement cloud"""
    port = int(os.environ.get('PORT', 5000))
    
    # Démarrer le monitoring automatiquement
    asyncio.create_task(keeper.run_monitoring())
    
    # Lancer l'API web
    app.run(host='0.0.0.0', port=port)

if __name__ == '__main__':
    main()