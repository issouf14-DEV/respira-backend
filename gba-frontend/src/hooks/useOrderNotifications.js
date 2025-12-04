import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { sendOrderConfirmation, notifyAdminNewOrder } from '../services/emailService';

// Hook pour écouter les événements et créer des notifications
export const useOrderNotifications = (userRole = 'client') => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Notification pour nouvelle commande (Admin seulement)
    const handleNewOrder = async (event) => {
      if (userRole === 'admin') {
        const order = event.detail.order;
        
        // Créer une notification
        addNotification({
          type: 'order',
          title: '🛒 Nouvelle commande reçue !',
          message: `${order.userName || 'Un client'} a passé une commande pour ${order.vehicleName || 'un véhicule'}`,
          orderId: order._id || order.id
        });

        // Envoyer un email à l'admin
        try {
          await notifyAdminNewOrder({
            orderId: order._id || order.id,
            userName: order.userName,
            vehicleName: order.vehicleName,
            startDate: order.startDate,
            endDate: order.endDate,
            totalPrice: order.totalPrice,
            userEmail: order.userEmail
          });
          console.log('📧 Email envoyé à l\'admin');
        } catch (error) {
          console.error('Erreur envoi email admin:', error);
        }
      }
    };

    // Notification pour changement de statut (Client seulement)
    const handleOrderStatusUpdated = async (event) => {
      if (userRole === 'client') {
        const { orderId, status, order } = event.detail;
        
        let notifType, title, message;
        
        switch (status) {
          case 'validee':
          case 'validated':
          case 'confirmed':
            notifType = 'order_validated';
            title = '✅ Commande validée !';
            message = `Votre réservation pour ${order?.vehicleName || 'le véhicule'} a été confirmée`;
            break;
          case 'rejetee':
          case 'rejected':
          case 'cancelled':
            notifType = 'order_rejected';
            title = '❌ Commande rejetée';
            message = `Votre réservation pour ${order?.vehicleName || 'le véhicule'} a été annulée`;
            break;
          default:
            notifType = 'order_pending';
            title = '⏳ Commande en attente';
            message = `Votre commande est en cours de traitement`;
        }
        
        // Créer une notification
        addNotification({
          type: notifType,
          title,
          message,
          orderId
        });

        // Envoyer un email au client
        if (orderId) {
          try {
            await sendOrderConfirmation(orderId, status);
            console.log('📧 Email de confirmation envoyé au client');
          } catch (error) {
            console.error('Erreur envoi email client:', error);
          }
        }
      }
    };

    // Écouter les événements
    window.addEventListener('newOrder', handleNewOrder);
    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdated);

    // Cleanup
    return () => {
      window.removeEventListener('newOrder', handleNewOrder);
      window.removeEventListener('orderStatusUpdated', handleOrderStatusUpdated);
    };
  }, [userRole, addNotification]);
};

export default useOrderNotifications;
