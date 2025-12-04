# 🔑 Guide de Connexion Admin - GBA Frontend

## Problème Résolu ✅

Les erreurs de syntaxe JavaScript ont été corrigées dans les fichiers suivants :
- `AuthContext.jsx` - Amélioration de la gestion d'état et cleanup des effets
- `Login.jsx` - Meilleure gestion des erreurs et validation
- `useAuth.js` - Protection contre les contextes null

## 🚪 Connexion Admin

### Étapes pour se connecter en admin :

1. **Allez à la page de connexion** : `http://localhost:5173/login`

2. **Utilisez les credentials admin** :
   - **Email** : `admin@gba.com`
   - **Mot de passe** : `admin123`

3. **Ou testez directement** : `http://localhost:5173/admin-test`

### ⚠️ Vérifications importantes :

#### 1. Backend démarré
Assurez-vous que votre backend est démarré et accessible. L'API devrait être sur :
- URL locale : `http://localhost:5000`
- URL de production : `https://le-gba-backend.onrender.com`

#### 2. Variables d'environnement
Vérifiez votre fichier `.env` à la racine du projet :
```bash
VITE_API_URL=http://localhost:5000
# ou
VITE_API_URL=https://le-gba-backend.onrender.com
```

#### 3. Compte admin existant
Le compte admin doit exister dans votre base de données avec :
- Email: `admin@gba.com`
- Mot de passe: `admin123` (ou votre mot de passe admin)
- Role: `admin`

## 🛠️ Debug et Tests

### Page de test admin
Une page de test spéciale a été créée : `http://localhost:5173/admin-test`

Cette page vous permet de :
- ✅ Voir l'état actuel de l'authentification
- ✅ Tester la connexion admin
- ✅ Diagnostiquer les problèmes de connexion
- ✅ Voir les messages d'erreur détaillés

### Console développeur
Ouvrez la console du navigateur (F12) pour voir :
- Les logs de connexion
- Les erreurs de réseau
- Les réponses de l'API

## 📋 Actions post-connexion

Une fois connecté en admin, vous pouvez :
1. **Accéder au dashboard admin** : `/admin/dashboard`
2. **Gérer les véhicules** : `/admin/vehicles`
3. **Gérer les commandes** : `/admin/orders`
4. **Gérer les utilisateurs** : `/admin/users`

## 🚨 Résolution de problèmes

### Erreur "Email ou mot de passe incorrect"
- Vérifiez les credentials dans la base de données
- Assurez-vous que le mot de passe est correctement hashé
- Testez avec l'API directement via Postman/Insomnia

### Erreur réseau
- Vérifiez que le backend est démarré
- Vérifiez la variable VITE_API_URL
- Testez l'API avec `curl` ou Postman

### Redirection incorrecte
- Vérifiez les rôles dans la base de données
- Vérifiez la logique de redirection dans `AuthContext.jsx`

## 🔄 Redémarrage complet

Si les problèmes persistent :

```bash
# Arrêter le serveur
Ctrl+C

# Nettoyer le cache
npm run dev
```

Les corrections apportées devraient résoudre les erreurs JavaScript visibles dans la console de votre navigateur.