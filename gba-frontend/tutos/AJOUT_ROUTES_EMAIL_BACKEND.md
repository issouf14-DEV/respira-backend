# 🔧 Ajout des Routes Email au Backend - Guide Complet

## ❌ Problème Identifié

Les 3 routes email n'existent pas sur votre backend Render :
- `/api/orders/notify-admin`
- `/api/orders/:id/send-notification`
- `/api/auth/send-welcome-email`

---

## 📝 Étape 1 : Service Email (emailService.js)

Créez le fichier `backend/services/emailService.js` :

```javascript
const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email à l'admin pour nouvelle commande
exports.sendNewOrderEmail = async (orderData) => {
  const mailOptions = {
    from: `"GBA Notifications" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '🛒 Nouvelle commande reçue !',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .label { font-weight: bold; color: #666; }
          .value { color: #111; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Nouvelle Réservation</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <h3>👤 Informations Client</h3>
              <p><span class="label">Nom:</span> <span class="value">${orderData.customerName}</span></p>
              <p><span class="label">Email:</span> <span class="value">${orderData.customerEmail}</span></p>
              <p><span class="label">Téléphone:</span> <span class="value">${orderData.customerPhone}</span></p>
            </div>
            
            <div class="info-box">
              <h3>🚙 Véhicule</h3>
              <p><span class="value">${orderData.vehicleMake} ${orderData.vehicleModel} ${orderData.vehicleYear}</span></p>
            </div>
            
            <div class="info-box">
              <h3>📅 Dates de Location</h3>
              <p><span class="label">Début:</span> <span class="value">${orderData.pickupDate}</span></p>
              <p><span class="label">Fin:</span> <span class="value">${orderData.returnDate}</span></p>
            </div>
            
            <div class="info-box">
              <h3>💰 Prix Total</h3>
              <p style="font-size: 24px; color: #dc2626; font-weight: bold;">${orderData.totalPrice} FCFA</p>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              ID Commande: ${orderData.orderId}
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Email au client pour confirmation
exports.sendOrderConfirmation = async (orderData, status) => {
  const isApproved = status === 'approved';
  const mailOptions = {
    from: `"GBA - Grand Bassam Automobile" <${process.env.EMAIL_USER}>`,
    to: orderData.customerEmail,
    subject: isApproved ? '✅ Votre réservation est confirmée !' : '❌ Mise à jour de votre réservation',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isApproved ? '#10b981' : '#ef4444'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .status { font-size: 18px; font-weight: bold; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; background: ${isApproved ? '#d1fae5' : '#fee2e2'}; color: ${isApproved ? '#065f46' : '#991b1b'}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '✅ Réservation Confirmée' : '❌ Réservation Non Confirmée'}</h1>
          </div>
          <div class="content">
            <p>Bonjour ${orderData.customerName},</p>
            
            <div class="status">
              Statut: ${isApproved ? 'APPROUVÉE' : 'REJETÉE'}
            </div>
            
            <p><strong>Véhicule:</strong> ${orderData.vehicleMake} ${orderData.vehicleModel} ${orderData.vehicleYear}</p>
            <p><strong>Du:</strong> ${orderData.pickupDate}</p>
            <p><strong>Au:</strong> ${orderData.returnDate}</p>
            <p><strong>Prix:</strong> ${orderData.totalPrice} FCFA</p>
            
            ${isApproved ? '<p>Nous vous contacterons prochainement pour finaliser les détails.</p>' : '<p>Pour plus d\'informations, veuillez nous contacter.</p>'}
            
            <p style="margin-top: 30px;">Cordialement,<br><strong>L\'équipe GBA</strong></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Email de bienvenue
exports.sendWelcomeEmail = async (userData) => {
  const mailOptions = {
    from: `"GBA - Grand Bassam Automobile" <${process.env.EMAIL_USER}>`,
    to: userData.email,
    subject: '🎉 Bienvenue sur GBA !',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { padding: 15px; margin: 10px 0; background: white; border-left: 4px solid #dc2626; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Bienvenue chez GBA !</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${userData.name}</strong>,</p>
            
            <p>Nous sommes ravis de vous accueillir parmi nous ! 🎉</p>
            
            <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
            
            <div class="feature">✅ Parcourir notre catalogue de véhicules</div>
            <div class="feature">✅ Réserver vos véhicules favoris</div>
            <div class="feature">✅ Suivre vos commandes en temps réel</div>
            <div class="feature">✅ Gérer votre profil et vos préférences</div>
            
            <p style="margin-top: 30px;">Notre équipe est à votre disposition pour vous accompagner.</p>
            
            <p style="text-align: center; margin-top: 40px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Se Connecter</a>
            </p>
            
            <p style="margin-top: 30px;">À très bientôt,<br><strong>L'équipe GBA</strong></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = exports;
```

---

## 📝 Étape 2 : Route Orders (routes/orders.js)

Ajoutez ces routes dans votre fichier `backend/routes/orders.js` :

```javascript
const emailService = require('../services/emailService');

// Route pour notifier l'admin d'une nouvelle commande
router.post('/notify-admin', async (req, res) => {
  try {
    const orderData = req.body;
    
    await emailService.sendNewOrderEmail(orderData);
    
    res.json({ 
      success: true, 
      message: 'Email envoyé à l\'administrateur',
      emailSent: true
    });
  } catch (error) {
    console.error('Erreur envoi email admin:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      emailSent: false
    });
  }
});

// Route pour envoyer une notification au client
router.post('/:id/send-notification', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Récupérer la commande depuis la DB
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Commande introuvable' 
      });
    }
    
    // Préparer les données pour l'email
    const orderData = {
      customerName: order.customerName || order.user?.name,
      customerEmail: order.customerEmail || order.user?.email,
      vehicleMake: order.vehicleMake || order.vehicle?.make,
      vehicleModel: order.vehicleModel || order.vehicle?.model,
      vehicleYear: order.vehicleYear || order.vehicle?.year,
      pickupDate: order.pickupDate,
      returnDate: order.returnDate,
      totalPrice: order.totalPrice
    };
    
    await emailService.sendOrderConfirmation(orderData, status);
    
    res.json({ 
      success: true, 
      message: 'Email envoyé au client',
      emailSent: true
    });
  } catch (error) {
    console.error('Erreur envoi email client:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      emailSent: false
    });
  }
});
```

---

## 📝 Étape 3 : Route Auth (routes/auth.js)

Ajoutez cette route dans votre fichier `backend/routes/auth.js` :

```javascript
const emailService = require('../services/emailService');

