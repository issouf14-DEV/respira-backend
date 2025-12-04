# 🧪 Guide de Test - Système d'Emails

## ✅ Configuration Actuelle

Le frontend est maintenant connecté aux routes backend existantes :

### Route 1 : Notification Admin
```
POST /api/orders/notify-admin
```
**Quand ?** À chaque nouvelle commande client

**Données envoyées :**
```json
{
  "orderId": "CMD-1733063184000",
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

**Email reçu sur :** `fofanaissouf179@gmail.com`

---

### Route 2 : Confirmation Client
```
POST /api/orders/:id/send-notification
```
**Quand ?** Quand l'admin valide ou rejette une commande

**Données envoyées :**
```json
{
  "status": "approved"  // ou "rejected"
}
```

**Email reçu par :** Le client (email de la commande)

---

## 🧪 Tests à Effectuer

### Test 1 : Nouvelle Commande → Email Admin

**Étapes :**
1. Connectez-vous en tant que **client**
2. Ajoutez un véhicule au panier
3. Allez sur `/checkout`
4. Remplissez le formulaire :
   - Nom : Jean Dupont
   - Email : votre-email@test.com
   - Téléphone : +225 07 12 34 56 78
   - Dates : Demain → Dans 5 jours
5. Validez le paiement (utilisez une carte test Stripe)

**Résultat attendu :**
- ✅ Commande créée avec succès
- ✅ Redirection vers `/client/orders`
- ✅ **Vous recevez un email** sur `fofanaissouf179@gmail.com`

**Vérifications Console (F12) :**
```
📧 Envoi notification admin pour nouvelle commande: {...}
✅ Email admin envoyé avec succès via backend
```

**Si erreur :**
```
❌ Erreur lors de l'envoi de la notification admin: Error...
```
→ Vérifier l'onglet Network : la requête `notify-admin` doit être Status 200

---

### Test 2 : Validation → Email Client

**Étapes :**
1. Connectez-vous en tant que **admin**
2. Allez sur `/admin/orders`
3. Trouvez une commande "En attente"
4. Cliquez sur **Valider** ✅

**Résultat attendu :**
- ✅ Statut change en "Validée"
- ✅ **Le client reçoit un email** de confirmation
- ✅ Toast : "Commande validée ! Email envoyé au client."

**Vérifications Console (F12) :**
```
📧 Envoi email de confirmation au client: {orderId, status: "approved"}
✅ Email confirmation envoyé via backend
```

---

### Test 3 : Rejet → Email Client

**Étapes :**
1. Sur `/admin/orders`
2. Trouvez une commande "En attente"
3. Cliquez sur **Rejeter** ❌

**Résultat attendu :**
- ✅ Statut change en "Rejetée"
- ✅ **Le client reçoit un email** de rejet
- ✅ Toast : "Commande rejetée ! Email envoyé au client."

**Vérifications Console (F12) :**
```
📧 Envoi email de confirmation au client: {orderId, status: "rejected"}
✅ Email confirmation envoyé via backend
```

---

## 🔍 Débogage

### Vérifier les requêtes réseau

1. Ouvrir DevTools (F12)
2. Onglet **Network**
3. Passer une commande
4. Chercher la requête `notify-admin`

**Cas possibles :**

| Status | Signification | Action |
|--------|---------------|--------|
| 200 OK | ✅ Email envoyé | Vérifier votre boîte mail |
| 404 Not Found | ❌ Route inexistante | Vérifier backend |
| 500 Error | ❌ Erreur serveur | Vérifier logs Render |
| Failed CORS | ❌ Problème CORS | Vérifier config backend |

### Vérifier les logs Console

**Succès :**
```javascript
✅ Email admin envoyé avec succès via backend
✅ Email confirmation envoyé via backend
```

**Erreur :**
```javascript
❌ Erreur lors de l'envoi de la notification admin: AxiosError
Détails: {message: "Request failed with status code 404"}
```

### Vérifier la boîte mail

**Gmail :** Vérifier aussi les onglets :
- 📥 Boîte de réception principale
- 🗂️ Promotions
- 📧 Spam/Courrier indésirable

---

## 📧 Format des Emails Attendus

### Email Admin (Nouvelle Commande)

**Objet :** 🛒 Nouvelle commande reçue !

**Contenu :**
```
Nouvelle Réservation

Client: Jean Dupont
Email: client@example.com
Téléphone: +225 07 12 34 56 78

Véhicule: Toyota Corolla 2023

Dates:
- Début: 15/12/2025
- Fin: 20/12/2025
- Durée: 5 jours

Prix total: 150 000 FCFA

ID Commande: CMD-1733063184000
```

### Email Client (Validation)

**Objet :** ✅ Votre réservation est confirmée !

**Contenu :**
```
Bonjour Jean Dupont,

Bonne nouvelle ! Votre réservation a été validée.

Détails de la réservation:
- Véhicule: Toyota Corolla 2023
- Du: 15/12/2025
- Au: 20/12/2025
- Prix: 150 000 FCFA

Statut: APPROUVÉE ✅

L'équipe GBA
```

### Email Client (Rejet)

**Objet :** ❌ Votre réservation n'a pas pu être confirmée

**Contenu :**
```
Bonjour Jean Dupont,

Malheureusement, nous ne pouvons pas donner suite à votre réservation.

Détails:
- Véhicule: Toyota Corolla 2023
- Du: 15/12/2025
- Au: 20/12/2025

Statut: REJETÉE ❌

Pour plus d'informations, contactez-nous.

L'équipe GBA
```

---

## ⚠️ Problèmes Fréquents

### 1. Aucun email reçu

**Causes possibles :**
- ❌ Backend Nodemailer mal configuré
- ❌ Mot de passe Gmail incorrect
- ❌ Routes backend inexistantes
- ❌ Gmail bloque l'envoi

**Solution :**
1. Vérifier logs Render
2. Tester avec Postman directement
3. Vérifier `EMAIL_PASSWORD` sur Render

### 2. Erreur 404

**Cause :** Routes backend pas encore créées

**Solution :** Les routes existent déjà ! Mais vérifier :
```javascript
// backend/routes/orders.js
router.post('/notify-admin', ...)
router.post('/:id/send-notification', ...)
```

### 3. Emails dans Spam

**Cause :** Gmail identifie comme spam

**Solution :**
- Marquer comme "Non spam"
- Ajouter expéditeur aux contacts
- Utiliser SendGrid en production

---

## 📊 Checklist Finale

Avant de considérer le système fonctionnel :

- [ ] Test 1 réussi : Email admin reçu
- [ ] Test 2 réussi : Email validation client reçu
- [ ] Test 3 réussi : Email rejet client reçu
- [ ] Aucune erreur dans la console
- [ ] Status 200 sur toutes les requêtes
- [ ] Emails arrivent en < 10 secondes

---

## 🎯 Prochaines Étapes

Une fois les tests réussis :

1. **Tester avec de vrais utilisateurs**
2. **Ajuster les templates d'emails** (backend)
3. **Ajouter logo GBA** dans les emails
4. **Migrer vers SendGrid** (production)

---

**Date** : 1er Décembre 2025  
**Status** : ✅ Frontend prêt - En attente de tests
