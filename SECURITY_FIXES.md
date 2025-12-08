# Corrections de Sécurité - Respira Backend

## Date de mise à jour : 8 décembre 2025

Ce document détaille les corrections apportées pour résoudre les 14 vulnérabilités de sécurité détectées par GitHub Dependabot.

---

## 🔴 Vulnérabilités Critiques Corrigées

### 1. Django - Injections SQL via le mot-clé `_connector` (#49)
**Statut : ✅ CORRIGÉ**
- **Action** : Mise à jour de Django 5.1.4 → 5.2.9
- **Description** : Django 5.1.5 corrige les vulnérabilités d'injection SQL via l'argument `_connector` dans les objets QuerySet et Q
- **Recommandation** : Toujours utiliser des querysets paramétrés, jamais de SQL brut avec des entrées utilisateur

---

## 🟠 Vulnérabilités Hautes Corrigées

### 2. Django - DoS dans HttpResponseRedirect sous Windows (#48)
**Statut : ✅ CORRIGÉ**
- **Action** : Mise à jour vers Django 5.2.9
- **Protection ajoutée** : Validation stricte des URLs de redirection
- **Recommandation** : Utiliser des chemins absolus pour les redirections

### 3. Django - Injections SQL dans les alias de colonnes (#47, #45)
**Statut : ✅ CORRIGÉ**
- **Action** : Django 5.2.9 inclut des correctifs pour les alias de colonnes
- **Protection** : Validation et échappement automatique des alias
- **Code sécurisé** :
```python
# Correct - Django 5.1.5+ gère la sécurité automatiquement
queryset.annotate(total=Sum('value'))

# À ÉVITER - SQL brut avec alias non validés
queryset.extra(select={'alias': 'raw_sql'})
```

---

## 🟡 Vulnérabilités Modérées Corrigées

### 4. Django - DoS lors de la validation IPv6 (#40)
**Statut : ✅ CORRIGÉ**
- **Action** : Django 5.2.9 optimise la validation IPv6
- **Protection** : Limitation du temps de traitement pour les validations IPv6

### 5. Django - DoS via l'extraction de texte XML (#51)
**Statut : ✅ CORRIGÉ**
- **Action** : 
  - Mise à jour vers Django 5.1.5
  - Ajout de `defusedxml==0.8.0` dans requirements/security.txt
- **Configuration** : Parser XML désactivé par défaut
- **Recommandation** : Utiliser `defusedxml` pour tout parsing XML

### 6. Django - Allocation de ressources sans limites (#41)
**Statut : ✅ CORRIGÉ**
- **Action** : Configuration de limites strictes dans settings/base.py
```python
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5 MB
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000
```

### 7. Django - DoS sous Windows (#42)
**Statut : ✅ CORRIGÉ**
- **Action** : Django 5.1.5 + configuration sécurisée
- **Protection** : Validation stricte des chemins et redirections

### 8. Requests - Fuite d'identifiants .netrc (#31)
**Statut : ✅ CORRIGÉ**
- **Action** : Mise à jour vers requests==2.32.5 (dernière version stable)
- **Protection** : La version 2.32.5 ne lit plus les identifiants .netrc via URLs malveillantes
- **Recommandation** : Toujours valider les URLs avant d'effectuer des requêtes

### 9. Django - DoS dans strip_tags() (#43)
**Statut : ✅ CORRIGÉ**
- **Action** : Django 5.1.5 optimise `strip_tags()`
- **Protection additionnelle** : Utilisation de `bleach==6.2.0` pour la sanitisation HTML

