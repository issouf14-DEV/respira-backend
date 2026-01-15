# 🚀 Guide de Déploiement sur Render

## 📋 Prérequis

- ✅ Compte Render (gratuit) : https://render.com
- ✅ Compte GitHub avec votre projet poussé
- ✅ Votre projet est prêt à déployer

---

## 🗄️ Étape 1 : Créer la Base de Données PostgreSQL

1. **Connectez-vous à Render** : https://dashboard.render.com

2. **Créez une nouvelle base de données PostgreSQL** :
   - Cliquez sur **"New +"** → **"PostgreSQL"**
   
3. **Configuration de la base de données** :
   ```
   Name: respira-db
   Database: respira_production
   User: respira_user
   Region: Frankfurt (EU Central) ou Oregon (US West)
   PostgreSQL Version: 16
   Plan: Free
   ```

4. **Créer la base** : Cliquez sur **"Create Database"**

5. **Récupérer l'URL de connexion** :
   - Une fois créée, allez dans l'onglet **"Info"**
   - Copiez l'**Internal Database URL** (commence par `postgresql://`)
   - ⚠️ **GARDEZ cette URL secrète !**

---

## 🌐 Étape 2 : Déployer le Web Service

1. **Créer un nouveau Web Service** :
   - Cliquez sur **"New +"** → **"Web Service"**

2. **Connecter votre repository GitHub** :
   - Si premier déploiement : "Connect GitHub Account"
   - Sélectionnez votre repository : `LE_GBA-FRONTEND`
   - Cliquez sur **"Connect"**

3. **Configuration du service** :

   **Name:**
   ```
   respira-backend
   ```

   **Region:**
   ```
   Frankfurt (EU Central) - ou la même que votre DB
   ```

   **Branch:**
   ```
   main
   ```

   **Root Directory:**
   ```
   (laisser vide)
   ```

   **Runtime:**
   ```
   Python 3
   ```

   **Build Command:**
   ```bash
   chmod +x build.sh && ./build.sh
   ```

   **Start Command:**
   ```bash
   gunicorn respira_project.wsgi:application --bind 0.0.0.0:$PORT
   ```

   **Plan:**
   ```
   Free (ou Starter si vous voulez plus de performance)
   ```

---

## 🔐 Étape 3 : Configurer les Variables d'Environnement

Dans la section **"Environment Variables"**, ajoutez :

### Variables Obligatoires :

```bash
# Django
SECRET_KEY=votre-secret-key-django-tres-securise-changez-moi
DJANGO_SETTINGS_MODULE=respira_project.settings.production

# Base de données (coller l'URL de l'étape 1)
DATABASE_URL=postgresql://respira_user:password@host/respira_production

# Python
PYTHON_VERSION=3.11.0

# Render
RENDER=True
```

### Variables pour les API externes :

```bash
# IQAir API (qualité de l'air)
IQAIR_API_KEY=votre_cle_iqair

# OpenWeatherMap API (météo)
OPENWEATHERMAP_API_KEY=votre_cle_openweathermap
```

### Variables optionnelles (sécurité) :

```bash
# CORS (domaines autorisés)
ALLOWED_HOSTS=.onrender.com,respira-backend.onrender.com

# Si vous avez un domaine custom
CORS_ALLOWED_ORIGINS=https://votre-frontend.com,https://votre-domaine.com
```

---

## 🚀 Étape 4 : Déployer

1. **Cliquez sur "Create Web Service"**

2. **Attendez le déploiement** (5-10 minutes) :
   - Render va :
     - Installer les dépendances Python
     - Collecter les fichiers statiques
     - Exécuter les migrations de base de données
     - Démarrer le serveur

3. **Suivez les logs en temps réel** dans l'onglet "Logs"

---

## ✅ Étape 5 : Vérifier le Déploiement

Une fois déployé, vous verrez **"Live"** en vert.

### URLs de votre API :

```
🌐 API principale: https://respira-backend.onrender.com/api/v1/
📚 Documentation Swagger: https://respira-backend.onrender.com/swagger/
📖 Documentation Redoc: https://respira-backend.onrender.com/redoc/
🔐 Admin Django: https://respira-backend.onrender.com/admin/
```

### Tests de santé :

```bash
# Test API de base
curl https://respira-backend.onrender.com/api/v1/

# Test endpoint health
curl https://respira-backend.onrender.com/api/v1/health/
```

---

## 👤 Étape 6 : Créer un Super Utilisateur

1. **Accédez au Shell Render** :
   - Dans votre service, onglet **"Shell"**
   - Ou utilisez Render CLI

2. **Créez le super utilisateur** :
   ```bash
   python manage.py createsuperuser --settings=respira_project.settings.production
   ```

3. **Entrez les informations** :
   ```
   Email: admin@respira.com
   Nom: Admin
   Prénom: Respira
   Mot de passe: (choisir un mot de passe fort)
   ```

---

## 🔧 Configuration Post-Déploiement

