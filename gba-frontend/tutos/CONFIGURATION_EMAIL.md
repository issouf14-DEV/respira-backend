# Configuration de l'envoi d'emails

## 📧 Email de réception : fofanaissouf179@gmail.com
## 📱 Téléphone : 05 03 71 31 15

---

## 📨 Nouveautés : Emails de confirmation de réservation

Le système envoie maintenant automatiquement des emails au client quand :
- ✅ Sa réservation est **validée** par l'admin
- ❌ Sa réservation est **rejetée** par l'admin

Le client peut aussi **renvoyer l'email** depuis sa page "Mes Réservations" si besoin.

---

## 🚀 Configuration côté Backend (API)

### 1. Créer un compte EmailJS (GRATUIT)

1. Allez sur : https://www.emailjs.com/
2. Cliquez sur **"Sign Up"**
3. Inscrivez-vous avec : **fofanaissouf179@gmail.com**
4. Confirmez votre email

---

### 2. Créer un Service Email

1. Dans le dashboard EmailJS, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez **"Gmail"**
4. Connectez votre compte Gmail : **fofanaissouf179@gmail.com**
5. Donnez un nom au service : `service_gba`
6. Notez le **Service ID** (exemple: `service_abc123`)

---

### 3. Créer un Template d'email

1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Nommez-le : `template_contact`
4. Configurez le template comme suit :

**Subject (Objet):** 
```
Nouveau message de {{from_name}} - {{subject}}
```

**Content (Contenu):**
```
Vous avez reçu un nouveau message depuis le site LE-GBA :

Nom: {{from_name}}
Email: {{from_email}}
Téléphone: {{from_phone}}

Sujet: {{subject}}

Message:
{{message}}

---
Envoyé depuis le formulaire de contact du site LE-GBA
```

5. Dans les paramètres :
   - **To email:** `{{to_email}}`
   - **Reply to:** `{{from_email}}`
   
6. Sauvegardez et notez le **Template ID** (exemple: `template_xyz789`)

---

### 4. Obtenir votre clé publique

1. Allez dans **"Account"** → **"General"**
2. Trouvez votre **Public Key** (exemple: `abc123xyz789`)
3. Copiez cette clé

---

### 5. Installer EmailJS dans votre projet

Ouvrez un terminal PowerShell dans le dossier du projet et exécutez :

```powershell
npm install @emailjs/browser
```

---

### 6. Mettre à jour le code

Ouvrez le fichier `src/pages/Contact.jsx` et remplacez les lignes 34-36 :

```javascript
// AVANT (lignes à remplacer)
const serviceId = 'service_gba';
const templateId = 'template_contact';
const publicKey = 'YOUR_PUBLIC_KEY';

// APRÈS (avec vos vraies valeurs)
const serviceId = 'service_abc123'; // Votre Service ID
const templateId = 'template_xyz789'; // Votre Template ID
const publicKey = 'abc123xyz789'; // Votre Public Key
```

Puis décommentez la ligne 43 :
```javascript
// AVANT
// await emailjs.send(serviceId, templateId, templateParams, publicKey);

// APRÈS
await emailjs.send(serviceId, templateId, templateParams, publicKey);
```

Et ajoutez l'import en haut du fichier :
```javascript
import emailjs from '@emailjs/browser';
```

---

### 7. Tester l'envoi

1. Redémarrez votre serveur de développement
2. Allez sur la page Contact
3. Remplissez le formulaire
4. Cliquez sur "Envoyer"
5. Vérifiez votre boîte mail : **fofanaissouf179@gmail.com**

---

## ✅ Ce qui a été fait automatiquement

✅ Numéro de téléphone mis à jour : **05 03 71 31 15**
✅ Email mis à jour : **fofanaissouf179@gmail.com**
✅ Code préparé pour EmailJS
✅ Messages d'erreur personnalisés avec vos coordonnées

---

## 🔧 Alternative : Utiliser votre backend

