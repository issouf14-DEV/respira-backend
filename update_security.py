#!/usr/bin/env python3
"""
Script de mise à jour automatique des dépendances de sécurité
"""
import subprocess
import sys
import json
from datetime import datetime

def update_dependencies():
    """Mettre à jour toutes les dépendances vers les versions les plus sécurisées"""
    print("🚀 MISE À JOUR DES DÉPENDANCES DE SÉCURITÉ")
    print("=" * 60)
    
    # 1. Sauvegarder les requirements actuels
    backup_date = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"requirements_backup_{backup_date}.txt"
    
    try:
        subprocess.run([
            "pip", "freeze", ">", backup_file
        ], shell=True, check=True)
        print(f"✅ Sauvegarde créée: {backup_file}")
    except subprocess.CalledProcessError:
        print("⚠️ Impossible de créer la sauvegarde")
    
    # 2. Mise à jour de pip
    print("\n📦 Mise à jour de pip...")
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "--upgrade", "pip"
        ], check=True, capture_output=True)
        print("✅ pip mis à jour")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur pip: {e}")
    
    # 3. Installer les dépendances mises à jour
    requirements_files = [
        "requirements/base.txt",
        "requirements/security.txt"
    ]
    
    for req_file in requirements_files:
        if subprocess.run(["test", "-f", req_file], shell=True).returncode == 0:
            print(f"\n📚 Installation de {req_file}...")
            try:
                subprocess.run([
                    sys.executable, "-m", "pip", "install", "-r", req_file, "--upgrade"
                ], check=True)
                print(f"✅ {req_file} installé")
            except subprocess.CalledProcessError as e:
                print(f"❌ Erreur avec {req_file}: {e}")
        else:
            print(f"⚠️ Fichier non trouvé: {req_file}")
    
    # 4. Audit de sécurité post-mise à jour
    print("\n🔒 Audit de sécurité post-mise à jour...")
    
    # Safety check
    try:
        result = subprocess.run([
            sys.executable, "-m", "safety", "check"
        ], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Safety: Aucune vulnérabilité")
        else:
            print(f"⚠️ Safety: {result.stdout}")
    except FileNotFoundError:
        print("⚠️ Safety non disponible")
    
    # pip-audit
    try:
        result = subprocess.run([
            sys.executable, "-m", "pip_audit"
        ], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ pip-audit: Aucune vulnérabilité")
        else:
            print(f"⚠️ pip-audit: {result.stdout}")
    except FileNotFoundError:
        print("⚠️ pip-audit non disponible")
    
    # 5. Générer un rapport de mise à jour
    print("\n📊 Génération du rapport...")
    try:
        result = subprocess.run([
            "pip", "list", "--format=json"
        ], capture_output=True, text=True, shell=True)
        
        if result.returncode == 0:
            packages = json.loads(result.stdout)
            report_file = f"update_report_{backup_date}.json"
            
            report_data = {
                "timestamp": datetime.now().isoformat(),
                "packages_count": len(packages),
                "packages": packages
            }
            
            with open(report_file, 'w') as f:
                json.dump(report_data, f, indent=2)
            
            print(f"✅ Rapport généré: {report_file}")
        
    except Exception as e:
        print(f"⚠️ Erreur génération rapport: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 MISE À JOUR TERMINÉE")
    print("Redémarrez votre application pour prendre en compte les changements.")

if __name__ == "__main__":
    update_dependencies()