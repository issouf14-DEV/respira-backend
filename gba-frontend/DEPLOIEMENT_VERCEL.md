# 🚀 Guide de déploiement Vercel - GBA Frontend

**Date** : 4 décembre 2025  
**Repository** : https://github.com/issouf14-DEV/LE_GBA-FRONTEND.git  
**Statut** : ✅ Code poussé sur GitHub

---

## ✅ Étape 1 : Code sur GitHub (FAIT ✅)

Le code a été poussé avec succès sur :
```
https://github.com/issouf14-DEV/LE_GBA-FRONTEND.git
```

---

## 🚀 Étape 2 : Déployer sur Vercel

### Option A : Via le site Vercel (Recommandé)

#### 1. Créer un compte Vercel

1. Allez sur https://vercel.com/
2. Cliquez sur **Sign Up**
3. Connectez-vous avec votre compte GitHub

#### 2. Importer le projet

1. Cliquez sur **Add New...** → **Project**
2. Recherchez et sélectionnez : `LE_GBA-FRONTEND`
3. Cliquez sur **Import**

#### 3. Configurer le projet

**Framework Preset** : Vite  
**Build Command** : `npm run build`  
**Output Directory** : `dist`  
**Install Command** : `npm install`

#### 4. Variables d'environnement

Cliquez sur **Environment Variables** et ajoutez :

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://le-gba-backend.onrender.com` |
| `VITE_STRIPE_PUBLIC_KEY` | Votre clé publique Stripe |

#### 5. Déployer

1. Cliquez sur **Deploy**
2. Attendez 2-3 minutes
3. Votre site sera disponible sur : `https://votre-projet.vercel.app`

---

### Option B : Via Vercel CLI

```powershell
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Se connecter à Vercel
vercel login

# 3. Déployer
vercel

# 4. Suivre les instructions :
# - Set up and deploy? → Y
# - Which scope? → Votre compte
# - Link to existing project? → N
# - Project name? → gba-frontend (ou votre choix)
# - In which directory is your code located? → ./
# - Override settings? → Y
#   - Build Command: npm run build
#   - Output Directory: dist
#   - Development Command: npm run dev

# 5. Configurer les variables d'environnement
vercel env add VITE_API_URL production
# Entrez : https://le-gba-backend.onrender.com

vercel env add VITE_STRIPE_PUBLIC_KEY production
# Entrez votre clé Stripe

# 6. Déployer en production
vercel --prod
```

---

## 📋 Configuration automatique (vercel.json)

Un fichier `vercel.json` a été créé avec :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://le-gba-backend.onrender.com/api/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://le-gba-backend.onrender.com"
  }
}
```

**Ce fichier configure** :
- ✅ Build avec Vite
- ✅ Redirection des appels `/api/*` vers le backend Render
- ✅ SPA routing (toutes les routes → index.html)
- ✅ Variable d'environnement API URL

---

## 🔧 Vérification après déploiement

### 1. Tester les fonctionnalités

```powershell
# Remplacer par votre URL Vercel
$baseUrl = "https://votre-projet.vercel.app"

# Test de la page d'accueil
Invoke-WebRequest -Uri $baseUrl

# Test de l'API (devrait rediriger vers Render)
Invoke-WebRequest -Uri "$baseUrl/api/vehicles"
```

### 2. Tester l'application

1. **Page d'accueil** : `https://votre-projet.vercel.app`
2. **Inscription** : `/register` → Devrait envoyer email de bienvenue
3. **Login** : `/login` → Connexion avec un compte
4. **Véhicules** : `/vehicles` → Liste des véhicules
5. **Checkout** : Créer une commande → Email admin
6. **Admin** : `/admin` → Dashboard admin

---

## 🌐 Domaine personnalisé (optionnel)

### Ajouter un domaine

1. Dans Vercel Dashboard → **Settings** → **Domains**
2. Cliquez **Add**
3. Entrez votre domaine (ex: `gba-location.com`)
4. Suivez les instructions DNS

**Configuration DNS** :
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔄 Déploiement automatique

Vercel détecte automatiquement les pushs sur GitHub :

```powershell
# Faire des changements
git add .
git commit -m "update: nouvelle fonctionnalité"
git push

# → Vercel déploie automatiquement ! 🚀
```

### Branches

- **`main`** → Production (`https://votre-projet.vercel.app`)
- **`dev`** → Preview (`https://votre-projet-dev.vercel.app`)

---

## 📊 Monitoring Vercel

### Analytics

Dashboard Vercel → **Analytics** :
- Nombre de visiteurs
- Pages populaires
- Temps de chargement
- Erreurs 404/500

### Logs

Dashboard Vercel → **Deployments** → Cliquez sur un déploiement :
- Build logs
- Function logs (si Netlify Functions)
- Erreurs de build

---

## 🐛 Dépannage

### ❌ Build failed

**Vérifier** :
1. `package.json` contient bien `"build": "vite build"`
2. Toutes les dépendances sont dans `package.json`
3. Pas d'erreurs ESLint bloquantes

**Solution** :
```powershell
# Tester le build localement
npm run build

# Si ça marche, push
git add .
git commit -m "fix: build configuration"
git push
```

### ❌ API calls fail (CORS)

**Vérifier** :
1. Backend Render accepte les requêtes depuis Vercel
2. Variable `VITE_API_URL` est correcte
3. CORS configuré côté backend

**Backend (Express)** :
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://votre-projet.vercel.app'
  ]
}));
```

### ❌ Routes 404

**Vérifier** :
1. `vercel.json` contient le fallback vers `index.html`
2. React Router est bien configuré

---

## 🎯 Checklist de déploiement

- [x] ✅ Code sur GitHub
- [x] ✅ `vercel.json` créé
- [ ] ⏳ Compte Vercel créé
- [ ] ⏳ Projet importé sur Vercel
- [ ] ⏳ Variables d'environnement configurées
- [ ] ⏳ Premier déploiement réussi
- [ ] ⏳ Tests fonctionnels (login, register, checkout)
- [ ] ⏳ Emails testés (bienvenue, commande)
- [ ] ⏳ CORS vérifié
- [ ] ⏳ Domaine personnalisé (optionnel)

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Guide Vite + Vercel](https://vercel.com/guides/deploying-vite-with-vercel)
- [Variables d'environnement Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom domains](https://vercel.com/docs/concepts/projects/custom-domains)

---

## 🎉 Résumé

✅ **GitHub** : https://github.com/issouf14-DEV/LE_GBA-FRONTEND.git  
⏳ **Vercel** : À déployer (2 minutes)  
✅ **Backend** : https://le-gba-backend.onrender.com (déjà en prod)  
✅ **Config** : `vercel.json` créé

**Prochaine étape** : Aller sur https://vercel.com/ et importer le projet !

---

**Créé le** : 4 décembre 2025  
**Par** : Backend Team (GitHub Copilot)
