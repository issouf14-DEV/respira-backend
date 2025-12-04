import axios from '../config/axios';

/**
 * Envoyer un email de confirmation de réservation
 * @param {string} orderId - ID de la commande
 * @param {string} status - Nouveau statut (validee, rejetee, pending)
 * @param {Object} emailData - Données optionnelles pour les commandes locales
 * @returns {Promise} Réponse de l'API
 */
export const sendOrderConfirmationEmail = async (orderId, status, emailData = null) => {
  try {
    console.log('📧 Envoi email de confirmation au client:', {
      orderId,
      status,
      hasEmailData: !!emailData
    });
    
    // Convertir le statut en format backend
    let backendStatus = status;
    if (status === 'validee' || status === 'validated') {
      backendStatus = 'approved';
    } else if (status === 'rejetee' || status === 'rejected') {
      backendStatus = 'rejected';
    }
    
    // Utiliser l'endpoint existant avec l'ID
    const response = await axios.post(
      `/orders/${orderId}/send-notification`,
      { status: backendStatus },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Email confirmation envoyé via backend');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    console.error('Détails:', error.response?.data || error.message);
    // Ne pas bloquer l'opération si l'email échoue
    return {
      success: false,
      message: 'Email non envoyé: ' + (error.response?.data?.message || error.message),
      emailSent: false
    };
  }
};

/**
 * Renvoyer un email de confirmation
 * @param {string} orderId - ID de la commande
 * @returns {Promise} Réponse de l'API
 */
export const resendOrderEmail = async (orderId) => {
  try {
    const response = await axios.post(
      `/orders/${orderId}/resend-email`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email:', error);
    throw error;
  }
};

/**
 * Envoyer un email à l'admin pour une nouvelle commande
 * @param {Object} orderData - Données de la commande
 * @returns {Promise} Réponse de l'API
 */
export const sendNewOrderNotificationToAdmin = async (orderData) => {
  try {
    // Extraire les informations du véhicule
    const vehicleParts = orderData.vehicleName ? orderData.vehicleName.split(' ') : [];
    const vehicleMake = vehicleParts[0] || 'N/A';
    const vehicleModel = vehicleParts.slice(1, -1).join(' ') || 'N/A';
    const vehicleYear = vehicleParts[vehicleParts.length - 1] || new Date().getFullYear();
    
    console.log('📧 Envoi notification admin pour nouvelle commande:', {
      orderId: orderData.orderId,
      customerName: orderData.userName,
      vehicule: `${vehicleMake} ${vehicleModel} ${vehicleYear}`,
      totalPrice: orderData.totalPrice
    });
    
    // Appeler l'API backend avec le format exact attendu
    const response = await axios.post(
      `/orders/notify-admin`,
      {
        orderId: orderData.orderId,
        customerName: orderData.userName,
        customerEmail: orderData.userEmail,
        customerPhone: orderData.userPhone || 'Non renseigné',
        vehicleMake: vehicleMake,
        vehicleModel: vehicleModel,
        vehicleYear: vehicleYear,
        pickupDate: orderData.startDate,
        returnDate: orderData.endDate,
        totalPrice: orderData.totalPrice
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Email admin envoyé avec succès via backend');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification admin:', error);
    console.error('Détails:', error.response?.data || error.message);
    // Ne pas bloquer la commande si l'email échoue
    return {
      success: false,
      message: 'Email non envoyé: ' + (error.response?.data?.message || error.message),
      emailSent: false
    };
  }
};

/**
 * Envoyer un email de bienvenue lors de l'inscription
 * @param {Object} userData - Données de l'utilisateur (name, email)
 * @returns {Promise} Réponse de l'API
 */
export const sendWelcomeEmail = async (userData) => {
  try {
    console.log('📧 Envoi email de bienvenue:', {
      destinataire: userData.email,
      nom: userData.name
    });
    
    // Appeler l'API backend
    const response = await axios.post(
      `/auth/send-welcome-email`,
      { 
        email: userData.email,
        name: userData.name 
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Email de bienvenue envoyé via backend');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    console.error('Détails:', error.response?.data || error.message);
    // Ne pas bloquer l'inscription si l'email échoue
    return {
      success: false,
      message: 'Email non envoyé: ' + (error.response?.data?.message || error.message),
      emailSent: false
    };
  }
};

/**
 * Envoyer un rappel de paiement pour une commande
 * @param {string} orderId - ID de la commande
 * @returns {Promise} Réponse de l'API
 */
export const sendPaymentReminder = async (orderId) => {
  try {
    console.log('📧 Envoi rappel de paiement:', { orderId });
    
    const response = await axios.post(
      `/orders/${orderId}/send-payment-reminder`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Rappel de paiement envoyé via backend');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du rappel de paiement:', error);
    console.error('Détails:', error.response?.data || error.message);
    return {
      success: false,
      message: 'Rappel non envoyé: ' + (error.response?.data?.message || error.message),
      emailSent: false
    };
  }
};

/**
 * Envoyer le récapitulatif de location après restitution
 * @param {string} orderId - ID de la commande
 * @returns {Promise} Réponse de l'API
 */
export const sendRentalSummary = async (orderId) => {
  try {
    console.log('📧 Envoi récapitulatif de location:', { orderId });
    
    const response = await axios.post(
      `/orders/${orderId}/send-rental-summary`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Récapitulatif de location envoyé via backend');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du récapitulatif:', error);
    console.error('Détails:', error.response?.data || error.message);
    return {
      success: false,
      message: 'Récapitulatif non envoyé: ' + (error.response?.data?.message || error.message),
      emailSent: false
    };
  }
};
