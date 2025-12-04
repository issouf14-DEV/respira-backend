// Service API centralisé pour communiquer avec le backend GBA
import axios from 'axios';

// En dev, utiliser le proxy Vite (/api), en prod utiliser l'URL complète
const isDev = import.meta.env.DEV;
const API_URL = isDev ? '' : (import.meta.env.VITE_API_URL || 'https://le-gba-backend.onrender.com');

// Instance axios avec configuration de base
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== AUTHENTIFICATION ====================

export const authAPI = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Déconnexion (côté frontend)
  logout: () => {
    localStorage.removeItem('token');
  },
};

// ==================== VÉHICULES ====================

export const vehiclesAPI = {
  // Récupérer tous les véhicules
  getAll: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  // Récupérer un véhicule par ID
  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // Créer un véhicule (ADMIN)
  create: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  // Mettre à jour un véhicule (ADMIN)
  update: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  // Supprimer un véhicule (ADMIN)
  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
};

// ==================== COMMANDES ====================

export const ordersAPI = {
  // Créer une commande et obtenir le clientSecret pour Stripe
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data; // { message, orderId, clientSecret, debug }
  },

  // Récupérer mes commandes
  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  // Récupérer toutes les commandes (ADMIN)
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Mettre à jour le statut d'une commande (ADMIN)
  updateStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}`, { status });
    return response.data;
  },

  // Vérifier le statut d'une commande
  checkStatus: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/status`);
    return response.data;
  },
};

// ==================== UTILISATEURS (ADMIN) ====================

export const usersAPI = {
  // Récupérer tous les utilisateurs
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Supprimer un utilisateur
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default api;
