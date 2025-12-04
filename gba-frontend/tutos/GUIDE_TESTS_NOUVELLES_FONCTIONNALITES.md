# 🧪 Guide de Test - Nouvelles Fonctionnalités

## Prérequis
- ✅ Application démarrée : `npm run dev`
- ✅ Navigateur ouvert sur : http://localhost:5173
- ✅ Console développeur ouverte (F12) pour voir les logs d'emails

---

## 📸 Test 1 : Upload d'Images

### Étapes
1. **Se connecter en tant qu'admin**
   - Aller sur `/login`
   - Identifiants admin par défaut

2. **Accéder à la gestion des véhicules**
   - Cliquer sur "Admin Panel" dans le menu
   - Cliquer sur "Véhicules" dans la sidebar

3. **Ajouter un véhicule avec upload d'image**
   - Cliquer sur le bouton rouge "+ Ajouter un véhicule"
   - Remplir les champs obligatoires :
     - Marque : "Toyota"
     - Modèle : "Corolla"
     - Prix : 25000
     - Année : 2024
   
4. **Uploader une image**
   - Cliquer sur la zone "📁 Depuis mon PC"
   - Sélectionner une image depuis votre ordinateur (JPG/PNG, max 5MB)
   - ✅ **Vérifier** : L'image apparaît en prévisualisation
   - ✅ **Vérifier** : Une barre de progression s'affiche
   
5. **Alternative : URL d'image**
   - OU entrer une URL dans le champ "Ou via URL"
   - Exemple : `https://www.toyota.com/imgix/content/dam/toyota/vehicles/2024/corolla/landing/1_1_Desktop_Corolla_Hybrid_3.png`

6. **Sauvegarder**
   - Cliquer sur "➕ Ajouter le véhicule"
   - ✅ **Vérifier** : Message de succès
   - ✅ **Vérifier** : Le véhicule apparaît dans la liste avec l'image

### ✅ Résultats Attendus
- L'image est uploadée et prévisualisée
- Le véhicule est créé avec l'image
- L'image s'affiche dans la liste des véhicules

---

## 🔔 Test 2 : Notifications Admin (Nouvelle Commande)

### Étapes
1. **Ouvrir 2 fenêtres/onglets**
   - Fenêtre 1 : Admin connecté sur http://localhost:5173/admin/orders
   - Fenêtre 2 : Client connecté (ou nouvel utilisateur)

2. **Dans la Fenêtre 2 (Client)**
   - Aller sur la page véhicules : `/vehicles`
   - Choisir un véhicule
   - Cliquer sur "Réserver maintenant"
   - Remplir le formulaire de réservation
   - Soumettre la commande

3. **Dans la Fenêtre 1 (Admin)**
   - ✅ **Vérifier** : Une notification apparaît dans la cloche 🔔 en haut à droite
   - ✅ **Vérifier** : Badge rouge avec le nombre de notifications non lues
   - Cliquer sur la cloche
   - ✅ **Vérifier** : Notification "🛒 Nouvelle commande reçue !"
   - ✅ **Vérifier** : Détails du client et du véhicule

4. **Dans la Console (F12)**
   - ✅ **Vérifier** : Log `📧 Simulation envoi email:` pour l'admin
   - ✅ **Vérifier** : Contenu de l'email avec tous les détails

### ✅ Résultats Attendus
- Notification instantanée pour l'admin
- Badge avec compteur
- Email loggé dans la console avec toutes les infos

---

## 📧 Test 3 : Notifications Client (Validation/Rejet)

### Étapes
1. **En tant qu'Admin**
   - Aller sur `/admin/orders`
   - Trouver la commande en attente
   - Cliquer sur "👁️ Détails"

2. **Valider la commande**
   - Cliquer sur le bouton vert "✅ Valider"
   - Confirmer l'action

3. **En tant que Client (autre fenêtre)**
   - ✅ **Vérifier** : Notification 🔔 apparaît
   - Cliquer sur la cloche
   - ✅ **Vérifier** : "✅ Commande validée !"
   - ✅ **Vérifier** : Message personnalisé avec le véhicule

4. **Dans la Console**
   - ✅ **Vérifier** : Log `📧 Simulation envoi email:` pour le client
   - ✅ **Vérifier** : Contenu avec statut "VALIDÉE"

