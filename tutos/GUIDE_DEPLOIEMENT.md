# 🚀 Guide de Déploiement - Backend RespirIA

## 📋 Table des matières

1. [Avant le déploiement](#avant-le-deploiement)
2. [Option 1 : Railway (Recommandé)](#option-1-railway-recommande)
3. [Option 2 : Render](#option-2-render)
4. [Option 3 : DigitalOcean App Platform](#option-3-digitalocean)
5. [Option 4 : AWS EC2](#option-4-aws-ec2)
6. [Option 5 : VPS (Serveur dédié)](#option-5-vps)
7. [Configuration DNS et HTTPS](#configuration-dns-et-https)
8. [Surveillance et maintenance](#surveillance-et-maintenance)

---

## 🎯 Avant le déploiement

### Checklist pré-déploiement

- [ ] **Code testé** : API fonctionne en local
- [ ] **Variables d'environnement** : Fichier `.env` pour production
- [ ] **Secret key** : Générer une nouvelle clé secrète
- [ ] **DEBUG=False** : Désactiver le mode debug
- [ ] **ALLOWED_HOSTS** : Configurer les domaines autorisés
- [ ] **Base de données** : PostgreSQL en production
- [ ] **Fichiers statiques** : Collectés avec `collectstatic`
- [ ] **Requirements.txt** : Dépendances à jour
- [ ] **Gunicorn** : Serveur WSGI pour production

---

### Préparer le code pour la production

#### 1. Créer `requirements/production.txt`

Votre fichier existe déjà, vérifiez qu'il contient :

```txt
-r base.txt
gunicorn==21.2.0
psycopg2-binary==2.9.9
whitenoise==6.6.0
dj-database-url==2.1.0
```

#### 2. Configurer `respira_project/settings/production.py`

```python
from .base import *
import dj_database_url
import os

# SECURITE
DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# BASE DE DONNEES
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# FICHIERS STATIQUES
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS pour votre app Flutter
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')

# HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
```

#### 3. Créer `.env.production` (exemple)

```env
# Django
SECRET_KEY=votre-cle-secrete-super-longue-et-aleatoire-ici
DJANGO_SETTINGS_MODULE=respira_project.settings.production
ALLOWED_HOSTS=respira-api.com,www.respira-api.com
DEBUG=False

# Database (fourni par votre hébergeur)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# CORS
CORS_ALLOWED_ORIGINS=https://respira-app.com,https://www.respira-app.com

# APIs externes
IQAIR_API_KEY=votre_cle_iqair
WEATHERAPI_KEY=votre_cle_weather
```

#### 4. Générer une SECRET_KEY sécurisée

```powershell
docker compose exec web python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copiez le résultat dans votre `.env.production`.

---

## 🚂 Option 1 : Railway (Recommandé)

**Pourquoi Railway ?**
- ✅ Déploiement en 5 minutes
- ✅ PostgreSQL inclus gratuitement
- ✅ SSL automatique
- ✅ CI/CD automatique (Git push = déploiement)
- ✅ 5$ offerts, puis ~5$/mois

### Étapes de déploiement

#### 1. Créer un compte Railway

Allez sur https://railway.app et connectez-vous avec GitHub.

#### 2. Créer un nouveau projet

```
1. Cliquez sur "New Project"
2. Sélectionnez "Deploy from GitHub repo"
3. Choisissez votre repository respira-backend
4. Railway détecte automatiquement Django
```

#### 3. Ajouter PostgreSQL

```
1. Dans votre projet → "+ New"
2. Sélectionnez "Database" → "PostgreSQL"
3. Railway crée automatiquement DATABASE_URL
```

#### 4. Configurer les variables d'environnement

Dans Railway → Settings → Variables :

```env
SECRET_KEY=votre-cle-secrete-generee
DJANGO_SETTINGS_MODULE=respira_project.settings.production
ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
DEBUG=False
IQAIR_API_KEY=votre_cle
WEATHERAPI_KEY=votre_cle
CORS_ALLOWED_ORIGINS=https://votre-app.com
```

**Note** : `DATABASE_URL` est automatiquement créée par Railway.

#### 5. Configurer le démarrage (Procfile ou settings)

**Option A : Créer un `Procfile`** à la racine :

```procfile
web: gunicorn respira_project.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate --noinput && python manage.py collectstatic --noinput
```

**Option B : Railway Settings** :

- **Start Command** : `gunicorn respira_project.wsgi:application --bind 0.0.0.0:$PORT`

#### 6. Déployer

```powershell
git add .
git commit -m "Configure for Railway deployment"
git push origin main
```

Railway déploie automatiquement ! ✨

#### 7. Exécuter les migrations

```
Railway Dashboard → Service → Deploy Logs
```

Ou manuellement :

```powershell
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Lier au projet
railway link

# Exécuter migrations
railway run python manage.py migrate

# Créer superuser
railway run python manage.py createsuperuser
```

#### 8. Obtenir votre URL

```
Settings → Domains → Generate Domain
```

Exemple : `respira-backend-production.up.railway.app`

---

### Configuration avancée Railway

#### Personnaliser le domaine

```
Settings → Domains → Custom Domain
Ajouter : api.respira.com
```

Puis configurez votre DNS (voir section DNS).

#### Variables d'environnement par service

```yaml
# railway.json (optionnel)
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "gunicorn respira_project.wsgi:application",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🎨 Option 2 : Render

**Pourquoi Render ?**
- ✅ Gratuit pour démarrer
- ✅ PostgreSQL gratuit (90 jours, puis supprimé si inactif)
- ✅ SSL automatique
- ✅ CI/CD intégré

### Étapes de déploiement

#### 1. Créer un compte Render

https://render.com → Sign up with GitHub

#### 2. Créer un Web Service

```
1. Dashboard → "New +" → "Web Service"
2. Connectez votre repo GitHub
3. Configurez :
   - Name: respira-backend
   - Environment: Python 3
   - Build Command: pip install -r requirements/production.txt
   - Start Command: gunicorn respira_project.wsgi:application
```

#### 3. Ajouter PostgreSQL

```
1. Dashboard → "New +" → "PostgreSQL"
2. Name: respira-db
3. Copiez l'URL de connexion (Internal Database URL)
```

#### 4. Variables d'environnement

Dans Web Service → Environment :

```env
SECRET_KEY=votre-cle-secrete
DJANGO_SETTINGS_MODULE=respira_project.settings.production
DATABASE_URL=postgresql://... (copié depuis la DB)
ALLOWED_HOSTS=respira-backend.onrender.com
DEBUG=False
PYTHON_VERSION=3.11
```

#### 5. Créer `render.yaml` (optionnel, pour automatiser)

```yaml
services:
  - type: web
    name: respira-backend
    env: python
    buildCommand: pip install -r requirements/production.txt
    startCommand: gunicorn respira_project.wsgi:application
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: DJANGO_SETTINGS_MODULE
        value: respira_project.settings.production
      - key: ALLOWED_HOSTS
        value: respira-backend.onrender.com
      - key: DATABASE_URL
        fromDatabase:
          name: respira-db
          property: connectionString

databases:
  - name: respira-db
    plan: free
```

#### 6. Déployer

```powershell
git push origin main
```

Render détecte et déploie automatiquement.

#### 7. Migrations

```
Dashboard → Service → Shell

python manage.py migrate
python manage.py createsuperuser
```

---

## 🌊 Option 3 : DigitalOcean App Platform

**Prix** : ~10$/mois

### Déploiement

#### 1. Créer une app

```
1. Apps → Create App
2. Choisir GitHub
3. Sélectionner votre repo
```

#### 2. Configurer

```yaml
name: respira-backend
services:
- name: web
  environment_slug: python
  github:
    repo: votre-user/respira-backend
    branch: main
  build_command: pip install -r requirements/production.txt
  run_command: gunicorn --worker-tmp-dir /dev/shm respira_project.wsgi
  http_port: 8080
  envs:
  - key: SECRET_KEY
    value: votre-cle
  - key: DJANGO_SETTINGS_MODULE
    value: respira_project.settings.production

databases:
- name: respira-db
  engine: PG
  version: "15"
```

---

## ☁️ Option 4 : AWS EC2

**Pour les grands projets** - Configuration manuelle complète.

### Architecture

```
Internet → AWS Load Balancer (HTTPS) → EC2 Instance → RDS PostgreSQL
                                         ↓
                                      Gunicorn + Nginx
```

### Étapes

#### 1. Créer une instance EC2

```
1. AWS Console → EC2 → Launch Instance
2. Choisir : Ubuntu 22.04 LTS
3. Type : t2.micro (gratuit) ou t2.small
4. Security Group :
   - SSH (22) depuis votre IP
   - HTTP (80) depuis 0.0.0.0/0
   - HTTPS (443) depuis 0.0.0.0/0
```

#### 2. Créer RDS PostgreSQL

```
1. RDS → Create Database
2. PostgreSQL 15
3. Free tier (db.t3.micro)
4. Noter : endpoint, user, password
```

#### 3. Se connecter à EC2

```powershell
ssh -i votre-cle.pem ubuntu@votre-ip-publique
```

#### 4. Installer les dépendances

```bash
# Update système
sudo apt update && sudo apt upgrade -y

# Python et PostgreSQL client
sudo apt install python3-pip python3-venv postgresql-client nginx -y

# Cloner votre projet
cd /home/ubuntu
git clone https://github.com/votre-user/respira-backend.git
cd respira-backend

# Environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer dépendances
pip install -r requirements/production.txt
```

#### 5. Configuration `.env`

```bash
nano .env
```

```env
SECRET_KEY=votre-cle
DJANGO_SETTINGS_MODULE=respira_project.settings.production
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/respira
ALLOWED_HOSTS=votre-ip-publique,votre-domaine.com
DEBUG=False
```

#### 6. Migrations et static

```bash
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

#### 7. Configurer Gunicorn

Créer `/etc/systemd/system/gunicorn.service` :

```ini
[Unit]
Description=Gunicorn daemon for RespirIA
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/respira-backend
Environment="PATH=/home/ubuntu/respira-backend/venv/bin"
EnvironmentFile=/home/ubuntu/respira-backend/.env
ExecStart=/home/ubuntu/respira-backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/home/ubuntu/respira-backend/gunicorn.sock \
          respira_project.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

#### 8. Configurer Nginx

Créer `/etc/nginx/sites-available/respira` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /home/ubuntu/respira-backend/staticfiles/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/ubuntu/respira-backend/gunicorn.sock;
        
        # Headers pour API
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/respira /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

#### 9. SSL avec Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com
```

---

## 🖥️ Option 5 : VPS (OVH, Scaleway, Hetzner)

Similaire à AWS EC2 mais sur un serveur dédié.

### Avantages
- Plus de contrôle
- Prix fixes
- Performances prévisibles

### Inconvénients
- Maintenance manuelle
- Pas de scaling automatique

**Suivez les mêmes étapes que AWS EC2 ci-dessus.**

---

## 🌐 Configuration DNS et HTTPS

### Configurer votre domaine

#### Si vous avez un domaine (ex: respira.com)

**Chez votre registrar (Namecheap, GoDaddy, OVH, etc.)** :

```
Type    Name    Value
A       api     IP_DE_VOTRE_SERVEUR (si VPS/EC2)
CNAME   api     respira-backend.onrender.com (si Render)
```

**Pour Railway/Render** :

```
Type    Name    Value
CNAME   api     votre-app.up.railway.app
```

**Temps de propagation** : 5 minutes à 48h

### HTTPS automatique

- **Railway/Render** : Automatique ✅
- **AWS/VPS** : Utiliser Certbot (voir ci-dessus)

---

## 📊 Surveillance et maintenance

### Logs en production

#### Railway

```powershell
railway logs
```

#### Render

```
Dashboard → Service → Logs
```

#### AWS/VPS

```bash
# Logs Gunicorn
sudo journalctl -u gunicorn -f

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs Django (si configuré)
tail -f /home/ubuntu/respira-backend/logs/django.log
```

### Monitoring

#### Outils recommandés

1. **Sentry** (Erreurs) : https://sentry.io
   ```python
   # settings/production.py
   import sentry_sdk
   
   sentry_sdk.init(
       dsn=os.environ.get('SENTRY_DSN'),
       traces_sample_rate=0.1,
   )
   ```

2. **New Relic** (Performance) : https://newrelic.com

3. **Datadog** (Complet) : https://datadoghq.com

#### Healthcheck endpoint

Créer un endpoint pour vérifier que l'API fonctionne :

```python
# apps/users/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'ok',
        'version': '1.0.0'
    })

# urls.py
urlpatterns = [
    path('health/', health_check, name='health-check'),
]
```

Utilisez UptimeRobot (gratuit) pour ping `/health/` toutes les 5 minutes.

---

## 🔄 Mise à jour en production

### Workflow CI/CD simple

#### 1. Développer en local

```powershell
# Branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Coder, tester
docker compose up

# Commit
git add .
git commit -m "Add new feature"
```

#### 2. Push et merge

```powershell
git push origin feature/nouvelle-fonctionnalite

# Créer Pull Request sur GitHub
# Après review → Merge dans main
```

#### 3. Déploiement automatique

Railway/Render détectent le push sur `main` et déploient automatiquement.

#### 4. Migration si nécessaire

```powershell
# Railway
railway run python manage.py migrate

# Render
# Via Shell dans le dashboard
```

---

## 📋 Checklist post-déploiement

- [ ] **API accessible** : Tester `https://votre-api.com/api/v1/`
- [ ] **Admin accessible** : `https://votre-api.com/admin/`
- [ ] **HTTPS actif** : Cadenas vert dans le navigateur
- [ ] **CORS configuré** : Votre app Flutter peut se connecter
- [ ] **Logs fonctionnels** : Vérifier les erreurs
- [ ] **Monitoring actif** : Sentry/UptimeRobot
- [ ] **Backup DB** : Automatique avec Railway/Render
- [ ] **Documentation** : Mettre à jour `API_DOCUMENTATION.md`

---

## 🆘 Dépannage

### Erreur : "Bad Gateway" (502)

```bash
# Vérifier Gunicorn
sudo systemctl status gunicorn
sudo systemctl restart gunicorn

# Vérifier Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Erreur : "DisallowedHost"

Vérifier `ALLOWED_HOSTS` dans `.env` :

```env
ALLOWED_HOSTS=votre-domaine.com,www.votre-domaine.com
```

### Erreur : Base de données inaccessible

```bash
# Tester la connexion
psql $DATABASE_URL

# Si échec, vérifier :
# - Security Groups (AWS)
# - Firewall rules
# - DATABASE_URL correcte
```

### Static files manquants (CSS admin)

```bash
python manage.py collectstatic --noinput
```

Et vérifier `STATIC_ROOT` et `STATICFILES_STORAGE` dans `settings/production.py`.

---

## 💰 Estimation des coûts

| Plateforme | Gratuit | Payant |
|-----------|---------|--------|
| **Railway** | 5$ offerts | ~5-10$/mois |
| **Render** | Oui (limité) | ~7$/mois |
| **DigitalOcean** | - | ~10-15$/mois |
| **AWS** | 1 an gratuit | ~20-50$/mois |
| **VPS** | - | ~5-15$/mois |

**Recommandation pour débuter** : Railway (simple, SSL, CI/CD)

---

## 🎯 Résumé : Déployer en 3 étapes

### Railway (le plus simple)

1. **Connecter GitHub** → Railway détecte Django
2. **Ajouter PostgreSQL** → DATABASE_URL automatique
3. **Configurer ENV** → SECRET_KEY, ALLOWED_HOSTS
4. **Push code** → Déploiement automatique ✨

### VPS/EC2 (contrôle total)

1. **Installer** : Python, PostgreSQL, Nginx, Gunicorn
2. **Configurer** : `.env`, systemd, nginx
3. **SSL** : Certbot pour HTTPS
4. **Maintenir** : Logs, monitoring, backups

---

**Votre backend est maintenant prêt pour la production ! 🚀**

**Besoin d'aide ?** Consultez :
- `API_DOCUMENTATION.md` pour les endpoints
- `BACKEND_EXPLAINED.md` pour l'architecture
- `TROUBLESHOOTING.md` pour les erreurs courantes