### 1. Configurer CORS pour votre Frontend Flutter

Dans Render, ajoutez/modifiez la variable :

```bash
CORS_ALLOWED_ORIGINS=https://votre-app-flutter.com,http://localhost:3000
```

### 2. Configurer les Domaines Personnalisés (optionnel)

- Dans **Settings** → **Custom Domains**
- Ajoutez votre domaine : `api.respira.com`
- Configurez les DNS comme indiqué

### 3. Activer le SSL (automatique)

✅ Render active automatiquement le HTTPS avec Let's Encrypt

---

## 📊 Surveillance et Maintenance

### Logs en temps réel

```
Dashboard → Votre Service → Logs
```

### Redéploiement automatique

✅ Render redéploie automatiquement à chaque push sur `main`

### Redéploiement manuel

```
Dashboard → Votre Service → Manual Deploy → Deploy latest commit
```

### Performances du plan Free

- ⏰ **Mise en veille** après 15 min d'inactivité
- ⚡ **Démarrage à froid** : ~30 secondes
- 💾 **750h gratuites/mois**
- 🔄 **Redéploiement automatique**

**💡 Astuce** : Pour éviter la mise en veille, utilisez un service de ping (UptimeRobot, Cron-job.org)

---

## 🐛 Dépannage

### ❌ Erreur : "Build failed"

**Vérifiez** :
1. Le fichier `build.sh` est exécutable
2. Le fichier `requirements_render.txt` existe
3. Pas d'erreur de syntaxe Python

**Solution** :
```bash
# Dans les logs, regardez l'erreur exacte
# Puis corrigez dans votre code local et poussez sur GitHub
```

### ❌ Erreur : "Database connection failed"

**Vérifiez** :
1. La variable `DATABASE_URL` est correcte
2. La base de données est bien créée et "Available"
3. La région de la DB et du service sont compatibles

**Solution** :
```bash
# Copiez à nouveau l'Internal Database URL depuis votre PostgreSQL
# Collez-la dans DATABASE_URL (sans espaces)
```

### ❌ Erreur : "Static files not found"

**Vérifiez** :
1. `whitenoise` est dans `requirements_render.txt`
2. `collectstatic` est dans `build.sh`

**Solution** :
```bash
# Le build.sh devrait contenir :
python manage.py collectstatic --noinput --settings=respira_project.settings.production
```

### ❌ Erreur : "ALLOWED_HOSTS"

**Solution** :
Ajoutez dans les variables d'environnement :
```bash
ALLOWED_HOSTS=.onrender.com,votre-service.onrender.com
```

### ⚠️ Service très lent

**Causes** :
- Plan Free qui se réveille (30 secondes)
- Trop de requêtes simultanées

**Solutions** :
1. Passer au plan Starter ($7/mois)
2. Utiliser un service de ping
3. Optimiser les requêtes DB

---

## 🔒 Sécurité en Production

### ✅ Checklist de sécurité

- [x] `DEBUG = False` en production
- [x] `SECRET_KEY` unique et complexe
- [x] `ALLOWED_HOSTS` configuré
- [x] `DATABASE_URL` sécurisée
- [x] HTTPS activé (automatique)
- [x] CORS configuré
- [x] Variables sensibles en environnement variables
- [x] `.env` dans `.gitignore`

### 🔑 Rotation des secrets

**Tous les 3-6 mois** :
1. Générer une nouvelle `SECRET_KEY`
2. Mettre à jour dans Render
3. Redéployer

---

## 📱 Intégration avec Flutter

### Configuration dans votre app Flutter

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://respira-backend.onrender.com';
  static const String apiVersion = '/api/v1';
  
  static const String apiUrl = '$baseUrl$apiVersion';
}
```

### Headers requis

```dart
final headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer $token', // Si JWT activé
};
```

---

## 📞 Support

### Documentation officielle

- 📘 **Render Docs** : https://render.com/docs
- 📗 **Django on Render** : https://render.com/docs/deploy-django

### Ressources du projet

- 📄 `tutos/DEPLOYMENT_GUIDE.md` - Guide général
- 📄 `tutos/API_DOCUMENTATION.md` - Documentation API
- 📄 `tutos/TROUBLESHOOTING.md` - Dépannage complet

---

## 🎉 Félicitations !

Votre backend Respira est maintenant déployé sur Render !

**URLs importantes** :
- 🌐 API : `https://respira-backend.onrender.com/api/v1/`
- 📚 Swagger : `https://respira-backend.onrender.com/swagger/`
- 🔐 Admin : `https://respira-backend.onrender.com/admin/`

**Prochaines étapes** :
1. ✅ Testez tous les endpoints API
2. ✅ Configurez votre app Flutter avec l'URL de production
3. ✅ Configurez un service de monitoring (optionnel)
4. ✅ Ajoutez des tests automatisés (optionnel)

---

**Bonne chance avec votre application Respira ! 🫁💙**
