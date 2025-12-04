// Service email optimisé pour SendGrid backend
import axios from '../config/axios';

/**
 * Service d'emails avec SendGrid backend configuré
 */
class EmailService {
  
  /**
   * Email de bienvenue automatique lors de l'inscription
   * (Envoyé automatiquement par la route /api/auth/register)
   * @param {Object} userData - {name, email}
   * @returns {Promise}
   */
  static async sendWelcomeEmailOnRegistration(userData) {
    try {
      // L'email de bienvenue est envoyé automatiquement par /api/auth/register
      console.log('📧 Email de bienvenue sera envoyé automatiquement lors de l\'inscription');
      return {
        success: true,
        message: 'Email de bienvenue envoyé automatiquement avec l\'inscription',
        emailSent: true
      };
    } catch (error) {
      console.error('❌ Info email bienvenue:', error.message);
      return {
        success: false,
        message: error.message,
        emailSent: false
      };
    }
  }

  /**
   * Notifier l'admin d'une nouvelle commande
   * @param {Object} orderData - Données de la commande
   * @returns {Promise}
   */
  static async notifyAdminNewOrder(orderData) {
    try {
      console.log('📧 Envoi notification admin (SendGrid):', orderData);
      
      const response = await axios.post('/api/orders/notify-admin', {
        orderId: orderData.orderId,
        customerName: orderData.customerName || orderData.userName,
        customerEmail: orderData.customerEmail || orderData.userEmail,
        customerPhone: orderData.customerPhone || orderData.userPhone || 'Non renseigné',
        vehicleMake: orderData.vehicleMake,
        vehicleModel: orderData.vehicleModel,
        vehicleYear: orderData.vehicleYear,
        pickupDate: orderData.pickupDate || orderData.startDate,
        returnDate: orderData.returnDate || orderData.endDate,
        totalPrice: orderData.totalPrice
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Notification admin envoyée avec SendGrid');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notification admin:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        emailSent: false
      };
    }
  }

  /**
   * Envoyer confirmation/rejet au client
   * @param {string} orderId - ID de la commande
   * @param {string} status - 'approved' ou 'rejected'
   * @returns {Promise}
   */
  static async sendOrderConfirmation(orderId, status) {
    try {
      console.log('📧 Envoi confirmation client (SendGrid):', { orderId, status });
      
      const response = await axios.post(`/api/orders/${orderId}/send-notification`, {
        status: status === 'approved' || status === 'validee' ? 'approved' : 'rejected'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Confirmation client envoyée avec SendGrid');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur confirmation client:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        emailSent: false
      };
    }
  }

  /**
   * Envoyer rappel de paiement
   * @param {string} orderId - ID de la commande
   * @returns {Promise}
   */
  static async sendPaymentReminder(orderId) {
    try {
      console.log('📧 Envoi rappel paiement (SendGrid):', orderId);
      
      const response = await axios.post(`/api/orders/${orderId}/send-payment-reminder`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Rappel paiement envoyé avec SendGrid');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur rappel paiement:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        emailSent: false
      };
    }
  }

  /**
   * Envoyer récapitulatif de location
   * @param {string} orderId - ID de la commande
   * @returns {Promise}
   */
  static async sendRentalSummary(orderId) {
    try {
      console.log('📧 Envoi récapitulatif location (SendGrid):', orderId);
      
      const response = await axios.post(`/api/orders/${orderId}/send-rental-summary`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Récapitulatif location envoyé avec SendGrid');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récapitulatif location:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        emailSent: false
      };
    }
  }

  /**
   * Test de connexion email backend
   * @returns {Promise}
   */
  static async testEmailConnection() {
    try {
      // Test simple avec notification admin
      const testData = {
        orderId: `TEST-${Date.now()}`,
        customerName: 'Test User SendGrid',
        customerEmail: 'test@example.com',
        customerPhone: '01 23 45 67 89',
        vehicleMake: 'Toyota',
        vehicleModel: 'Corolla',
        vehicleYear: '2023',
        pickupDate: new Date().toISOString().split('T')[0],
        returnDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
        totalPrice: '50000'
      };
      
      return await this.notifyAdminNewOrder(testData);
    } catch (error) {
      return {
        success: false,
        message: 'Test email connection failed: ' + error.message,
        emailSent: false
      };
    }
  }
}

export default EmailService;

// Exports pour compatibilité avec l'ancien code
export const sendNewOrderNotificationToAdmin = EmailService.notifyAdminNewOrder;
export const sendOrderConfirmationEmail = EmailService.sendOrderConfirmation;
export const sendWelcomeEmail = EmailService.sendWelcomeEmailOnRegistration;
export const sendPaymentReminder = EmailService.sendPaymentReminder;
export const sendRentalSummary = EmailService.sendRentalSummary;