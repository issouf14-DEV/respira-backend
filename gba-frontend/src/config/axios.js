import axios from 'axios';

// Configuration de base
// En dev, utiliser le proxy Vite (/api), en prod utiliser l'URL complète
const isDev = import.meta.env.DEV;
const API_URL = isDev ? '' : (import.meta.env.VITE_API_URL || 'https://le-gba-backend.onrender.com');

axios.defaults.baseURL = API_URL + '/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 60000; // 60 secondes - SendGrid est plus rapide que SMTP

// Intercepteur pour ajouter le token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Erreur réseau
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.error('Erreur de connexion au serveur:', error.message);
      return Promise.reject({
        message: 'Impossible de se connecter au serveur. Veuillez réessayer.'
      });
    }
    
    // Erreur 401 - Non autorisé
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Erreur 403 - Accès refusé
    if (error.response?.status === 403) {
      console.error('Accès refusé');
    }
    
    return Promise.reject(error);
  }
);

export default axios;