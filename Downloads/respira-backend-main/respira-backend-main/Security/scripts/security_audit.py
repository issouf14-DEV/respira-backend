#!/usr/bin/env python3
"""
Script d'audit de sécurité pour Respira Backend
"""
import subprocess
import sys
import os

def run_security_audit():
    """Exécuter un audit de sécurité complet"""
    print("🛡️ AUDIT DE SÉCURITÉ RESPIRA BACKEND")
    print("=" * 50)
    
    # 1. Mettre à jour pip
    print("\n1. Mise à jour de pip...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], 
                      check=True, capture_output=True)
        print("✅ pip mis à jour")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur mise à jour pip: {e}")
    
    # 2. Installer les packages de sécurité
    print("\n2. Installation des outils de sécurité...")
    security_tools = ["safety", "bandit", "pip-audit"]
    
    for tool in security_tools:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", tool], 
                          check=True, capture_output=True)
            print(f"✅ {tool} installé")
        except subprocess.CalledProcessError:
            print(f"⚠️ Impossible d'installer {tool}")
    
    # 3. Audit des dépendances avec Safety
    print("\n3. Audit des vulnérabilités avec Safety...")
    try:
        result = subprocess.run([sys.executable, "-m", "safety", "check", "--json"], 
                               capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Aucune vulnérabilité détectée par Safety")
        else:
            print("⚠️ Vulnérabilités détectées par Safety:")
            print(result.stdout)
    except FileNotFoundError:
        print("⚠️ Safety non disponible")
    
    # 4. Audit avec pip-audit
    print("\n4. Audit avec pip-audit...")
    try:
        result = subprocess.run([sys.executable, "-m", "pip_audit"], 
                               capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Aucune vulnérabilité détectée par pip-audit")
        else:
            print("⚠️ Vulnérabilités détectées par pip-audit:")
            print(result.stdout)
    except FileNotFoundError:
        print("⚠️ pip-audit non disponible")
    
    # 5. Analyse statique avec Bandit
    print("\n5. Analyse statique du code avec Bandit...")
    try:
        result = subprocess.run([
            sys.executable, "-m", "bandit", "-r", ".", 
            "-x", "./venv,./env,./.venv",
            "-f", "txt"
        ], capture_output=True, text=True)
        
        if result.returncode in [0, 1]:  # 0 = OK, 1 = issues found
            if "No issues identified" in result.stdout:
                print("✅ Aucun problème de sécurité détecté par Bandit")
            else:
                print("⚠️ Problèmes de sécurité détectés par Bandit:")
                print(result.stdout)
        else:
            print(f"❌ Erreur Bandit: {result.stderr}")
    except FileNotFoundError:
        print("⚠️ Bandit non disponible")
    
    # 6. Vérification des fichiers sensibles
    print("\n6. Vérification des fichiers sensibles...")
    sensitive_files = [".env", ".env.production", "secrets.json", "private.key"]
    git_tracked = []
    
    try:
        result = subprocess.run(["git", "ls-files"], capture_output=True, text=True)
        if result.returncode == 0:
            tracked_files = result.stdout.strip().split('\n')
            for sensitive in sensitive_files:
                if sensitive in tracked_files:
                    git_tracked.append(sensitive)
        
        if git_tracked:
            print(f"❌ Fichiers sensibles trackés par Git: {', '.join(git_tracked)}")
        else:
            print("✅ Aucun fichier sensible tracké par Git")
    except FileNotFoundError:
        print("⚠️ Git non disponible")
    
    # 7. Vérification de la configuration Django
    print("\n7. Vérification de la configuration Django...")
    checks = []
    
    # Vérifier DEBUG
    if os.getenv('DEBUG', 'True').lower() == 'true':
        checks.append("⚠️ DEBUG=True (OK en développement, à changer en production)")
    else:
        checks.append("✅ DEBUG=False")
    
    # Vérifier SECRET_KEY
    secret_key = os.getenv('SECRET_KEY', '')
    if not secret_key or secret_key == 'dev-key-change-in-production':
        checks.append("❌ SECRET_KEY par défaut détectée")
    else:
        checks.append("✅ SECRET_KEY personnalisée")
    
    # Vérifier ALLOWED_HOSTS
    allowed_hosts = os.getenv('ALLOWED_HOSTS', '')
    if not allowed_hosts:
        checks.append("⚠️ ALLOWED_HOSTS non configuré")
    else:
        checks.append("✅ ALLOWED_HOSTS configuré")
    
    for check in checks:
        print(f"  {check}")
    
    print("\n" + "=" * 50)
    print("🎯 AUDIT TERMINÉ")
    print("Consultez les warnings ci-dessus et corrigez les problèmes identifiés.")

if __name__ == "__main__":
    run_security_audit()