Si vous préférez utiliser votre backend au lieu d'EmailJS :

### Endpoints nécessaires dans le backend :

#### 1. `POST /api/contact` (déjà configuré)
Pour le formulaire de contact.

#### 2. `POST /api/orders/:id/send-notification` (NOUVEAU)
Envoie un email de confirmation au client quand le statut change.

**Body:**
```json
{
  "status": "validee" // ou "rejetee"
}
```

**Exemple de template email:**
```
Bonjour {{userName}},

Votre réservation #{{orderId}} a été {{status}}.

Détails :
- Véhicule : {{vehicleBrand}} {{vehicleModel}}
- Du : {{startDate}}
- Au : {{endDate}}
- Durée : {{duration}} jours
- Prix total : {{totalPrice}} FCFA

{{#if validee}}
Félicitations ! Votre réservation est confirmée. Nous vous contacterons prochainement.
{{else}}
Malheureusement, nous ne pouvons pas valider votre réservation. Contactez-nous pour plus d'informations.
{{/if}}

Cordialement,
L'équipe LE-GBA
```

#### 3. `POST /api/orders/:id/resend-email` (NOUVEAU)
Renvoie l'email de confirmation au client.

**Implémentation avec Nodemailer:**

```javascript
// backend/routes/orders.js
import nodemailer from 'nodemailer';

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // fofanaissouf179@gmail.com
    pass: process.env.EMAIL_PASS  // Mot de passe d'application Gmail
  }
});

// Route pour envoyer la notification
router.post('/:id/send-notification', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('vehicle');
    const { status } = req.body;
    
    const statusText = status === 'validee' ? 'VALIDÉE ✅' : 'REJETÉE ❌';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.userEmail,
      subject: `Réservation ${statusText} - LE-GBA`,
      html: `
        <h2>Bonjour ${order.userName},</h2>
        <p>Votre réservation <strong>#${order._id.toString().slice(-8)}</strong> a été <strong>${statusText}</strong>.</p>
        
        <h3>Détails de la réservation :</h3>
        <ul>
          <li>Véhicule : ${order.vehicle.brand} ${order.vehicle.model}</li>
          <li>Du : ${new Date(order.startDate).toLocaleDateString('fr-FR')}</li>
          <li>Au : ${new Date(order.endDate).toLocaleDateString('fr-FR')}</li>
          <li>Durée : ${order.duration} jours</li>
          <li>Prix total : ${order.totalPrice.toLocaleString()} FCFA</li>
        </ul>
        
        ${status === 'validee' ? 
          '<p>🎉 Félicitations ! Votre réservation est confirmée. Nous vous contacterons prochainement pour finaliser les détails.</p>' :
          '<p>❌ Malheureusement, nous ne pouvons pas valider votre réservation pour le moment. Contactez-nous au 05 03 71 31 15 pour plus d\'informations.</p>'
        }
        
        <p>Cordialement,<br/>L'équipe LE-GBA</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
  }
});

// Route pour renvoyer l'email
router.post('/:id/resend-email', auth, async (req, res) => {
  // Même logique que send-notification
});
```

**Installation de Nodemailer:**
```bash
npm install nodemailer
```

**Variables d'environnement (.env):**
```
EMAIL_USER=fofanaissouf179@gmail.com
EMAIL_PASS=votre_mot_de_passe_application_gmail
```

**Comment obtenir un mot de passe d'application Gmail :**
1. Allez sur : https://myaccount.google.com/security
2. Activez la validation en 2 étapes
3. Cherchez "Mots de passe des applications"
4. Générez un nouveau mot de passe pour "Application personnalisée"
5. Copiez le mot de passe généré dans EMAIL_PASS

---

## 📞 Support

Si vous avez des questions ou des problèmes, vous pouvez me demander de l'aide !

**Quota EmailJS gratuit :** 200 emails/mois
**Temps de configuration :** ~10 minutes
**Coût :** GRATUIT 🎉
