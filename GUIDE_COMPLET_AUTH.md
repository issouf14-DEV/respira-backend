# 🚀 **APIs COMPLÈTES POUR CRÉATION DE COMPTES**

## **TOUS LES ENDPOINTS D'AUTHENTIFICATION DÉJÀ DÉPLOYÉS !**

### 🌐 **Base URL Production** : `https://respira-backend.onrender.com`

---

## 📋 **RÉSUMÉ DES APIs DISPONIBLES**

| Endpoint | Méthode | Description | Auth Requise |
|----------|---------|-------------|-------------|
| `/api/v1/users/auth/register/` | POST | Créer un compte | ❌ Non |
| `/api/v1/users/auth/login/` | POST | Se connecter | ❌ Non |
| `/api/v1/users/auth/refresh/` | POST | Rafraîchir token | ❌ Non |
| `/api/v1/users/me/` | GET/PUT | Profil utilisateur | ✅ Oui |
| `/api/v1/users/me/profile/` | GET/PUT | Profil médical | ✅ Oui |

---

## 🔐 **1. CRÉER UN COMPTE (INSCRIPTION)**

### **Endpoint :**
```bash
POST https://respira-backend.onrender.com/api/v1/users/auth/register/
```

### **Body JSON :**
```json
{
  "email": "user@example.com",
  "username": "username123",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "profile_type": "PREVENTION",
  "first_name": "Jean",
  "last_name": "Dupont"
}
```

### **Réponse Succès (201) :**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username123",
    "first_name": "Jean",
    "last_name": "Dupont",
    "created_at": "2024-12-21T10:30:00Z"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### **Types de Profil Disponibles :**
- `ASTHMATIC` : Utilisateur asthmatique
- `PREVENTION` : Utilisateur en prévention  
- `REMISSION` : Utilisateur en rémission

---

## 🔑 **2. CONNEXION**

### **Endpoint :**
```bash
POST https://respira-backend.onrender.com/api/v1/users/auth/login/
```

### **Body JSON :**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### **Réponse Succès (200) :**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 🔄 **3. RAFRAÎCHIR TOKEN**

### **Endpoint :**
```bash
POST https://respira-backend.onrender.com/api/v1/users/auth/refresh/
```

### **Body JSON :**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### **Réponse Succès (200) :**
```json
{
  "access": "nouveau_access_token...",
  "refresh": "nouveau_refresh_token..."
}
```

**⚠️ IMPORTANT : Les tokens expirent après 1 heure !**

---

## 👤 **4. RÉCUPÉRER PROFIL UTILISATEUR**

### **Endpoint :**
```bash
GET https://respira-backend.onrender.com/api/v1/users/me/
```

### **Headers :**
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### **Réponse Succès (200) :**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username123",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+33123456789",
  "created_at": "2024-12-21T10:30:00Z",
  "profile": {
    "id": 1,
    "profile_type": "PREVENTION",
    "age": 25,
    "gender": "M",
    "height": 175.0,
    "weight": 70.5,
    "respiratory_conditions": [],
    "emergency_contact": "+33987654321"
  }
}
```

---

## 📝 **5. MODIFIER PROFIL MÉDICAL**

### **Endpoint :**
```bash
PUT https://respira-backend.onrender.com/api/v1/users/me/profile/
```

### **Headers :**
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### **Body JSON :**
```json
{
  "age": 26,
  "gender": "M",
  "height": 175.0,
  "weight": 72.0,
  "respiratory_conditions": ["asthma"],
  "emergency_contact": "+33987654321"
}
```

---

## 💻 **EXEMPLES D'UTILISATION**

### **JavaScript/Flutter :**

```javascript
// Inscription
const registerUser = async (userData) => {
  const response = await fetch(
    'https://respira-backend.onrender.com/api/v1/users/auth/register/',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        password_confirm: userData.password,
        profile_type: 'PREVENTION',
        first_name: userData.firstName,
        last_name: userData.lastName
      })
    }
  );
  
  if (response.ok) {
    const data = await response.json();
    // Sauvegarder les tokens
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    return data.user;
  } else {
    throw new Error('Inscription échouée');
  }
};

// Connexion
const loginUser = async (email, password) => {
  const response = await fetch(
    'https://respira-backend.onrender.com/api/v1/users/auth/login/',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }
  );
  
  if (response.ok) {
    const tokens = await response.json();
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    return tokens;
  } else {
    throw new Error('Connexion échouée');
  }
};

