# Configuration des Emails Réels pour GBA

## 🎯 Objectif
Envoyer de vrais emails aux utilisateurs pour :
- ✉️ Email de bienvenue à l'inscription
- ✅ Notification de validation de commande
- ❌ Notification de rejet de commande

---

## 📋 Option 1 : Utiliser EmailJS (Frontend uniquement - RECOMMANDÉ)

### Étape 1 : Créer un compte EmailJS
1. Allez sur https://www.emailjs.com/
2. Créez un compte avec **fofanaissouf179@gmail.com**
3. Vérifiez votre email

### Étape 2 : Configurer Gmail
1. Dans EmailJS, allez dans **Email Services** → **Add New Service**
2. Sélectionnez **Gmail**
3. Connectez votre Gmail : **fofanaissouf179@gmail.com**
4. Notez le **Service ID** (ex: `service_gba123`)

### Étape 3 : Créer les templates d'email

#### Template 1 : Email de bienvenue
- **Nom** : `welcome_email`
- **Template ID** : Notez-le (ex: `template_welcome123`)
- **Objet** : `🎉 Bienvenue sur GBA - Grand Bassam Automobile !`
- **Contenu** :
```
Bonjour {{user_name}},

Nous sommes ravis de vous accueillir parmi nous !

Votre compte a été créé avec succès. Vous pouvez maintenant :

✅ Parcourir notre catalogue de véhicules
✅ Réserver vos véhicules favoris
✅ Suivre vos commandes en temps réel
✅ Gérer votre profil et vos préférences

Notre équipe est à votre disposition pour vous accompagner.

Connectez-vous : {{login_link}}

À très bientôt,
L'équipe GBA
```

#### Template 2 : Commande validée
- **Nom** : `order_validated`
- **Template ID** : Notez-le (ex: `template_validated123`)
- **Objet** : `✅ Votre réservation est validée !`
- **Contenu** :
```
Bonjour {{user_name}},

Bonne nouvelle ! Votre réservation a été validée par notre équipe.

📋 Détails de la réservation :
- Commande N° : {{order_id}}
- Véhicule : {{vehicle_name}}
- Date de début : {{start_date}}
- Date de fin : {{end_date}}
- Montant total : {{total_price}} FCFA

Vous pouvez consulter tous les détails dans votre espace client.

Merci de votre confiance !
L'équipe GBA
```

#### Template 3 : Commande rejetée
- **Nom** : `order_rejected`
- **Template ID** : Notez-le (ex: `template_rejected123`)
- **Objet** : `❌ Information sur votre réservation`
- **Contenu** :
```
Bonjour {{user_name}},

Nous sommes désolés, mais votre réservation n°{{order_id}} pour le véhicule {{vehicle_name}} n'a pas pu être validée.

Si vous avez des questions, n'hésitez pas à nous contacter :
📧 Email : fofanaissouf179@gmail.com
📱 Téléphone : 05 03 71 31 15

Cordialement,
L'équipe GBA
```

### Étape 4 : Obtenir la clé publique
1. Allez dans **Account** → **General**
2. Copiez votre **Public Key** (ex: `abcXYZ123`)

### Étape 5 : Installer EmailJS

```powershell
npm install @emailjs/browser
```

### Étape 6 : Créer le fichier de configuration

Créez le fichier `src/config/emailjs.js` :

```javascript
export const EMAILJS_CONFIG = {
  publicKey: 'VOTRE_PUBLIC_KEY',
  serviceId: 'VOTRE_SERVICE_ID',
  templates: {
    welcome: 'VOTRE_TEMPLATE_WELCOME_ID',
    orderValidated: 'VOTRE_TEMPLATE_VALIDATED_ID',
    orderRejected: 'VOTRE_TEMPLATE_REJECTED_ID'
  }
};
```

---

## 📋 Option 2 : Backend avec Nodemailer (Plus sécurisé)

Cette option nécessite un serveur backend Node.js.

### Sur le Backend (Node.js/Express)

1. Installez les dépendances :
```bash
npm install nodemailer dotenv
```

2. Créez `.env` :
```
EMAIL_USER=fofanaissouf179@gmail.com
EMAIL_PASS=votre_mot_de_passe_app_gmail
```

3. Configurez Gmail :
   - Allez dans votre compte Google
   - Activez la validation en 2 étapes
   - Générez un "Mot de passe d'application"
   - Utilisez ce mot de passe dans EMAIL_PASS

4. Créez le service email backend :
```javascript
// backend/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = { transporter };
```

---

## 🚀 Quelle option choisir ?

### Option 1 (EmailJS) - RECOMMANDÉ pour vous
✅ **Avantages :**
- Gratuit jusqu'à 200 emails/mois
- Pas besoin de backend
- Configuration rapide (15 minutes)
- Fonctionne directement depuis le frontend

❌ **Inconvénients :**
- Clés visibles côté client (mais sécurisé par domaine)
- Limite de 200 emails/mois

### Option 2 (Nodemailer)
✅ **Avantages :**
- Plus sécurisé
- Illimité
- Contrôle total

❌ **Inconvénients :**
- Nécessite un backend Node.js
- Configuration plus complexe
- Risque de blocage par Gmail

---

## 📝 Prochaines étapes

**Je recommande EmailJS (Option 1)** car :
1. Vous n'avez pas encore de backend opérationnel
2. Configuration en 15 minutes
3. Parfait pour démarrer

**Voulez-vous que je configure EmailJS maintenant ?**

Dites-moi simplement :
- "Oui, configure EmailJS"

Et je mettrai à jour le code pour utiliser EmailJS avec de vrais envois d'emails.
