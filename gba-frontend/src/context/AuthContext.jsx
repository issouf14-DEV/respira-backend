import { createContext, useState, useEffect } from 'react';
import API from '../api/auth';
import { authAPI } from '../api/auth';
import { logger } from '../utils/logger';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser && isMounted) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setToken(savedToken);
            // Dispatcher un événement pour notifier les autres composants
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: userData }));
            logger.success('Authentification restaurée depuis le localStorage');
          } catch (parseError) {
            logger.error('Erreur parsing user data:', parseError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        logger.error('Erreur initialisation auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();
    
    // Écouter les changements de localStorage depuis d'autres onglets
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        initAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-changed', initAuth);
    
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', initAuth);
    };
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Aucun token disponible, skip fetchUser');
        return;
      }
      
      setLoading(true);
      
      // La route /api/auth/profile n'existe pas sur le backend
      // On utilise directement les données du localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log('✅ Utilisateur chargé depuis localStorage');
        } catch (parseError) {
          console.error('Erreur parsing user data:', parseError);
          logout();
        }
      } else {
        // Si pas de données en localStorage mais un token existe,
        // peut-être qu'on doit décoder le token JWT
        console.warn('Token présent mais pas de données utilisateur en localStorage');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return {
          success: false,
          message: 'Email et mot de passe requis'
        };
      }
      
      const response = await authAPI.login({ email, password });
      console.log('Réponse login:', response.data);
      
      // Le backend renvoie les données à plat : {id, name, email, role, token}
      const data = response.data;
      
      if (!data || typeof data !== 'object') {
        throw new Error('Réponse invalide du serveur');
      }
      
      const token = data.token;
      
      // Récupérer les données de profil sauvegardées pour cet email (persistées même après déconnexion)
      const savedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
      const savedProfile = savedProfiles[data.email] || {};
      
      const user = {
        id: data.id || data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone || savedProfile.phone || '',
        address: data.address || savedProfile.address || '',
        profileImage: data.profileImage || savedProfile.profileImage || null,
        firstName: data.firstName || savedProfile.firstName || '',
        lastName: data.lastName || savedProfile.lastName || ''
      };
      
      if (!token || !user.email) {
        throw new Error('Token ou utilisateur manquant dans la réponse');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Sauvegarder aussi dans les profils persistants
      savedProfiles[data.email] = {
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        firstName: user.firstName,
        lastName: user.lastName
      };
      localStorage.setItem('userProfiles', JSON.stringify(savedProfiles));
      setToken(token);
      setUser(user);
      
      // Déclencher les événements pour mettre à jour le panier et autres composants
      try {
        window.dispatchEvent(new Event('user-changed'));
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
        // Forcer une mise à jour des contextes
        setTimeout(() => {
          window.dispatchEvent(new Event('storage'));
        }, 100);
      } catch (eventError) {
        console.warn('Erreur dispatch event:', eventError);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur login:', error);
      
      let errorMessage = 'Erreur de connexion';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const data = response.data;
      
      // Extraire prénom et nom du champ 'name' si nécessaire
      const nameParts = (userData.name || data.name || '').split(' ');
      const firstName = userData.firstName || nameParts[0] || '';
      const lastName = userData.lastName || nameParts.slice(1).join(' ') || '';
      
      // Le backend renvoie les données à plat : {id, name, email, role, token}
      const token = data.token;
      const user = {
        id: data.id || data._id,
        name: data.name || userData.name,
        email: data.email,
        role: data.role,
        phone: userData.phone || '',
        address: userData.address || '',
        profileImage: userData.profileImage || null,
        firstName: firstName,
        lastName: lastName
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Sauvegarder aussi dans les profils persistants
      if (user.email) {
        const savedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
        savedProfiles[user.email] = {
          phone: user.phone,
          address: user.address,
          profileImage: user.profileImage,
          firstName: user.firstName,
          lastName: user.lastName
        };
        localStorage.setItem('userProfiles', JSON.stringify(savedProfiles));
      }
      
      setToken(token);
      setUser(user);
      
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur d\'inscription' 
      };
    }
  };

  const logout = () => {
    try {
      authAPI.logout();
      setToken(null);
      setUser(null);
      
      // Déclencher les événements pour vider le panier et notifier les composants
      try {
        window.dispatchEvent(new Event('user-changed'));
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
        // Forcer une mise à jour des contextes
        setTimeout(() => {
          window.dispatchEvent(new Event('storage'));
        }, 100);
      } catch (eventError) {
        console.warn('Erreur dispatch event logout:', eventError);
      }
    } catch (error) {
      console.error('Erreur logout:', error);
      // Force cleanup même en cas d'erreur
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updatedUser) => {
    const mergedUser = { ...user, ...updatedUser };
    setUser(mergedUser);
    localStorage.setItem('user', JSON.stringify(mergedUser));
    
    // Sauvegarder aussi dans les profils persistants (pour après déconnexion)
    if (mergedUser.email) {
      const savedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
      savedProfiles[mergedUser.email] = {
        phone: mergedUser.phone || '',
        address: mergedUser.address || '',
        profileImage: mergedUser.profileImage || null,
        firstName: mergedUser.firstName || '',
        lastName: mergedUser.lastName || ''
      };
      localStorage.setItem('userProfiles', JSON.stringify(savedProfiles));
    }
    
    // Notifier les autres composants
    try {
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: mergedUser }));
    } catch (e) {
      console.warn('Erreur dispatch event updateUser:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateUser,
      fetchUser,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};