5. **Test du Rejet (Optionnel)**
   - Répéter avec une autre commande
   - Cliquer sur "❌ Rejeter"
   - ✅ **Vérifier** : Notification rouge "❌ Commande rejetée"

### ✅ Résultats Attendus
- Notification instantanée pour le client
- Email de confirmation loggé
- Statut correctement affiché

---

## 🔄 Test 4 : Workflow Complet

### Scénario Complet
1. **Client passe une commande**
   - ✅ Admin reçoit notification + email
   
2. **Admin consulte et valide**
   - ✅ Client reçoit notification + email de validation
   
3. **Vérifications multiples**
   - Marquer notification comme lue
   - Supprimer une notification
   - "Tout marquer comme lu"

### ✅ Résultats Attendus
- Toutes les notifications fonctionnent
- Emails loggés à chaque étape
- Interface fluide et responsive

---

## 🎯 Test 5 : Fonctionnalités Avancées

### Test Persistance des Notifications
1. Recevoir quelques notifications
2. Fermer le navigateur
3. Rouvrir l'application
4. ✅ **Vérifier** : Les notifications sont toujours là

### Test Notifications Browser
1. Autoriser les notifications quand le navigateur demande
2. Minimiser la fenêtre
3. Créer une nouvelle commande depuis un autre appareil/onglet
4. ✅ **Vérifier** : Notification système apparaît (popup OS)

### Test Upload Multiples Images
1. Ajouter un véhicule avec une image
2. Modifier le véhicule
3. Remplacer l'image par une nouvelle
4. ✅ **Vérifier** : Ancienne image remplacée

---

## 📊 Checklist Finale

### Upload d'Images
- [ ] Upload depuis PC fonctionne
- [ ] Upload via URL fonctionne
- [ ] Prévisualisation s'affiche
- [ ] Barre de progression visible
- [ ] Limite de taille respectée (5MB)
- [ ] Formats acceptés (JPG, PNG, GIF)
- [ ] Suppression d'image fonctionne

### Notifications Admin
- [ ] Notification apparaît pour nouvelle commande
- [ ] Badge compteur fonctionne
- [ ] Cloche cliquable et dropdown s'ouvre
- [ ] Marquer comme lu fonctionne
- [ ] Supprimer fonctionne
- [ ] Tout marquer comme lu fonctionne
- [ ] Email admin loggé dans console

### Notifications Client
- [ ] Notification pour commande validée
- [ ] Notification pour commande rejetée
- [ ] Couleurs correctes (vert/rouge)
- [ ] Messages personnalisés
- [ ] Email client loggé dans console

### Emails
- [ ] Email admin avec détails complets
- [ ] Email client validation avec infos
- [ ] Email client rejet avec infos
- [ ] Tous les champs présents
- [ ] Format lisible

### Général
- [ ] Pas d'erreurs dans la console
- [ ] Interface responsive
- [ ] Animations fluides
- [ ] Persistance localStorage
- [ ] Performance correcte

---

## 🐛 Problèmes Courants

### "L'image ne s'upload pas"
- Vérifiez la taille (< 5MB)
- Vérifiez le format (JPG, PNG, GIF)
- Consultez la console pour les erreurs

### "Pas de notifications"
- Vérifiez que vous êtes connecté
- Actualisez la page
- Vérifiez la console pour les événements

### "Emails non envoyés"
- Normal ! Ils sont en mode simulation
- Vérifiez les logs dans la console (F12)
- Pour l'envoi réel, configurez le backend

### "Notifications disparaissent"
- Vérifiez localStorage (Dev Tools > Application > Local Storage)
- Ne pas naviguer en mode privé

---

## 📝 Rapport de Test

Après vos tests, notez :
- ✅ Fonctionnalités qui marchent
- ❌ Problèmes rencontrés
- 💡 Suggestions d'amélioration
- 📸 Captures d'écran si bugs

---

## 🚀 Prochaines Étapes

Une fois les tests validés :
1. Configurer le backend pour l'envoi réel d'emails (voir NOUVELLES_FONCTIONNALITES.md)
2. Déployer en production
3. Tester sur différents navigateurs
4. Tester sur mobile
5. Recueillir les retours utilisateurs

---

**Bon test ! 🎉**
