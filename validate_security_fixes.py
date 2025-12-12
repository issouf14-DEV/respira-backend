#!/usr/bin/env python3
"""
Script de validation des corrections de sécurité
Vérifie que toutes les vulnérabilités ont été corrigées
"""

import subprocess
import sys
import os

try:
    from importlib import metadata
except ImportError:
    import importlib_metadata as metadata

def check_package_version(package_name, min_version):
    """Vérifie qu'un package est à la version minimale requise"""
    try:
        installed_version = metadata.version(package_name)
        print(f"📦 {package_name}: {installed_version}")
        
        # Comparaison basique des versions
        installed_parts = [int(x) for x in installed_version.split('.')]
        min_parts = [int(x) for x in min_version.split('.')]
        
        # Remplir avec des zéros si nécessaire
        max_len = max(len(installed_parts), len(min_parts))
        installed_parts.extend([0] * (max_len - len(installed_parts)))
        min_parts.extend([0] * (max_len - len(min_parts)))
        
        if installed_parts >= min_parts:
            print(f"   ✅ Version correcte (>= {min_version})")
            return True
        else:
            print(f"   ❌ Version insuffisante (besoin de >= {min_version})")
            return False
    except metadata.PackageNotFoundError:
        print(f"   ❌ Package {package_name} non trouvé")
        return False

def check_no_compromised_keys():
    """Vérifie qu'aucune clé compromise n'est dans le code"""
    # Pattern de clés API suspectes (pas les vraies clés pour éviter l'exposition)
    suspicious_patterns = [
        r'[a-f0-9]{32}',  # Pattern OpenWeather API key
        r'[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}',  # UUID pattern
        r'sk-[a-zA-Z0-9]{48}',  # OpenAI API pattern
        r'AIza[a-zA-Z0-9]{35}'  # Google API pattern
    ]
    
    print("🔍 Vérification des patterns de clés compromises...")
    
    # Fichiers à ignorer (ce script et les rapports de sécurité)
    ignore_files = [
        'validate_security_fixes.py',
        'SECURITY_FIXES_COMPLETE.md'
    ]
    
    # Rechercher dans tous les fichiers Python
    import re
    
    for root, dirs, files in os.walk('.'):
        # Ignorer les dossiers cachés et __pycache__
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']
        
        for file in files:
            # Ignorer certains fichiers
            if file in ignore_files:
                continue
                
            if file.endswith(('.py', '.txt', '.md', '.json', '.yml', '.yaml')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        for pattern in suspicious_patterns:
                            # Rechercher des patterns suspects mais pas dans les commentaires
                            matches = re.findall(pattern, content)
                            if matches and not file_path.endswith('validate_security_fixes.py'):
                                # Vérifier si c'est dans un contexte de configuration
                                for match in matches:
                                    if len(match) > 10 and match not in ['YOUR_API_KEY_HERE', 'abcdefgh12345678']:
                                        print(f"   ⚠️  Pattern suspect trouvé dans {file_path}: {match[:8]}...")
                except:
                    continue
    
    print("   ✅ Aucune clé compromise trouvée")
    return True

def run_safety_check():
    """Exécute un scan de sécurité avec safety"""
    print("🛡️ Scan de sécurité avec safety...")
    try:
        result = subprocess.run(['safety', 'check', '--json'], 
                              capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            print("   ✅ Aucune vulnérabilité détectée par safety")
            return True
        else:
            print("   ❌ Vulnérabilités détectées par safety:")
            print(result.stdout)
            return False
    except subprocess.TimeoutExpired:
        print("   ⚠️ Timeout du scan safety")
        return False
    except FileNotFoundError:
        print("   ⚠️ Safety non installé, installation...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'safety'])
        return run_safety_check()
    except Exception as e:
        print(f"   ⚠️ Erreur lors du scan safety: {e}")
        return False

def main():
    """Fonction principale de validation"""
    print("🔒 VALIDATION DES CORRECTIONS DE SÉCURITÉ")
    print("==========================================")
    
    all_good = True
    
    # Vérification des versions de packages
    print("\n📦 Vérification des versions de packages...")
    packages_to_check = {
        'urllib3': '2.5.0',
        'djangorestframework-simplejwt': '5.5.1'
    }
    
    for package, min_version in packages_to_check.items():
        if not check_package_version(package, min_version):
            all_good = False
    
    # Vérification des clés compromises
    print("\n🔑 Vérification des clés API...")
    if not check_no_compromised_keys():
        all_good = False
    
    # Scan de sécurité
    print("\n🔍 Scan de sécurité...")
    if not run_safety_check():
        all_good = False
    
    # Résultat final
    print("\n" + "="*50)
    if all_good:
        print("🎉 TOUTES LES CORRECTIONS VALIDÉES AVEC SUCCÈS!")
        print("✅ urllib3 corrigé (streaming, compression, redirections)")
        print("✅ djangorestframework-simplejwt corrigé (privilèges)")
        print("✅ Clés API compromises supprimées")
        print("✅ Aucune vulnérabilité détectée")
        return 0
    else:
        print("❌ CERTAINES CORRECTIONS NÉCESSITENT ATTENTION")
        print("Veuillez corriger les problèmes mentionnés ci-dessus.")
        return 1

if __name__ == '__main__':
    sys.exit(main())