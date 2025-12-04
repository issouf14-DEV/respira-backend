# 📧 Guide d'implémentation - Fonction Netlify d'envoi d'emails

## 🎯 Vue d'ensemble

Ce guide explique comment configurer et tester la fonction Netlify **`send-email.cjs`** pour l'envoi d'emails avec support SendGrid (prioritaire) et fallback Nodemailer.

## ✅ Corrections apportées

| Problème | Avant ❌ | Maintenant ✅ |
|----------|----------|---------------|
| Bug `createTransporter` | ❌ Présent | ✅ Corrigé → `createTransport` |
| Identifiants en dur | ❌ Oui | ✅ Non - Variables d'environnement |
| Validation email | ❌ Non | ✅ Oui (regex + champs requis) |
| Support SendGrid | ❌ Non | ✅ Oui (prioritaire) |
| Fallback Nodemailer | ❌ Non | ✅ Oui (automatique) |
| CORS complet | ❌ Basique | ✅ Complet (OPTIONS + headers) |
| Gestion d'erreurs | ❌ Basique | ✅ Robuste avec logs détaillés |

---

## 📦 Installation des dépendances

### 1. Dans le dossier `netlify/functions`

```powershell
cd netlify\functions
npm install
```

Cela installera :
- `nodemailer@^6.9.7`
- `@sendgrid/mail@^7.8.0`

---

## 🔧 Configuration des variables d'environnement

### Option A : SendGrid (recommandé pour production)

#### 1. Créer un compte SendGrid
- Allez sur https://sendgrid.com/
- Créez un compte gratuit (100 emails/jour)

#### 2. Générer une clé API
- Dashboard → Settings → API Keys → Create API Key
- Permissions : Full Access (ou Mail Send uniquement)
- Copiez la clé (vous ne pourrez plus la voir après)

#### 3. Vérifier votre email expéditeur
- Dashboard → Settings → Sender Authentication
- Single Sender Verification → Verify a Single Sender
- Remplissez le formulaire et vérifiez votre email

#### 4. Configurer les variables (PowerShell)

**Pour tests locaux (Netlify CLI)** :

```powershell
# Créer un fichier .env dans netlify/functions/
Set-Content -Path "netlify\functions\.env" -Value @"
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=votre-email@example.com
TEST_EMAIL_MODE=false
"@
```

**Pour production (Dashboard Netlify)** :
1. Allez sur votre site Netlify
2. Site settings → Environment variables
3. Ajoutez :
   - `SENDGRID_API_KEY` = `SG.votre_clé`
   - `SENDGRID_FROM_EMAIL` = `votre-email@example.com`

---

### Option B : Nodemailer avec Gmail (fallback)

⚠️ **Attention** : Gmail peut bloquer l'envoi en production (ports SMTP bloqués sur Render/Netlify). Utilisez SendGrid pour la production.

#### 1. Créer un mot de passe d'application Gmail
1. Allez sur https://myaccount.google.com/security
2. Activez la vérification en 2 étapes
3. Allez dans "Mots de passe d'application"
4. Générez un mot de passe pour "Autre (nom personnalisé)" → "GBA Backend"
5. Copiez le mot de passe (16 caractères)

#### 2. Configurer les variables (PowerShell)

```powershell
Set-Content -Path "netlify\functions\.env" -Value @"
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=GBA Notifications <votre-email@gmail.com>
TEST_EMAIL_MODE=false
"@
```

---

## 🧪 Tests automatisés

### 1. Exécuter la suite de tests

```powershell
cd netlify\functions
npm test
```

**Résultat attendu** :
```
🧪 DÉBUT DES TESTS - send-email.cjs
============================================================
✅ PASS: Test 1: Requête OPTIONS (preflight CORS)
✅ PASS: Test 2: Méthode GET non autorisée
✅ PASS: Test 3: Body JSON invalide
✅ PASS: Test 4: Champs requis manquants
✅ PASS: Test 5: Format email invalide
✅ PASS: Test 6: Envoi email réussi (SendGrid mode TEST)
============================================================

📊 RÉSULTATS:
   ✅ Tests réussis: 6
   ❌ Tests échoués: 0
   📈 Total: 6

🎉 TOUS LES TESTS SONT PASSÉS!
```

---

## 🚀 Test manuel avec Netlify CLI

### 1. Installer Netlify CLI

```powershell
npm install -g netlify-cli
```

### 2. Démarrer le serveur local

```powershell
# Depuis la racine du projet
netlify dev
```

La fonction sera accessible sur : `http://localhost:8888/.netlify/functions/send-email`

### 3. Tester l'envoi avec PowerShell

**Test avec SendGrid (production-like)** :