// Récupérer profil avec gestion auto du refresh
const getUserProfile = async () => {
  let token = localStorage.getItem('access_token');
  
  let response = await fetch(
    'https://respira-backend.onrender.com/api/v1/users/me/',
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  // Si token expiré, tenter refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    const refreshResponse = await fetch(
      'https://respira-backend.onrender.com/api/v1/users/auth/refresh/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      }
    );
    
    if (refreshResponse.ok) {
      const newTokens = await refreshResponse.json();
      localStorage.setItem('access_token', newTokens.access);
      token = newTokens.access;
      
      // Retry avec nouveau token
      response = await fetch(
        'https://respira-backend.onrender.com/api/v1/users/me/',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
    }
  }
  
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Erreur récupération profil');
  }
};
```

### **Python/Django :**

```python
import requests

BASE_URL = "https://respira-backend.onrender.com/api/v1"

def create_account(email, username, password, profile_type="PREVENTION"):
    """Créer un nouveau compte"""
    data = {
        "email": email,
        "username": username,
        "password": password,
        "password_confirm": password,
        "profile_type": profile_type
    }
    
    response = requests.post(f"{BASE_URL}/users/auth/register/", json=data)
    
    if response.status_code == 201:
        result = response.json()
        return {
            'user': result['user'],
            'access_token': result['tokens']['access'],
            'refresh_token': result['tokens']['refresh']
        }
    else:
        raise Exception(f"Erreur inscription: {response.text}")

def login(email, password):
    """Connexion utilisateur"""
    data = {"email": email, "password": password}
    response = requests.post(f"{BASE_URL}/users/auth/login/", json=data)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Erreur connexion: {response.text}")

def get_user_profile(access_token):
    """Récupérer profil utilisateur"""
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/users/me/", headers=headers)
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 401:
        raise Exception("Token expiré - refresh requis")
    else:
        raise Exception(f"Erreur profil: {response.text}")

# Utilisation
try:
    # Créer compte
    account = create_account(
        email="newuser@test.com",
        username="newuser123", 
        password="SecurePass123!"
    )
    print(f"Compte créé: {account['user']['email']}")
    
    # Utiliser le token pour récupérer le profil
    profile = get_user_profile(account['access_token'])
    print(f"Profil: {profile['profile']['profile_type']}")
    
except Exception as e:
    print(f"Erreur: {e}")
```

---

## 🛡️ **SÉCURITÉ & AUTORISATIONS**

### **Niveaux d'Accès :**
1. **Public** : Inscription, Connexion, Refresh token
2. **Authentifié** : Profil utilisateur, données capteurs, IA
3. **Admin** : Gestion via Django Admin (`/admin/`)

### **Gestion des Tokens :**
- **Access Token** : Expire après 1 heure
- **Refresh Token** : Valide plus longtemps
- **Auto-refresh** : Utiliser refresh token quand access expire

### **Headers Requis :**
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

---

## 🚨 **GESTION D'ERREURS**

### **Codes de Réponse :**
- **200/201** : Succès
- **400** : Données invalides
- **401** : Non autorisé / Token expiré
- **404** : Ressource non trouvée
- **500** : Erreur serveur

### **Exemples d'Erreurs :**

**Inscription - Email déjà utilisé :**
```json
{
  "email": ["Un utilisateur avec cette adresse e-mail existe déjà."]
}
```

**Connexion - Identifiants incorrects :**
```json
{
  "detail": "No active account found with the given credentials."
}
```

**Token expiré :**
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid"
}
```

---

## 🎯 **CHECKLIST POUR TON APP**

### **✅ Fonctionnalités Disponibles :**
- [x] Inscription utilisateurs avec validation
- [x] Connexion avec email/password  
- [x] Tokens JWT avec refresh automatique
- [x] Profils utilisateurs personnalisés
- [x] Profils médicaux (âge, genre, conditions)
- [x] Gestion d'erreurs complète
- [x] Compatible Flutter/mobile
- [x] APIs REST standard
- [x] Documentation complète

### **📱 Intégration Flutter :**
1. Utiliser les endpoints ci-dessus
2. Gérer les tokens dans SharedPreferences
3. Implémenter auto-refresh des tokens
4. Créer écrans inscription/connexion
5. Formulaires profil utilisateur

### **🔗 APIs Connexes Disponibles :**
- **Données capteurs** : `/api/v1/sensors/`
- **IA/Prédictions** : `/api/v1/ai/prediction-data/`
- **Environnement** : `/api/v1/environment/`

---

## 🚀 **ENDPOINTS PRÊTS À UTILISER !**

**🎯 Toutes les APIs d'authentification sont DÉPLOYÉES et FONCTIONNELLES !**

Tu peux commencer l'intégration immédiatement avec :
- `https://respira-backend.onrender.com/api/v1/users/auth/register/`
- `https://respira-backend.onrender.com/api/v1/users/auth/login/`
- `https://respira-backend.onrender.com/api/v1/users/me/`

**Documentation technique complète disponible !** 🎉