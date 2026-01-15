"""
Script de vérification finale avant déploiement sur Render
Vérifie que tous les fichiers et configurations sont en place
"""

import os
import sys
from pathlib import Path

def print_header(text):
    """Affiche un en-tête formaté"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def print_success(text):
    """Affiche un message de succès"""
    print(f"✅ {text}")

def print_error(text):
    """Affiche un message d'erreur"""
    print(f"❌ {text}")

def print_warning(text):
    """Affiche un avertissement"""
    print(f"⚠️  {text}")

def check_file_exists(filepath, description):
    """Vérifie qu'un fichier existe"""
    if os.path.exists(filepath):
        print_success(f"{description}: {filepath}")
        return True
    else:
        print_error(f"{description} MANQUANT: {filepath}")
        return False

def check_file_content(filepath, required_strings, description):
    """Vérifie que le fichier contient certaines chaînes"""
    if not os.path.exists(filepath):
        print_error(f"{description} - fichier introuvable: {filepath}")
        return False
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    all_found = True
    for required in required_strings:
        if required not in content:
            print_warning(f"{description} - manquant: {required}")
            all_found = False
    
    if all_found:
        print_success(f"{description} - configuration OK")
    
    return all_found

def main():
    """Fonction principale"""
    print_header("🚀 VÉRIFICATION DÉPLOIEMENT RENDER")
    
    errors = 0
    warnings = 0
    
    # 1. Fichiers essentiels
    print_header("📂 FICHIERS ESSENTIELS")
    
    required_files = [
        ("build.sh", "Script de build"),
        ("Procfile", "Configuration Procfile"),
        ("requirements_render.txt", "Dépendances Python"),
        ("manage.py", "Gestionnaire Django"),
        ("respira_project/settings/production.py", "Settings production"),
        ("respira_project/wsgi.py", "WSGI application"),
    ]
    
    for filepath, description in required_files:
        if not check_file_exists(filepath, description):
            errors += 1
    
    # 2. Contenu build.sh
    print_header("🔧 BUILD.SH")
    
    build_checks = [
        "pip install -r requirements_render.txt",
        "collectstatic",
        "migrate",
    ]
    
    if not check_file_content("build.sh", build_checks, "Build script"):
        warnings += 1
    
    # 3. Contenu Procfile
    print_header("🌐 PROCFILE")
    
    procfile_checks = [
        "gunicorn",
        "respira_project.wsgi",
    ]
    
    if not check_file_content("Procfile", procfile_checks, "Procfile"):
        warnings += 1
    
    # 4. Requirements
    print_header("📦 REQUIREMENTS")
    
    requirements_checks = [
        "Django",
        "gunicorn",
        "psycopg2-binary",
        "dj-database-url",
        "whitenoise",
        "djangorestframework",
    ]
    
    if not check_file_content("requirements_render.txt", requirements_checks, "Requirements"):
        warnings += 1
    
    # 5. Settings production
    print_header("⚙️  SETTINGS PRODUCTION")
    
    production_settings = [
        "DEBUG = False",
        "ALLOWED_HOSTS",
        "dj_database_url",
        "STATIC_ROOT",
        "whitenoise",
    ]
    
    if not check_file_content("respira_project/settings/production.py", production_settings, "Production settings"):
        warnings += 1
    
    # 6. .gitignore
    print_header("🔒 SÉCURITÉ")
    
    gitignore_checks = [
        ".env",
        "SECRET_KEY",
        "__pycache__",
    ]
    
    if os.path.exists(".gitignore"):
        if check_file_content(".gitignore", gitignore_checks, "Gitignore"):
            print_success("Fichiers sensibles protégés")
        else:
            warnings += 1
    else:
        print_warning(".gitignore non trouvé")
        warnings += 1
    
    # 7. Structure des apps
    print_header("📱 STRUCTURE DJANGO")
    
    django_structure = [
        "apps/users",
        "apps/sensors",
        "apps/environment",
        "api/v1",
    ]
    
    for folder in django_structure:
        if os.path.exists(folder):
            print_success(f"App Django: {folder}")
        else:
            print_warning(f"App manquante: {folder}")
            warnings += 1
    
    # 8. Variables d'environnement nécessaires
    print_header("🔐 VARIABLES D'ENVIRONNEMENT REQUISES")
    
    print("\nSur Render, vous DEVEZ configurer:")
    env_vars = [
        "SECRET_KEY - Clé secrète Django (générez-la avec prepare_render_deployment.ps1)",
        "DJANGO_SETTINGS_MODULE=respira_project.settings.production",
        "DATABASE_URL - URL PostgreSQL de Render",
        "PYTHON_VERSION=3.11.0",
        "RENDER=True",
    ]
    
    for var in env_vars:
        print(f"  • {var}")
    
    print("\nOptionnelles (API externes):")
    optional_vars = [
        "IQAIR_API_KEY - API qualité de l'air",
        "OPENWEATHERMAP_API_KEY - API météo",
    ]
    
    for var in optional_vars:
        print(f"  • {var}")
    
    # Résumé
    print_header("📊 RÉSUMÉ")
    
    if errors == 0 and warnings == 0:
        print_success("Tout est prêt pour le déploiement ! 🎉")
        print("\n🚀 Prochaines étapes:")
        print("  1. Exécutez: .\\prepare_render_deployment.ps1")
        print("  2. Lisez: RENDER_DEPLOYMENT.md")
        print("  3. Déployez sur Render !")
        return 0
    elif errors == 0:
        print_warning(f"{warnings} avertissement(s) détecté(s)")
        print("Vous pouvez continuer, mais vérifiez les avertissements ci-dessus.")
        return 0
    else:
        print_error(f"{errors} erreur(s) et {warnings} avertissement(s)")
        print("Corrigez les erreurs avant de déployer.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    print("\n" + "="*60 + "\n")
    sys.exit(exit_code)