```powershell
# Désactiver le mode test
$env:TEST_EMAIL_MODE = "false"

# Envoyer une requête
$body = @{
    to = "destinataire@example.com"
    subject = "Test GBA - Nouvelle commande"
    body = "Commande #12345`nClient: Jean Dupont`nVéhicule: Toyota Corolla 2023`nTotal: 50000 FCFA"
    type = "order_notification"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8888/.netlify/functions/send-email" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response | ConvertTo-Json -Depth 3
```

**Résultat attendu (SendGrid)** :
```json
{
  "success": true,
  "provider": "sendgrid",
  "result": { ... }
}
```

---

## 📋 Format de requête

### Endpoint
```
POST /.netlify/functions/send-email
```

### Headers
```
Content-Type: application/json
```

### Body JSON
```json
{
  "to": "client@example.com",
  "subject": "Confirmation de commande",
  "body": "Votre commande #12345 a été validée.\n\nDétails:\n- Véhicule: Toyota Corolla 2023\n- Dates: 2025-12-05 → 2025-12-10\n- Total: 50000 FCFA",
  "type": "order_confirmation"
}
```

### Réponse (succès)
```json
{
  "success": true,
  "provider": "sendgrid",
  "result": { ... }
}
```

### Réponse (erreur)
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

---

## 🔍 Dépannage

### ❌ Erreur : "SENDGRID_FROM_EMAIL not set"
**Solution** : Vérifiez que la variable `SENDGRID_FROM_EMAIL` est définie et que l'email est vérifié dans SendGrid.

### ❌ Erreur : "Unauthorized" (SendGrid)
**Solution** : Vérifiez que votre clé API SendGrid est valide et a les permissions "Mail Send".

### ❌ Erreur : "Invalid login" (Gmail/Nodemailer)
**Solution** : Utilisez un mot de passe d'application Gmail, pas votre mot de passe principal.

### ❌ Tests échouent avec "Cannot find module"
**Solution** :
```powershell
cd netlify\functions
npm install
```

### ❌ Fonction ne répond pas en local
**Solution** : Vérifiez que `netlify dev` est démarré et que vous utilisez le bon port (8888 par défaut).

---

## 🌐 Déploiement en production

### 1. Via Netlify Dashboard
1. Configurez les variables d'environnement (voir section Configuration ci-dessus)
2. Committez et pushez vos fichiers :
   ```powershell
   git add netlify/functions/
   git commit -m "feat: fonction email corrigée avec SendGrid"
   git push
   ```
3. Netlify déploiera automatiquement

### 2. Test en production

```powershell
$body = @{
    to = "votre-email@example.com"
    subject = "Test production GBA"
    body = "Test de la fonction email en production"
    type = "test"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://votre-site.netlify.app/.netlify/functions/send-email" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response | ConvertTo-Json
```

---

## 📊 Variables d'environnement - Récapitulatif

| Variable | Requis | Provider | Description |
|----------|--------|----------|-------------|
| `SENDGRID_API_KEY` | ✅ Oui (SendGrid) | SendGrid | Clé API SendGrid (commence par SG.) |
| `SENDGRID_FROM_EMAIL` | ✅ Oui (SendGrid) | SendGrid | Email expéditeur vérifié |
| `EMAIL_USER` | ✅ Oui (Nodemailer) | Gmail/SMTP | Adresse email utilisateur |
| `EMAIL_PASS` | ✅ Oui (Nodemailer) | Gmail/SMTP | Mot de passe d'application |
| `EMAIL_FROM` | ⚪ Optionnel | Gmail/SMTP | Email FROM personnalisé |
| `SMTP_HOST` | ⚪ Optionnel | SMTP | Serveur SMTP personnalisé |
| `SMTP_PORT` | ⚪ Optionnel | SMTP | Port SMTP (587, 465, etc.) |
| `SMTP_SECURE` | ⚪ Optionnel | SMTP | `true` pour SSL/TLS |
| `TEST_EMAIL_MODE` | ⚪ Optionnel | Tests | `true` pour simuler les envois |

---

## ✅ Checklist de vérification

- [ ] Dépendances installées (`npm install` dans `netlify/functions`)
- [ ] Variables d'environnement configurées
- [ ] Email expéditeur vérifié (SendGrid)
- [ ] Tests automatisés réussis (`npm test`)
- [ ] Test manuel local réussi (`netlify dev`)
- [ ] Déployé en production
- [ ] Test en production réussi

---

## 📚 Ressources

- [Documentation SendGrid](https://docs.sendgrid.com/)
- [Documentation Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Documentation Nodemailer](https://nodemailer.com/)
- [Guide Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**Implémentation terminée le 4 décembre 2025** ✅
