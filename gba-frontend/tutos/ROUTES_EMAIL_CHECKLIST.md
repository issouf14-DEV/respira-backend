# ✅ Routes Email Backend - Checklist

## Routes Actuellement Utilisées par le Frontend

### 1. ✅ Notification Admin (Nouvelle Commande)
```
POST /api/orders/notify-admin
```
**Données envoyées:**
```json
{
  "orderId": "CMD-1733...",
  "customerName": "Jean Dupont",
  "customerEmail": "client@example.com",
  "customerPhone": "+225 07 12 34 56 78",
  "vehicleMake": "Toyota",
  "vehicleModel": "Corolla",
  "vehicleYear": "2023",
  "pickupDate": "2025-12-15",
  "returnDate": "2025-12-20",
  "totalPrice": 150000
}
```
**Status:** ❌ **ROUTE MANQUANTE** - Voir AJOUT_ROUTES_EMAIL_BACKEND.md

---

### 2. ✅ Confirmation Client (Validation/Rejet)
```
POST /api/orders/:id/send-notification
```
**Données envoyées:**
```json
{
  "status": "approved" ou "rejected"
}
```
**Status:** ❌ **ROUTE MANQUANTE** - Voir AJOUT_ROUTES_EMAIL_BACKEND.md

---

### 3. ⚠️ Email de Bienvenue (Inscription)
```
POST /api/auth/send-welcome-email
```
**Données envoyées:**
```json
{
  "email": "nouveau@client.com",
  "name": "Nouveau Client"
}
```
**Status:** ❌ **ROUTE MANQUANTE** - Voir AJOUT_ROUTES_EMAIL_BACKEND.md

---

### 4. ❌ Rappel de Paiement (DÉSACTIVÉ)
```
POST /api/orders/:id/send-payment-reminder
```
**Status:** ❌ **N'EXISTE PAS** - Boutons retirés du frontend

---

### 5. ❌ Récapitulatif de Location (DÉSACTIVÉ)
```
POST /api/orders/:id/send-rental-summary
```
**Status:** ❌ **N'EXISTE PAS** - Boutons retirés du frontend

---

## 🧪 Tests à Effectuer

### Test 1: Inscription + Email Bienvenue
1. Allez sur `/register`
2. Remplissez le formulaire d'inscription
3. Validez
4. **Console (F12):** Cherchez:
   ```
   🚀 TENTATIVE ENVOI EMAIL DE BIENVENUE - Début
   📧 Données email bienvenue: {name, email}
   ✅ RÉSULTAT ENVOI EMAIL BIENVENUE: {...}
   ```
5. **Vérifiez email** du nouvel utilisateur

**Si erreur 404:** La route `/api/auth/send-welcome-email` n'existe pas sur le backend

---

### Test 2: Nouvelle Commande + Email Admin
1. Connectez-vous comme client
2. Passez une commande
3. **Console (F12):** Cherchez:
   ```
   🚀 TENTATIVE ENVOI EMAIL ADMIN - Début
   📧 Données email à envoyer: {...}
   ✅ Email admin envoyé avec succès via backend
   ```
4. **Vérifiez email:** `fofanaissouf179@gmail.com`

---

### Test 3: Validation Commande + Email Client
1. Connectez-vous comme admin
2. Allez sur `/admin/orders`
3. Cliquez **Valider** sur une commande
4. **Vérifiez email** du client

---

## 🔧 Si Email de Bienvenue ne Fonctionne Pas

### Vérifier la route backend

Le backend doit avoir cette route :

```javascript
// backend/routes/auth.js
router.post('/send-welcome-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    await emailService.sendWelcomeEmail({
      to: email,
      name: name
    });
    
    res.json({ 
      success: true, 
      message: 'Email de bienvenue envoyé' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});
```

---

## 📊 Résumé

| Route | Statut | Utilisée Par | Email Destinataire |
|-------|--------|--------------|-------------------|
| `/api/orders/notify-admin` | ✅ Existe | Checkout | Admin (fofanaissouf179@gmail.com) |
| `/api/orders/:id/send-notification` | ✅ Existe | Admin Panel | Client |
| `/api/auth/send-welcome-email` | ⚠️ À vérifier | Register | Nouvel utilisateur |
| `/api/orders/:id/send-payment-reminder` | ❌ N'existe pas | - | - |
| `/api/orders/:id/send-rental-summary` | ❌ N'existe pas | - | - |

---

**Prochaine étape:** Testez l'inscription pour voir si l'email de bienvenue est envoyé ! 🧪
