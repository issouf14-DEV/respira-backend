# 🚀 Déploiement sur Render - Guide Rapide

Votre backend Respira est prêt à être déployé ! Suivez ces étapes simples.

---

## ⚡ Avant de Commencer

Votre **SECRET_KEY** générée :
```
7O159hOjjRZMtIchk5YWjVS8dggA_KzJwHBVJ1%qwq3rn53gazEYGVgdW@XVuekCtPs50cwtq0#
```

**⚠️ Sauvegardez-la dans un endroit sûr !** Elle est aussi dans `SECRET_KEY.txt`

---

## 📝 Étapes de Déploiement (15 minutes)

### 1️⃣ Créer un compte Render
- Allez sur https://render.com
- Inscrivez-vous gratuitement
- Connectez votre compte GitHub

### 2️⃣ Pousser votre code sur GitHub
```bash
git add .
git commit -m "Preparation pour deploiement Render"
git push origin main
```

### 3️⃣ Créer la Base de Données PostgreSQL

1. Dans Render Dashboard → **New +** → **PostgreSQL**
2. Configuration :
   - Name: `respira-db`
   - Database: `respira_production`
   - Region: **Frankfurt (EU)** ou **Oregon (US)**
   - Plan: **Free**
3. Cliquez **Create Database**
4. Une fois créée, allez dans **Info** → Copiez l'**Internal Database URL**

### 4️⃣ Créer le Web Service

1. Dans Render Dashboard → **New +** → **Web Service**
2. Connectez votre repository GitHub : `LE_GBA-FRONTEND`
3. Configuration :
   - **Name**: `respira-backend`
   - **Region**: Même que la DB (Frankfurt ou Oregon)
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     chmod +x build.sh && ./build.sh
     ```
   - **Start Command**:
     ```bash
     gunicorn respira_project.wsgi:application --bind 0.0.0.0:$PORT
     ```
   - **Plan**: Free

### 5️⃣ Configurer les Variables d'Environnement

Dans la section **Environment Variables**, ajoutez (une par une) :

**Variables obligatoires :**
```bash
SECRET_KEY=7O159hOjjRZMtIchk5YWjVS8dggA_KzJwHBVJ1%qwq3rn53gazEYGVgdW@XVuekCtPs50cwtq0#
DJANGO_SETTINGS_MODULE=respira_project.settings.production
DATABASE_URL=(collez l'URL de votre PostgreSQL)
PYTHON_VERSION=3.11.0
RENDER=True
```

**Variables optionnelles (recommandées) :**
```bash
IQAIR_API_KEY=votre_cle_iqair
OPENWEATHERMAP_API_KEY=votre_cle_openweathermap
```

### 6️⃣ Déployer !

1. Cliquez **Create Web Service**
2. Attendez 5-10 minutes (suivez les logs)
3. Quand vous voyez **"Live"** en vert → **C'EST BON ! 🎉**

---

## ✅ Vérifier le Déploiement

Votre API sera disponible à :
```
https://respira-backend.onrender.com/api/v1/
```

**Testez avec ces URLs :**
- API principale: https://respira-backend.onrender.com/api/v1/
- Documentation Swagger: https://respira-backend.onrender.com/swagger/
- Admin Django: https://respira-backend.onrender.com/admin/

---

## 🔧 Créer un Super Utilisateur

1. Dans Render → Votre service → **Shell**
2. Exécutez :
   ```bash
   python manage.py createsuperuser --settings=respira_project.settings.production
   ```
3. Entrez vos informations (email, nom, mot de passe)

---

## 🐛 Problèmes Courants

### ❌ "Build failed"
→ Vérifiez les logs, souvent un problème de dépendance
→ Assurez-vous que `requirements_render.txt` est correct

### ❌ "Database connection failed"
→ Vérifiez que `DATABASE_URL` est correcte
→ Assurez-vous que la DB est "Available"

### ⏰ API très lente
→ Normal sur le plan Free (mise en veille après 15 min)
→ Premier appel = 30 secondes de réveil

---

## 📱 Configurer votre App Flutter

Dans votre projet Flutter, utilisez :

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://respira-backend.onrender.com';
  static const String apiVersion = '/api/v1';
}
```

---

## 📚 Ressources

- **Guide complet** : `RENDER_DEPLOYMENT.md`
- **Documentation API** : `tutos/API_DOCUMENTATION.md`
- **Dépannage** : `tutos/TROUBLESHOOTING.md`
- **Render Docs** : https://render.com/docs

---

## 🎉 Félicitations !

Votre backend est déployé ! Prochaines étapes :

1. ✅ Testez tous les endpoints
2. ✅ Connectez votre app Flutter
3. ✅ Créez vos premiers utilisateurs de test
4. ✅ Profitez ! 🫁💙

---

**Support** : Si vous avez des questions, consultez `RENDER_DEPLOYMENT.md` pour plus de détails.

Bon développement ! 🚀
