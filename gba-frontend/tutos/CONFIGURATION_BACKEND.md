# 🔧 Configuration Backend - Guide Complet

Ce guide vous aide à configurer le backend pour activer l'envoi réel d'emails et l'upload d'images.

---

## 📧 Configuration des Emails

### Option 1 : Gmail avec Nodemailer (Recommandé pour dev/test)

#### 1. Installation
```bash
npm install nodemailer
```

#### 2. Configuration Gmail
1. Aller sur https://myaccount.google.com/
2. Sécurité > Validation en deux étapes (l'activer si pas fait)
3. Mots de passe des applications > Créer un mot de passe
4. Copier le mot de passe généré

#### 3. Créer le service d'email
```javascript
// backend/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email pour admin (nouvelle commande)
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
          .label { font-weight: bold; color: #dc2626; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Nouvelle Commande</h1>
          </div>
          <div class="content">
            <h2>Une nouvelle réservation a été effectuée !</h2>
            
            <div class="info-box">
              <h3>Informations Client</h3>
              <p><span class="label">Nom :</span> ${orderData.userName}</p>
              <p><span class="label">Email :</span> ${orderData.userEmail}</p>
              <p><span class="label">Téléphone :</span> ${orderData.userPhone || 'Non renseigné'}</p>
            </div>
            
            <div class="info-box">
              <h3>Détails de la Réservation</h3>
              <p><span class="label">Véhicule :</span> ${orderData.vehicleName}</p>
              <p><span class="label">Date de début :</span> ${new Date(orderData.startDate).toLocaleDateString('fr-FR')}</p>
              <p><span class="label">Date de fin :</span> ${new Date(orderData.endDate).toLocaleDateString('fr-FR')}</p>
              <p><span class="label">Montant total :</span> ${orderData.totalPrice.toLocaleString('fr-FR')} FCFA</p>
            </div>
            
            <div class="info-box">
              <p><span class="label">Numéro de commande :</span> ${orderData.orderId}</p>
              <p><span class="label">Date de création :</span> ${new Date().toLocaleString('fr-FR')}</p>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/admin/orders" class="button">
                Voir la commande dans le panel admin
              </a>
            </center>
          </div>
          <div class="footer">
            <p>GBA - Grand Bassam Automobile</p>
            <p>Cette notification a été générée automatiquement</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email admin envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email admin:', error);
    throw error;
  }
};

// Email pour client (confirmation)
exports.sendOrderConfirmation = async (orderData, status) => {
  let subject, statusText, statusColor, message;
  
  if (status === 'validated' || status === 'confirmed' || status === 'validee') {
    subject = '✅ Votre réservation est confirmée !';
    statusText = 'VALIDÉE';
    statusColor = '#10b981';
    message = 'Bonne nouvelle ! Votre réservation a été validée par notre équipe.';
  } else if (status === 'rejected' || status === 'cancelled' || status === 'rejetee') {
    subject = '❌ Mise à jour de votre réservation';
    statusText = 'ANNULÉE';
    statusColor = '#ef4444';
    message = 'Nous sommes désolés, votre réservation n\'a pas pu être confirmée.';
  } else {
    subject = '⏳ Mise à jour de votre réservation';
    statusText = 'EN ATTENTE';
    statusColor = '#f59e0b';
    message = 'Votre réservation est en cours de traitement.';
  }

  const mailOptions = {
    from: `"GBA - Grand Bassam Automobile" <${process.env.EMAIL_USER}>`,
    to: orderData.userEmail,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; background: ${statusColor}; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .label { font-weight: bold; color: #dc2626; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${subject}</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${orderData.userName},</h2>
            <p>${message}</p>
            
            <center>
              <div class="status-badge">STATUT : ${statusText}</div>
            </center>
            
            <div class="info-box">
              <h3>Récapitulatif de votre réservation</h3>
              <p><span class="label">Numéro de commande :</span> ${orderData.orderId}</p>
              <p><span class="label">Véhicule :</span> ${orderData.vehicleName}</p>
              <p><span class="label">Date de début :</span> ${new Date(orderData.startDate).toLocaleDateString('fr-FR')}</p>
              <p><span class="label">Date de fin :</span> ${new Date(orderData.endDate).toLocaleDateString('fr-FR')}</p>
              <p><span class="label">Montant total :</span> ${orderData.totalPrice.toLocaleString('fr-FR')} FCFA</p>
            </div>
            
            ${status === 'validated' || status === 'confirmed' || status === 'validee' ? `
              <div class="info-box">
                <h3>Prochaines étapes</h3>
                <p>✅ Conservez ce numéro de commande</p>
                <p>✅ Préparez vos documents (permis de conduire, pièce d'identité)</p>
                <p>✅ Rendez-vous à notre agence à la date prévue</p>
              </div>
            ` : ''}
            
            <div class="info-box">
              <h3>Besoin d'aide ?</h3>
              <p>📞 Téléphone : +225 XX XX XX XX XX</p>
              <p>📧 Email : contact@gba-ci.com</p>
              <p>📍 Adresse : Grand-Bassam, Côte d'Ivoire</p>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/profile" class="button">
                Voir mes réservations
              </a>
            </center>
          </div>
          <div class="footer">
            <p>GBA - Grand Bassam Automobile</p>
            <p>Merci de votre confiance !</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email client envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email client:', error);
    throw error;
  }
};

module.exports = exports;
```

#### 4. Variables d'environnement
```env
# .env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-app-16-caracteres
ADMIN_EMAIL=admin@gba-ci.com
FRONTEND_URL=http://localhost:5173
```

#### 5. Routes API
```javascript
// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Notifier l'admin d'une nouvelle commande
router.post('/notify-admin', async (req, res) => {
  try {
    const result = await emailService.sendNewOrderEmail(req.body);
    res.json({ 
      success: true, 
      message: 'Email envoyé à l\'admin',
      emailSent: true,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Erreur notification admin:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Envoyer notification de statut au client
router.post('/:id/send-notification', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Récupérer les détails de la commande
    const order = await Order.findById(id).populate('user vehicle');
    
    const orderData = {
      orderId: order._id,
      userName: order.user.name,
      userEmail: order.user.email,
      vehicleName: `${order.vehicle.brand} ${order.vehicle.model}`,
      startDate: order.startDate,
      endDate: order.endDate,
      totalPrice: order.totalPrice
    };
    
    const result = await emailService.sendOrderConfirmation(orderData, status);
    res.json({ 
      success: true, 
      message: 'Email envoyé au client',
      emailSent: true,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Erreur notification client:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
```

---

### Option 2 : SendGrid (Recommandé pour production)

#### 1. Installation
```bash
npm install @sendgrid/mail
```

#### 2. Configuration
1. Créer un compte sur https://sendgrid.com
2. Créer une API Key
3. Vérifier votre domaine d'envoi

#### 3. Service d'email
```javascript
// backend/services/emailService.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendNewOrderEmail = async (orderData) => {
  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.SENDGRID_FROM_EMAIL, // Doit être vérifié dans SendGrid
    subject: '🛒 Nouvelle commande reçue !',
    html: `<!-- même template que Nodemailer -->`
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email admin envoyé via SendGrid');
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur SendGrid:', error);
    throw error;
  }
};
```

#### 4. Variables d'environnement
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@votre-domaine.com
ADMIN_EMAIL=admin@gba-ci.com
FRONTEND_URL=https://gba-ci.com
```

---

## 📸 Configuration Upload d'Images

### Option 1 : Cloudinary (Recommandé)

#### 1. Installation
```bash
npm install cloudinary multer multer-storage-cloudinary
```

#### 2. Configuration Cloudinary
```javascript
// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

#### 3. Middleware d'upload
```javascript
// backend/middleware/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gba-vehicles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;
```

#### 4. Route d'upload
```javascript
// backend/routes/vehicles.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// Upload image de véhicule
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    res.json({
      success: true,
      imageUrl: req.file.path, // URL Cloudinary
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une image
router.delete('/delete-image/:publicId', async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ success: true, message: 'Image supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### 5. Variables d'environnement
```env
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

#### 6. Modifier le frontend
```javascript
// src/pages/Admin/ManageVehicles.jsx
const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/vehicles/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      }
    );
    
    return response.data.imageUrl;
  } catch (error) {
    console.error('Erreur upload:', error);
    throw new Error('Échec de l\'upload de l\'image');
  }
};
```

---

### Option 2 : AWS S3

#### 1. Installation
```bash
npm install aws-sdk multer multer-s3
```

#### 2. Configuration
```javascript
// backend/config/aws.js
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

module.exports = s3;
```

#### 3. Middleware
```javascript
// backend/middleware/upload.js
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/aws');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `vehicles/${Date.now()}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
```

#### 4. Variables d'environnement
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=eu-west-1
AWS_S3_BUCKET=gba-vehicles
```

---

## 🔒 Sécurité

### 1. Validation des fichiers
```javascript
const fileFilter = (req, file, cb) => {
  // Vérifier le type MIME
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};
```

### 2. Rate limiting
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads max
  message: 'Trop de requêtes, réessayez plus tard'
});

