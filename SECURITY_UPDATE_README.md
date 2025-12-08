# 🔐 Corrections de Sécurité - Guide Rapide

**Date**: 8 décembre 2025  
**Statut**: ✅ Toutes les 14 vulnérabilités corrigées

---

## 🚀 Installation Rapide (Recommandé)

Exécutez simplement ce script PowerShell qui fait tout automatiquement :

```powershell
.\install_security_fixes.ps1
```

Ce script va :
- ✅ Mettre à jour toutes les dépendances
- ✅ Installer les packages de sécurité
- ✅ Vérifier les versions
- ✅ Lancer un audit de sécurité
- ✅ Proposer d'exécuter les migrations

---

## 📋 Installation Manuelle

Si vous préférez installer manuellement :

### 1. Activer l'environnement virtuel
```powershell
.\venv\Scripts\Activate.ps1
```

### 2. Mettre à jour pip
```powershell
python -m pip install --upgrade pip
```

### 3. Installer les mises à jour
```powershell
pip install -r requirements.txt
pip install -r requirements\security.txt
```

### 4. Vérifier les versions
```powershell
pip list | Select-String -Pattern "Django|simplejwt|requests"
```

Vous devriez voir :
- ✅ Django **5.1.5** (ou supérieur)
- ✅ djangorestframework-simplejwt **5.4.0** (ou supérieur)
- ✅ requests **2.32.3** (ou supérieur)

### 5. Lancer les migrations
```powershell
python manage.py makemigrations
python manage.py migrate
```

### 6. Tester
```powershell
python manage.py test
```

---

## 📊 Vulnérabilités Corrigées

### 🔴 Critique (1)
- ✅ **#49** - SQL injection via _connector (Django 5.1.5)

### 🟠 Hautes (3)
- ✅ **#48** - DoS HttpResponseRedirect Windows (Django 5.1.5)
- ✅ **#47** - SQL injection alias colonnes (Django 5.1.5)
- ✅ **#45** - SQL injection alias (Django 5.1.5)

### 🟡 Modérées (8)
- ✅ **#40** - DoS validation IPv6 (Django 5.1.5)
- ✅ **#51** - DoS extraction XML (Django 5.1.5 + defusedxml)
- ✅ **#41** - Allocation ressources (Configuration + Django 5.1.5)
- ✅ **#42** - DoS Windows (Django 5.1.5 + Configuration)
- ✅ **#31** - Fuite .netrc (requests 2.32.3)
- ✅ **#43** - DoS strip_tags() (Django 5.1.5)
- ✅ **#50** - SQL injection alias (Django 5.1.5)
- ✅ **#44** - Injection logs (Django 5.1.5 + security_utils.py)

### 🟢 Faibles (2)
- ✅ **#46** - Traversée répertoires (Django 5.1.5 + Configuration)
- ✅ **#32** - Gestion privilèges (simplejwt 5.4.0)

---

## 🛡️ Nouvelles Protections Ajoutées

### 1. Configuration de Sécurité (`settings/base.py`)
```python
# Limites contre DoS
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5 MB
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# Cookies sécurisés
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
```

### 2. Utilitaires de Sécurité (`core/security_utils.py`)

#### Protection SQL Injection
```python
from core.security_utils import SQLInjectionProtection

# Valider les entrées
SQLInjectionProtection.validate_input(user_input)

# Valider les alias de colonnes
SQLInjectionProtection.safe_column_alias(alias)
```

#### Protection XML
```python
from core.security_utils import XMLSecurityHelper

# Parser XML sécurisé
tree = XMLSecurityHelper.safe_xml_parse(xml_string)
```

#### Rate Limiting
```python
from core.security_utils import RateLimitProtection

# Limiter les requêtes
RateLimitProtection.check_rate_limit(user_id, 'endpoint', limit=60)
```

#### Décorateur de Vue
```python
from core.security_utils import protect_against_sql_injection

@protect_against_sql_injection
def my_view(request):
    # Tous les paramètres GET/POST sont validés automatiquement
    pass
```

---

## 🧪 Vérification Post-Installation

### 1. Audit de sécurité
```powershell
# Vérifier les vulnérabilités connues
safety check

# Scan de code avec Bandit
bandit -r . -f json -o security_report.json
```

### 2. Tests fonctionnels
```powershell
# Lancer tous les tests
python manage.py test

# Tests spécifiques
python manage.py test apps.sensors
python manage.py test apps.users
```

### 3. Vérifier le serveur
```powershell
python manage.py runserver
```

Testez les endpoints dans votre navigateur ou avec Postman :
- http://localhost:8000/api/v1/sensors/
- http://localhost:8000/api/v1/users/

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

1. **SECURITY_FIXES.md** - Documentation complète des corrections
2. **core/security_utils.py** - Code source des protections
3. **tutos/SECURITY_GUIDE.md** - Guide de sécurité existant

---

## ⚠️ Notes Importantes

### Production
En production, assurez-vous que :
```python
# Dans settings/production.py
DEBUG = False
ALLOWED_HOSTS = ['votre-domaine.com']
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### Variables d'Environnement
Créez/mettez à jour votre fichier `.env` :
```env
SECRET_KEY=votre-clé-secrète-très-longue-et-aléatoire
DEBUG=False
ALLOWED_HOSTS=votre-domaine.com
DATABASE_URL=postgresql://...
IQAIR_API_KEY=votre-clé
OPENWEATHER_API_KEY=votre-clé
```

### Base de données
Si vous utilisez PostgreSQL en production :
```powershell
# Backup avant migration
pg_dump votre_db > backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql

# Puis migration
python manage.py migrate
```

---

## 🐛 Dépannage

### Erreur : "Module not found: defusedxml"
```powershell
pip install defusedxml
```

### Erreur : "No module named 'core.security_utils'"
Vérifiez que le fichier existe :
```powershell
Test-Path core\security_utils.py
```

### Erreur lors des migrations
```powershell
# Réinitialiser les migrations si nécessaire
python manage.py migrate --fake-initial
```

### Safety check échoue
```powershell
# Mettre à jour safety
pip install --upgrade safety

# Relancer
safety check --json
```

---

## 📞 Support

- **GitHub Issues** : [github.com/issouf14-DEV/respira-backend/issues](https://github.com/issouf14-DEV/respira-backend/issues)
- **Documentation** : Dossier `tutos/`
- **Security** : Utiliser GitHub Security Advisories pour les problèmes critiques

---

## ✅ Checklist Finale

Avant de déployer en production :

- [ ] Toutes les dépendances sont à jour
- [ ] `safety check` ne remonte aucune vulnérabilité critique
- [ ] Les tests passent : `python manage.py test`
- [ ] Les migrations sont appliquées : `python manage.py migrate`
- [ ] Les variables d'environnement sont configurées
- [ ] `DEBUG=False` en production
- [ ] HTTPS activé (`SECURE_SSL_REDIRECT=True`)
- [ ] Backup de la base de données effectué
- [ ] Monitoring et logging configurés

---

**Dernière mise à jour** : 8 décembre 2025  
**Prochaine révision** : 8 janvier 2026  

✅ **Toutes les vulnérabilités GitHub Dependabot sont maintenant corrigées !**
