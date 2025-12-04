# 🐛 Guide de Résolution des Erreurs Email

## ❌ Erreur 1 : "timeout of 30000ms exceeded"

### Cause
Le backend Render est en **mode veille** (cold start). Render met les applications gratuites en veille après 15 minutes d'inactivité.

### Solution
1. **Attendez 30-60 secondes** que le backend se réveille
2. **Réessayez** le test
3. La 2ème tentative fonctionnera immédiatement

### Prévention
- Gardez un onglet ouvert sur https://le-gba-backend.onrender.com
- Ou utilisez un service de "ping" gratuit (UptimeRobot, etc.)

---

## ❌ Erreur 2 : "Cast to ObjectId failed"

### Message complet
```
Cast to ObjectId failed for value "CMD-TEST-176460..." (type string) at path "_id" for model "Order"
```

### Cause
Les routes qui nécessitent un `orderId` attendant un **vrai ObjectId MongoDB** (24 caractères hexadécimaux), pas un ID fictif comme `CMD-TEST-xxxxx`.

### Routes concernées
- ✅ `/api/orders/:id/send-notification` (Confirmation)
- 💳 `/api/orders/:id/send-payment-reminder` (Rappel paiement)
- 📄 `/api/orders/:id/send-rental-summary` (Récapitulatif)

### Solution
**Créez d'abord une vraie commande :**

1. Allez sur `/vehicles`
2. Réservez un véhicule
3. Finalisez la commande
4. Retournez sur `/test-email`
5. La page détectera automatiquement votre commande

Ou utilisez un vrai ID depuis l'admin :
```
674d8e5f1a2b3c4d5e6f7890  ← Format valide
CMD-TEST-1764609019685     ← Format invalide ❌
```

---

## ❌ Erreur 3 : "Request failed with status code 500"

### Cause
Erreur interne du serveur backend.

### Solutions possibles

#### 1. Variables d'environnement manquantes
Vérifiez que Render a toutes ces variables :
```env
EMAIL_USER=fofanaissouf179@gmail.com
EMAIL_PASSWORD=<mot_de_passe_application>
ADMIN_EMAIL=fofanaissouf179@gmail.com
MONGODB_URI=<votre_uri_mongodb>
```

#### 2. Nodemailer non installé
```bash
npm install nodemailer
```

#### 3. Service email mal configuré
Vérifiez `backend/services/emailService.js` :
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD  // ← Mot de passe application, pas Gmail normal !
  }
});
```

#### 4. Commande introuvable
Si l'orderId n'existe pas en base de données :
```javascript
const order = await Order.findById(orderId);
if (!order) {
  return res.status(404).json({ message: 'Commande introuvable' });
}
```

---

## ✅ Comment Tester Correctement

### Étape 1 : Réveillez le Backend
Ouvrez : https://le-gba-backend.onrender.com/api/health
Attendez 30-60 secondes jusqu'à voir une réponse.

### Étape 2 : Créez une Commande Réelle
```
1. Allez sur /vehicles
2. Choisissez un véhicule
3. Remplissez le formulaire de réservation
4. Finalisez (avec Stripe en mode test)
```

### Étape 3 : Testez dans l'Ordre
Sur `/test-email` :

1. **🛒 Nouvelle Commande** (pas besoin d'orderId)
2. **🎉 Bienvenue** (pas besoin d'orderId)
3. **✅ Confirmation** (nécessite orderId)
4. **💳 Rappel Paiement** (nécessite orderId)
5. **📄 Récapitulatif** (nécessite orderId)

### Étape 4 : Vérifiez les Emails
Inbox : **fofanaissouf179@gmail.com**

---

## 🔧 Commandes de Debug

### Vérifier qu'une commande existe
```bash
# MongoDB Atlas ou terminal
db.orders.find().limit(1)
```

### Tester les routes manuellement avec curl
```bash
# Test 1 : Notification Admin
curl -X POST https://le-gba-backend.onrender.com/api/orders/notify-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "CMD-12345",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "vehicleMake": "Toyota",
    "vehicleModel": "Corolla",
    "vehicleYear": "2023",
    "pickupDate": "2025-12-15",
    "returnDate": "2025-12-20",
    "totalPrice": 150000
  }'

# Test 2 : Bienvenue
curl -X POST https://le-gba-backend.onrender.com/api/auth/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'

# Test 3 : Confirmation (remplacer REAL_ORDER_ID)
curl -X POST https://le-gba-backend.onrender.com/api/orders/REAL_ORDER_ID/send-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "approved"}'
```

---

## 📊 Checklist de Vérification

Avant de tester les emails, vérifiez :

- [ ] Backend Render est réveillé (pas de timeout)
- [ ] Au moins 1 commande existe en base de données
- [ ] Variables d'environnement configurées sur Render
- [ ] Mot de passe application Gmail créé (pas le mot de passe normal)
- [ ] Service Nodemailer correctement configuré
- [ ] Routes email ajoutées au backend
- [ ] Token d'authentification valide (localStorage)

---

## 🎯 Résumé des Solutions Rapides

| Erreur | Solution Rapide |
|--------|----------------|
| Timeout 30000ms | Attendez 1 minute, réessayez |
| Cast to ObjectId | Créez une vraie commande d'abord |
| 500 Internal Error | Vérifiez variables Render + logs backend |
| 404 Not Found | Route manquante - vérifiez le backend |
| 401 Unauthorized | Connectez-vous en tant qu'admin |

---

**Besoin d'aide ?** Consultez les logs Render : https://dashboard.render.com → Votre App → Logs