router.post('/upload-image', uploadLimiter, upload.single('image'), ...);
```

### 3. Authentification
```javascript
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.post('/upload-image', 
  authMiddleware, 
  adminMiddleware, 
  upload.single('image'), 
  ...
);
```

---

## 🧪 Tests

### Test emails (Nodemailer)
```javascript
// backend/test/email.test.js
const emailService = require('../services/emailService');

describe('Email Service', () => {
  it('devrait envoyer un email admin', async () => {
    const orderData = {
      orderId: 'TEST-123',
      userName: 'Jean Test',
      userEmail: 'test@example.com',
      vehicleName: 'Toyota Corolla',
      startDate: new Date(),
      endDate: new Date(),
      totalPrice: 25000
    };
    
    const result = await emailService.sendNewOrderEmail(orderData);
    expect(result.success).toBe(true);
  });
});
```

### Test upload (avec Supertest)
```bash
npm install --save-dev supertest
```

```javascript
const request = require('supertest');
const app = require('../app');

describe('Upload Image', () => {
  it('devrait uploader une image', async () => {
    const response = await request(app)
      .post('/api/vehicles/upload-image')
      .attach('image', 'test/fixtures/test-image.jpg')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.imageUrl).toBeDefined();
  });
});
```

---

## 📝 Checklist de Configuration

### Emails
- [ ] Service choisi (Nodemailer/SendGrid)
- [ ] Package installé
- [ ] Variables d'environnement configurées
- [ ] Service d'email créé
- [ ] Routes API créées
- [ ] Tests effectués
- [ ] Frontend connecté

### Upload d'images
- [ ] Service choisi (Cloudinary/S3)
- [ ] Package installé
- [ ] Variables d'environnement configurées
- [ ] Middleware d'upload créé
- [ ] Routes API créées
- [ ] Validation de fichiers
- [ ] Rate limiting
- [ ] Tests effectués
- [ ] Frontend connecté

### Sécurité
- [ ] Authentification requise
- [ ] Validation des permissions (admin)
- [ ] Validation des fichiers
- [ ] Limite de taille
- [ ] Rate limiting
- [ ] Gestion des erreurs

---

## 🆘 Dépannage

### Emails ne s'envoient pas
1. Vérifier les credentials dans .env
2. Vérifier que le compte email autorise les apps tierces
3. Vérifier les logs backend
4. Tester avec un service comme Mailtrap pour le dev

### Upload échoue
1. Vérifier les credentials CDN/S3
2. Vérifier la taille du fichier
3. Vérifier le type MIME
4. Vérifier les permissions bucket

---

## 📚 Ressources

- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Multer Documentation](https://github.com/expressjs/multer)

---

**Prêt à configurer ? Suivez les étapes ci-dessus et votre backend sera opérationnel ! 🚀**
