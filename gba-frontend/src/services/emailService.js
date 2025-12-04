/**
 * Service d'emails automatiques GBA
 * Utilise le backend Render avec SendGrid pour envoyer les emails
 */

import axios from '../config/axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://le-gba-backend.onrender.com';

/**
 * Envoyer un email de bienvenue lors de l'inscription
 */
export const sendWelcomeEmail = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/send-welcome-email`, {
      email: userData.email,
      name: userData.name
    });
    console.log('✅ Email de bienvenue envoyé');
    return { success: true, data: response.data };
  } catch (error) {
    console.log('📧 Email de bienvenue - Backend gérera l\'envoi');
    return { success: false, message: error.message };
  }
};

/**
 * Notifier l'admin d'une nouvelle commande
 */
export const notifyAdminNewOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/api/orders/notify-admin`, {
      orderId: orderData.orderId,
      customerName: orderData.customerName || orderData.userName,
      customerEmail: orderData.customerEmail || orderData.userEmail,
      customerPhone: orderData.customerPhone || orderData.userPhone || 'Non renseigné',
      vehicleMake: orderData.vehicleMake || orderData.vehicleName?.split(' ')[0] || 'N/A',
      vehicleModel: orderData.vehicleModel || orderData.vehicleName?.split(' ').slice(1).join(' ') || 'N/A',
      vehicleYear: orderData.vehicleYear || new Date().getFullYear(),
      pickupDate: orderData.pickupDate || orderData.startDate,
      returnDate: orderData.returnDate || orderData.endDate,
      totalPrice: orderData.totalPrice
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Admin notifié de la nouvelle commande');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Erreur notification admin:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Envoyer une confirmation de commande au client (validée ou rejetée)
 */
export const sendOrderConfirmation = async (orderId, status) => {
  try {
    // Convertir le statut au format backend
    const backendStatus = (status === 'validee' || status === 'validated' || status === 'approved') 
      ? 'approved' 
      : 'rejected';
    
    const response = await axios.post(`${API_URL}/api/orders/${orderId}/send-notification`, {
      status: backendStatus
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Email de ${backendStatus === 'approved' ? 'confirmation' : 'rejet'} envoyé au client`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Erreur envoi confirmation:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Envoyer un rappel de paiement
 */
export const sendPaymentReminder = async (orderId) => {
  try {
    const response = await axios.post(`${API_URL}/api/orders/${orderId}/send-payment-reminder`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Rappel de paiement envoyé');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Erreur rappel paiement:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Envoyer le récapitulatif de location
 */
export const sendRentalSummary = async (orderId) => {
  try {
    const response = await axios.post(`${API_URL}/api/orders/${orderId}/send-rental-summary`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Récapitulatif de location envoyé');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Erreur récapitulatif:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Renvoyer un email de confirmation
 */
export const resendOrderEmail = async (orderId) => {
  try {
    const response = await axios.post(`${API_URL}/api/orders/${orderId}/resend-email`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Email renvoyé avec succès');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Erreur renvoi email:', error.message);
    return { success: false, message: error.message };
  }
};

export default {
  sendWelcomeEmail,
  notifyAdminNewOrder,
  sendOrderConfirmation,
  sendPaymentReminder,
  sendRentalSummary,
  resendOrderEmail
};
