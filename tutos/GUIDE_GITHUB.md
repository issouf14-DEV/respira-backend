# 🚀 Guide : Mettre votre projet Respira sur GitHub

Guide complet pour publier votre backend Django sur GitHub en toute sécurité.

---

## 📋 Avant de commencer

### ✅ Vérifications importantes

**1. Git est installé ?**
```powershell
git --version
# Devrait afficher: git version 2.x.x
```

**2. Compte GitHub créé ?**
- Si non : Allez sur [github.com](https://github.com) et créez un compte gratuit

**3. Fichier `.env` bien configuré ?**
- ⚠️ **IMPORTANT** : Le fichier `.env` contient vos secrets (mots de passe, clés API)
- Il est déjà dans `.gitignore` donc il ne sera PAS envoyé sur GitHub ✅

---

## 🔐 Étape 1 : Créer un fichier `.env.example`

**Pourquoi ?** Pour que d'autres développeurs sachent quelles variables configurer.

**Créer le fichier `.env.example` :**

```env
# Configuration de base de données PostgreSQL
POSTGRES_DB=respira_db
POSTGRES_USER=respira_user
POSTGRES_PASSWORD=your_secure_password_here
DB_HOST=db
DB_PORT=5432

# Configuration Django
SECRET_KEY=your-secret-key-generate-a-new-one
DEBUG=True
DJANGO_SETTINGS_MODULE=respira_project.settings.development
ALLOWED_HOSTS=localhost,127.0.0.1

# API externes (obtenir vos propres clés - voir GUIDE_API_KEYS.md)
IQAIR_API_KEY=your_iqair_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here

# CORS (autoriser les requêtes depuis Flutter)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081

# JWT Settings
ACCESS_TOKEN_LIFETIME=60
REFRESH_TOKEN_LIFETIME=10080
```

**Commande PowerShell pour créer le fichier :**
```powershell
Copy-Item .env .env.example
```

Ensuite, **éditez `.env.example`** et remplacez toutes les valeurs réelles par des placeholders :
- ❌ Ne mettez PAS vos vraies clés API
- ✅ Mettez `your_iqair_api_key_here` à la place

---

## 📝 Étape 2 : Initialiser Git dans votre projet

```powershell
# Aller dans le dossier du projet
cd c:\Users\fofan\Downloads\respira-backend-complet\respira-backend-complet

# Initialiser Git (si pas encore fait)
git init

# Vérifier le statut
git status
```

**Résultat attendu :** Liste de fichiers en rouge (non trackés).

---

## 🔍 Étape 3 : Vérifier le `.gitignore`

**Vérifier que ces lignes sont présentes dans `.gitignore` :**

```gitignore
# Fichiers sensibles
.env
*.log

# Dossiers Python
__pycache__/
*.py[cod]
venv/
*.sqlite3

# Fichiers système
.DS_Store
*.swp
```

✅ Votre `.gitignore` est déjà configuré correctement !

---

## ➕ Étape 4 : Ajouter les fichiers à Git

```powershell
# Ajouter TOUS les fichiers (sauf ceux dans .gitignore)
git add .

# Vérifier ce qui va être commité
git status
```

**Important :** Vous devriez voir des fichiers en vert. Le fichier `.env` ne doit PAS apparaître !

---

## 💾 Étape 5 : Faire le premier commit

```powershell
# Configurer votre identité Git (première fois seulement)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Créer le commit initial
git commit -m "Initial commit - Respira Backend API"
```

---

## 🌐 Étape 6 : Créer un repository sur GitHub

### **Option A : Via le site web (recommandé)**

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **"New"** ou **"+"** → **"New repository"**
3. Remplissez :
   - **Repository name** : `respira-backend`
   - **Description** : "Backend Django REST API pour application de santé respiratoire"
   - **Visibilité** : 
     - ✅ **Public** (tout le monde peut voir)
     - ✅ **Private** (seulement vous et vos collaborateurs)
4. **NE PAS** cocher "Initialize with README" (vous en avez déjà un)
5. Cliquez sur **"Create repository"**

### **Option B : Via GitHub CLI (avancé)**

```powershell
# Installer GitHub CLI : https://cli.github.com/
gh repo create respira-backend --private --source=. --remote=origin
```

---

## 🔗 Étape 7 : Connecter votre projet local à GitHub

GitHub vous donne des commandes après la création du repo. Utilisez celles-ci :

```powershell
# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/respira-backend.git

# Vérifier que le remote est ajouté
git remote -v

# Devrait afficher:
# origin  https://github.com/VOTRE_USERNAME/respira-backend.git (fetch)
# origin  https://github.com/VOTRE_USERNAME/respira-backend.git (push)
```

---

## 📤 Étape 8 : Envoyer votre code sur GitHub

```powershell
# Renommer la branche principale en "main" (si nécessaire)
git branch -M main

# Envoyer votre code sur GitHub
git push -u origin main
```

**Authentification :** GitHub vous demandera de vous connecter :
- **Nom d'utilisateur** : Votre username GitHub
- **Mot de passe** : Utilisez un **Personal Access Token** (pas votre mot de passe)

### 🔑 Créer un Personal Access Token (si demandé)

1. Allez sur GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Nom : `respira-backend-push`
4. Cochez : `repo` (accès complet aux repositories)
5. Cliquez sur **"Generate token"**
6. **COPIEZ le token immédiatement** (vous ne pourrez plus le voir)
7. Utilisez ce token comme mot de passe dans la commande `git push`

---

## ✅ Étape 9 : Vérifier sur GitHub

1. Allez sur `https://github.com/VOTRE_USERNAME/respira-backend`
2. Vous devriez voir :
   - ✅ Tous vos fichiers
   - ✅ Le README.md affiché en bas
   - ✅ Le fichier `.env.example` (PAS `.env` !)
   - ✅ Votre dernier commit

**⚠️ VÉRIFIEZ que `.env` n'est PAS sur GitHub !**

---

## 🔄 Mettre à jour le code (après modifications)

Après avoir modifié du code localement :

```powershell
# Voir ce qui a changé
git status

# Ajouter les fichiers modifiés
git add .

# Ou ajouter un fichier spécifique
git add apps/users/views.py

# Créer un commit avec un message descriptif
git commit -m "Ajout de l'endpoint de statistiques"

# Envoyer sur GitHub
git push
```

---

## 📚 Commandes Git essentielles

| Commande | Description |
|----------|-------------|
| `git status` | Voir l'état des fichiers (modifiés, ajoutés) |
| `git add .` | Ajouter tous les fichiers modifiés |
| `git add fichier.py` | Ajouter un fichier spécifique |
| `git commit -m "message"` | Créer un commit avec un message |
| `git push` | Envoyer les commits sur GitHub |
| `git pull` | Récupérer les changements depuis GitHub |
| `git log` | Voir l'historique des commits |
| `git diff` | Voir les modifications non commitées |
| `git branch` | Lister les branches |
| `git checkout -b nouvelle-branche` | Créer une nouvelle branche |

---

## 🌿 Workflow Git recommandé (branches)

Pour travailler proprement avec plusieurs fonctionnalités :

```powershell
# Créer une branche pour une nouvelle fonctionnalité
git checkout -b feature/ajout-notifications

# Travailler sur la fonctionnalité...
# Modifier des fichiers...

# Commiter les changements
git add .
git commit -m "Ajout du système de notifications"

# Envoyer la branche sur GitHub
git push -u origin feature/ajout-notifications

# Sur GitHub, créer une Pull Request
# Puis fusionner dans main après revue

# Revenir à la branche principale
git checkout main

# Mettre à jour avec les derniers changements
git pull
```

---

## 🔐 Sécurité : Ce qui NE DOIT JAMAIS être sur GitHub

❌ **NE JAMAIS commit ces fichiers :**
- `.env` (clés API, mots de passe)
- `*.sqlite3` (base de données avec données réelles)
- `venv/` (environnement virtuel Python)
- `__pycache__/` (fichiers compilés Python)
- `*.log` (logs avec potentiellement des infos sensibles)

✅ **Ces fichiers sont protégés par `.gitignore`**

---

## 🆘 Problèmes courants

### **Erreur : "fatal: not a git repository"**
```powershell
# Solution : Initialiser Git
git init
```

### **Erreur : "remote origin already exists"**
```powershell
# Solution : Supprimer l'ancien remote et ajouter le nouveau
git remote remove origin
git remote add origin https://github.com/USERNAME/respira-backend.git
```

### **Erreur : "Permission denied (publickey)"**
```powershell
# Solution : Utiliser HTTPS au lieu de SSH
git remote set-url origin https://github.com/USERNAME/respira-backend.git
```

### **J'ai accidentellement commit `.env` !**
```powershell
# Solution : Supprimer du repo (mais garder localement)
git rm --cached .env
git commit -m "Supprimer .env du repository"
git push

# Puis vérifier que .env est dans .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Ajouter .env au gitignore"
git push
```

---

## 📖 Mettre à jour le README pour GitHub

Éditez `README.md` et ajoutez en haut :

```markdown
# 🫁 Respira Backend - API REST

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)

Backend Django REST API pour application de santé respiratoire connectée.

## 🚀 Installation rapide

\`\`\`bash
# Cloner le repository
git clone https://github.com/VOTRE_USERNAME/respira-backend.git
cd respira-backend

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos clés API (voir GUIDE_API_KEYS.md)

# Lancer avec Docker
docker compose up -d
\`\`\`

**API disponible sur :** http://localhost:8000/api/v1/

**Documentation complète :** Voir [README.md](README.md)
```

---

## ✅ Checklist finale

Avant de publier sur GitHub :

- [ ] ✅ `.gitignore` contient `.env`, `venv/`, `__pycache__/`
- [ ] ✅ `.env.example` créé avec des placeholders
- [ ] ✅ README.md à jour avec instructions d'installation
- [ ] ✅ Fichier `.env` réel **NON commité**
- [ ] ✅ `git status` ne montre pas de fichiers sensibles
- [ ] ✅ Premier commit créé
- [ ] ✅ Repository GitHub créé
- [ ] ✅ Code pushé sur GitHub
- [ ] ✅ Vérifié sur GitHub que `.env` n'apparaît pas

---

## 🎉 Félicitations !

Votre projet est maintenant sur GitHub ! 🚀

**Prochaines étapes :**
- Inviter des collaborateurs (Settings → Collaborators)
- Activer GitHub Actions pour CI/CD
- Déployer sur Railway/Render (voir README.md)
- Créer une LICENSE (MIT recommandée)

**Liens utiles :**
- Votre repo : `https://github.com/VOTRE_USERNAME/respira-backend`
- Documentation Git : https://git-scm.com/doc
- GitHub Docs : https://docs.github.com

---

**Made with ❤️ for Respira Project**