// Route pour envoyer l'email de bienvenue
router.post('/send-welcome-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et nom requis' 
      });
    }
    
    await emailService.sendWelcomeEmail({ email, name });
    
    res.json({ 
      success: true, 
      message: 'Email de bienvenue envoyé',
      emailSent: true
    });
  } catch (error) {
    console.error('Erreur envoi email bienvenue:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      emailSent: false
    });
  }
});
```

---

## 📝 Étape 4 : Variables d'Environnement Render

Sur votre dashboard Render, ajoutez ces variables :

```env
EMAIL_USER=fofanaissouf179@gmail.com
EMAIL_PASSWORD=<votre_mot_de_passe_application_gmail>
ADMIN_EMAIL=fofanaissouf179@gmail.com
FRONTEND_URL=http://localhost:5173
```

### Comment obtenir le mot de passe d'application Gmail :

1. Allez sur https://myaccount.google.com/
2. **Sécurité** → **Validation en deux étapes** (activez-la si pas fait)
3. **Mots de passe des applications**
4. Créez un mot de passe pour "Node.js App"
5. Copiez le mot de passe généré (16 caractères)

---

## 📝 Étape 5 : Package.json

Assurez-vous que `nodemailer` est installé :

```json
{
  "dependencies": {
    "nodemailer": "^6.9.7"
  }
}
```

Si ce n'est pas le cas :
```bash
npm install nodemailer
```

---

## 📝 Étape 6 : Déployer sur Render

1. **Commitez les changements** :
   ```bash
   git add .
   git commit -m "Ajout routes email et service emailService"
   git push origin main
   ```

2. **Render va redéployer automatiquement**

3. **Attendez 2-3 minutes** que le déploiement soit terminé

---

## 🧪 Étape 7 : Tester

Une fois déployé, retournez sur `http://localhost:5173/test-email` et testez à nouveau !

Vous devriez voir :
```
✅ Email admin envoyé avec succès !
{ "success": true, "message": "Email envoyé à l'administrateur", "emailSent": true }
```

---

## 🎯 Résumé

| Fichier à Créer/Modifier | Action |
|-------------------------|--------|
| `backend/services/emailService.js` | **CRÉER** - Service d'envoi d'emails |
| `backend/routes/orders.js` | **MODIFIER** - Ajouter 2 routes email |
| `backend/routes/auth.js` | **MODIFIER** - Ajouter 1 route email |
| `backend/package.json` | **VÉRIFIER** - Nodemailer installé |
| **Render Dashboard** | **CONFIGURER** - Variables d'environnement |

---

**Une fois ces modifications faites, les emails fonctionneront en production !** 📧✨
