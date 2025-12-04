import API from "./auth";
import { mockAPI } from '../utils/mockData';

export const adminAPI = {
  getStats: async () => {
    try {
      return await API.get("/admin/stats");
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      return await mockAPI.stats.get();
    }
  },

  getUsers: async (page = 1, limit = 20) => {
    try {
      return await API.get("/admin/users", { params: { page, limit } });
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      return await mockAPI.users.getAll();
    }
  },

  createUser: async (userData) => {
    try {
      return await API.post("/admin/users", userData);
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      return await mockAPI.users.create(userData);
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      return await API.put(`/admin/users/${userId}`, { role });
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      return await mockAPI.users.update(userId, { role });
    }
  },

  deleteUser: async (userId) => {
    try {
      return await API.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      return await mockAPI.users.delete(userId);
    }
  },

  getVehicleStats: async () => {
    try {
      return await API.get("/admin/vehicles/stats");
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      return await mockAPI.stats.get();
    }
  },
};