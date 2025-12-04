import API from "./auth";
import { mockAPI } from '../utils/mockData';

export const ordersAPI = {
  createOrder: async (orderData) => {
    try {
      const response = await API.post("/orders", orderData);
      
      // Déclencher un événement pour notifier l'admin
      window.dispatchEvent(new CustomEvent('newOrder', {
        detail: { order: response.data }
      }));
      
      return response;
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      const response = await mockAPI.orders.create(orderData);
      
      // Déclencher un événement même en mode mock
      window.dispatchEvent(new CustomEvent('newOrder', {
        detail: { order: response.data }
      }));
      
      return response;
    }
  },

  getMyOrders: async () => {
    try {
      return await API.get("/orders/my-orders");
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      return await mockAPI.orders.getAll();
    }
  },

  getOrderById: async (id) => {
    try {
      return await API.get(`/orders/${id}`);
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      return await mockAPI.orders.getById(id);
    }
  },

  updateOrderStatus: async (id, status, orderDetails = null) => {
    try {
      const response = await API.put(`/orders/${id}`, { status });
      
      // Déclencher un événement pour notifier le client
      window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
        detail: { orderId: id, status, order: orderDetails || response.data }
      }));
      
      return response;
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      const response = await mockAPI.orders.update(id, { status });
      
      // Déclencher un événement même en mode mock
      window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
        detail: { orderId: id, status, order: orderDetails || response.data }
      }));
      
      return response;
    }
  },

  getAllOrders: async (page = 1, limit = 20) => {
    try {
      return await API.get("/orders", { params: { page, limit } });
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      return await mockAPI.orders.getAll();
    }
  },

  deleteOrder: async (id) => {
    try {
      return await API.delete(`/orders/${id}`);
    } catch (error) {
      console.warn('⚠️ Utilisation des données simulées');
      return await mockAPI.orders.delete(id);
    }
  },
};

export default ordersAPI;