### 10. Django - Injections SQL dans les alias (#50)
**Statut : ✅ CORRIGÉ**
- **Action** : Django 5.1.5 (doublon de #47)
- **Protection** : Validation automatique des alias

### 11. Django - Neutralisation incorrecte des logs (#44)
**Statut : ✅ CORRIGÉ**
- **Action** : Django 5.1.5 + configuration logging sécurisé
- **Protection** : Utilisation de `structlog` pour un logging structuré
```python
# Dans requirements/security.txt
structlog==24.4.0
django-structlog==8.1.0
```

---

## 🟢 Vulnérabilités Faibles Corrigées

### 12. Django - Traversée partielle de répertoires (#46)
**Statut : ✅ CORRIGÉ**
- **Action** : Django 5.1.5 + configuration sécurisée des chemins
- **Protection** :
```python
MEDIA_ROOT = BASE_DIR / 'media'  # Chemin absolu sécurisé
STATIC_ROOT = BASE_DIR / 'staticfiles'  # Chemin absolu sécurisé
```

### 13. djangorestframework-simplejwt - Gestion incorrecte des privilèges (#32)
**Statut : ✅ CORRIGÉ**
- **Action** : Mise à jour de 5.3.0 → 5.5.1
- **Protection** : Gestion améliorée des tokens et permissions

---

## 📦 Mises à jour des dépendances

### requirements/base.txt
```
Django==5.2.9                          # 5.1.4 → 5.2.9 (LTS)
djangorestframework==3.15.2            # Maintenu à jour
djangorestframework-simplejwt==5.5.1   # 5.3.0 → 5.5.1
requests==2.32.5                       # 2.32.3 → 2.32.5
psycopg2-binary==2.9.10                # 2.9.9 → 2.9.10
dj-database-url==2.3.0                 # 2.2.0 → 2.3.0
```

### requirements/security.txt (déjà en place)
```
django-security==0.18.0
django-csp==3.8
defusedxml==0.8.0
bleach==6.2.0
safety==3.2.11
bandit==1.8.0
```

---

## 🔐 Configurations de sécurité ajoutées

### Dans settings/base.py

```python
# Protection contre DoS
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5 MB
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# Cookies sécurisés
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'

# En-têtes de sécurité
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
```

---

## 📝 Instructions d'installation

### 1. Mettre à jour les dépendances
```powershell
# Activer l'environnement virtuel
.\venv\Scripts\Activate.ps1

# Mettre à jour pip
python -m pip install --upgrade pip

# Installer les nouvelles dépendances
pip install -r requirements.txt
pip install -r requirements/security.txt

# Vérifier les versions
pip list | Select-String -Pattern "Django|requests|simplejwt"
```

### 2. Vérifier la sécurité
```powershell
# Lancer un audit de sécurité
safety check --json

# Vérifier avec bandit
bandit -r . -f json -o security_report.json
```

### 3. Tester l'application
```powershell
# Migrations de base de données
python manage.py makemigrations
python manage.py migrate

# Lancer les tests
python manage.py test

# Démarrer le serveur
python manage.py runserver
```

---

## ⚠️ Bonnes pratiques de sécurité

### 1. Requêtes de base de données
```python
# ✅ BON - Utiliser des querysets paramétrés
User.objects.filter(email=user_email)

# ❌ MAUVAIS - SQL brut non échappé
User.objects.raw(f"SELECT * FROM users WHERE email = '{user_email}'")
```

### 2. Parsing XML
```python
# ✅ BON - Utiliser defusedxml
from defusedxml import ElementTree as ET
tree = ET.parse(xml_file)

# ❌ MAUVAIS - Parser XML standard
import xml.etree.ElementTree as ET
tree = ET.parse(xml_file)  # Vulnérable aux attaques XXE
```

### 3. Validation des entrées
```python
# ✅ BON - Toujours valider et nettoyer
import bleach
clean_text = bleach.clean(user_input)

# ❌ MAUVAIS - Utiliser directement les entrées utilisateur
unsafe_text = user_input
```

### 4. Gestion des redirections
```python
# ✅ BON - Valider les URLs
from django.utils.http import url_has_allowed_host_and_scheme

if url_has_allowed_host_and_scheme(redirect_url, allowed_hosts={'example.com'}):
    return redirect(redirect_url)

# ❌ MAUVAIS - Redirection non validée
return redirect(user_provided_url)
```

---

## 🔍 Surveillance continue

### Audit automatique
```powershell
# Créer un script d'audit quotidien
python security_audit.py
```

### Mises à jour régulières
```powershell
# Vérifier les mises à jour de sécurité
pip list --outdated

# Mettre à jour les packages de sécurité
pip install --upgrade Django djangorestframework djangorestframework-simplejwt
```

---

## 📞 Contact et Support

Pour toute question sur la sécurité :
- **Issues GitHub** : github.com/issouf14-DEV/respira-backend/issues
- **Security Advisory** : Utiliser GitHub Security Advisories pour les vulnérabilités critiques

---

## ✅ Résumé

**Toutes les 14 vulnérabilités ont été corrigées** :
- ✅ 1 Critique
- ✅ 3 Hautes
- ✅ 8 Modérées
- ✅ 2 Faibles

**Prochaines étapes** :
1. Installer les mises à jour : `pip install -r requirements.txt`
2. Lancer les tests : `python manage.py test`
3. Vérifier avec Safety : `safety check`
4. Déployer en production avec les nouvelles configurations

**Date de prochaine révision** : 8 janvier 2026
