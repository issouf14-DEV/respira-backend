import API from './auth';
import { mockAPI } from '../utils/mockData';

// Vérifier si on doit utiliser les données simulées
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false;

export const vehiclesAPI = {
  // Récupérer tous les véhicules avec filtres
  getAll: async (params = {}) => {
    try {
      const response = await API.get('/vehicles', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur getAll vehicles:', error);
      console.warn('⚠️ Utilisation des données simulées');
      const mockResponse = await mockAPI.vehicles.getAll();
      return mockResponse.data;
    }
  },

  // Récupérer un véhicule par ID
  getById: async (id) => {
    try {
      const response = await API.get(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getById vehicle:', error);
      throw error;
    }
  },

  // Récupérer les véhicules en vedette
  getFeatured: async () => {
    try {
      const response = await API.get('/vehicles/featured');
      return response.data;
    } catch (error) {
      console.error('Erreur getFeatured:', error);
      throw error;
    }
  },

  // Récupérer par catégorie/type
  getByType: async (type) => {
    try {
      const response = await API.get(`/vehicles?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getByType:', error);
      throw error;
    }
  },

  // Créer un véhicule (admin)
  create: async (vehicleData) => {
    try {
      const response = await API.post('/admin/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      const mockResponse = await mockAPI.vehicles.create(vehicleData);
      return mockResponse.data;
    }
  },

  // Alias pour createVehicle
  createVehicle: async (vehicleData) => {
    try {
      const response = await API.post('/admin/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      const mockResponse = await mockAPI.vehicles.create(vehicleData);
      return mockResponse.data;
    }
  },

  // Mettre à jour un véhicule (admin)
  update: async (id, vehicleData) => {
    try {
      const response = await API.put(`/admin/vehicles/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      const mockResponse = await mockAPI.vehicles.update(id, vehicleData);
      return mockResponse.data;
    }
  },

  // Alias pour updateVehicle
  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await API.put(`/admin/vehicles/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      const mockResponse = await mockAPI.vehicles.update(id, vehicleData);
      return mockResponse.data;
    }
  },

  // Supprimer un véhicule (admin)
  delete: async (id) => {
    try {
      const response = await API.delete(`/admin/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      const mockResponse = await mockAPI.vehicles.delete(id);
      return mockResponse.data;
    }
  },

  // Alias pour deleteVehicle
  deleteVehicle: async (id) => {
    try {
      const response = await API.delete(`/admin/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      const mockResponse = await mockAPI.vehicles.delete(id);
      return mockResponse.data;
    }
  },

  // Rechercher des véhicules
  search: async (query) => {
    const response = await API.get('/vehicles/search', { params: { q: query } });
    return response.data;
  }
};