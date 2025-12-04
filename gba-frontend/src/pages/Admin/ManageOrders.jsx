import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { sendOrderConfirmation, sendPaymentReminder, sendRentalSummary } from '../../services/emailService';
import { ordersAPI } from '../../api/orders';
import { useNotifications } from '../../context/NotificationContext';
import { FaCar, FaCalendar, FaClock, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUser, FaPhone, FaEnvelope, FaEye, FaCheck, FaTimes, FaBell, FaTrash, FaPaperPlane, FaFileInvoice } from 'react-icons/fa';
import Toast from '../../components/common/Toast';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const previousPendingCount = useRef(0);
  const { addNotification } = useNotifications();

  const [globalStats, setGlobalStats] = useState({
    total: 0,
    en_attente: 0,
    validee: 0,
    rejetee: 0,
    invalid: 0
  });

  // Fonction utilitaire pour normaliser une commande (déclarée AVANT son utilisation)
  const normalizeOrder = (order, isLocal = false) => {
    // Gérer les structures différentes (anciennes et nouvelles commandes locales)
    const reservation = order.reservation || order || {};
    const shipping = order.shipping || order || {};
    const vehicleData = (order.vehicles && order.vehicles[0]) || order.vehicle || {};
    const user = order.user || {};
    
    // Mapper les statuts
    const statusMap = {
      'pending': 'en_attente',
      'confirmed': 'validee',
      'cancelled': 'rejetee',
      'completed': 'validee',
      'en_attente': 'en_attente',
      'validee': 'validee',
      'rejetee': 'rejetee'
    };
    
    // Extraire les dates (plusieurs structures possibles)
    const startDate = order.startDate || reservation.startDate;
    const endDate = order.endDate || reservation.endDate;
    
    // Calculer la durée
    let duration = order.duration || reservation.duration || 0;
    if (startDate && endDate && duration === 0) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diffTime = Math.abs(end - start);
          duration = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }
      } catch (e) {
        console.warn('Erreur calcul durée:', e);
      }
    }
    
    // Prix par jour
    const pricePerDay = vehicleData.price || order.pricePerDay || reservation.pricePerDay || 89000;
    
    // Total
    let totalPrice = order.totalPrice || reservation.totalPrice || 0;
    if (totalPrice === 0 && duration > 0) {
      totalPrice = duration * pricePerDay;
    }
    
    // Nom utilisateur (plusieurs sources possibles)
    const userName = order.userName || 
                     user.name || 
                     user.fullName || 
                     `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim() || 
                     (order.userId ? 'Utilisateur ' + order.userId : 'Client inconnu');
    
    // Véhicule (plusieurs sources possibles)
    const vehicleBrand = vehicleData.brand || vehicleData.make || (order.vehicleName ? order.vehicleName.split(' ')[0] : 'Véhicule');
    const vehicleModel = vehicleData.model || vehicleData.name || (order.vehicleName ? order.vehicleName.substring(order.vehicleName.indexOf(' ') + 1) : 'Inconnu');

    return {
      _id: order._id || order.id || `temp-${Date.now()}`,
      status: statusMap[order.status] || 'en_attente',
      createdAt: order.createdAt || order.timestamp || new Date().toISOString(),
      userName: userName,
      userEmail: order.userEmail || user.email || shipping.email || 'Non renseigné',
      userPhone: order.userPhone || user.phone || shipping.phone || order.phone || 'Non renseigné',
      address: order.address || user.address || shipping.address || 'Non renseignée',
      startDate: startDate,
      endDate: endDate,
      duration: duration,
      pricePerDay: pricePerDay,
      totalPrice: totalPrice,
      notes: order.notes || reservation.notes || '',
      vehicle: {
        brand: vehicleBrand,
        model: vehicleModel,
        price: vehicleData.price || pricePerDay,
        image: vehicleData.imageUrl || vehicleData.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
        type: vehicleData.type || vehicleData.fuelType || 'Non spécifié',
        ...vehicleData
      },
      user: user,
      isLocal: isLocal,
      isValid: !!(startDate && endDate && duration > 0 && totalPrice > 0)
    };
  };

  const fetchOrders = async () => {
    try {
      // 1. Charger les commandes du serveur
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).catch(() => ({ data: [] }));
      
      const rawServerOrders = response.data || [];
      const activeServerOrders = rawServerOrders.filter(order => order.status !== 'cancelled');
      const serverOrders = activeServerOrders.map(order => normalizeOrder(order, false));
      
      // 2. Charger les commandes locales
      let pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // Enrichir les commandes locales avec les données utilisateur si nécessaire
      pendingOrders = pendingOrders.map(order => {
        if (order.userId && !order.user) {
          const foundUser = users.find(u => u._id === order.userId || u.id === order.userId);
          if (foundUser) {
            return { ...order, user: foundUser };
          }
        }
        return order;
      });
      
      // Créer un Set pour détecter les doublons
      const serverOrderKeys = new Set(
        serverOrders.map(o => `${o.vehicle.brand}-${o.vehicle.model}-${o.startDate}-${o.endDate}-${o.userName}`)
      );
      
      const localOrders = pendingOrders
        .filter(order => {
          const normalized = normalizeOrder(order, true);
          const key = `${normalized.vehicle.brand}-${normalized.vehicle.model}-${normalized.startDate}-${normalized.endDate}-${normalized.userName}`;
          return !serverOrderKeys.has(key);
        })
        .map((order, index) => {
          const normalized = normalizeOrder(order, true);
          // Assurer que l'ID commence par local- pour le traitement
          if (!normalized._id.toString().startsWith('local-')) {
            normalized._id = `local-${normalized._id}`;
          }
          return normalized;
        });
      
      // 3. Combiner et trier
      const allOrders = [...serverOrders, ...localOrders].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // 4. Détecter les nouvelles commandes
      const pendingCount = allOrders.filter(o => o.status === 'en_attente').length;
      if (previousPendingCount.current > 0 && pendingCount > previousPendingCount.current) {
        const newCount = pendingCount - previousPendingCount.current;
        setNewOrdersCount(newCount);
        
        // Ajouter une notification interne
        addNotification({
          title: 'Nouvelle commande !',
          message: `Vous avez ${newCount} nouvelle(s) commande(s) en attente de validation.`,
          type: 'order'
        });
        
        if (Notification.permission === 'granted') {
          new Notification('🚗 Nouvelle commande GBA !', {
            body: `Vous avez ${newCount} nouvelle${newCount > 1 ? 's' : ''} commande${newCount > 1 ? 's' : ''} en attente`,
            icon: '/logo.png',
            tag: 'new-order'
          });
        }
        
        setTimeout(() => setNewOrdersCount(0), 5000);
      }
      
      previousPendingCount.current = pendingCount;
      setOrders(allOrders);
      
    } catch (error) {
      console.error("Erreur:", error);
      setToast({
        message: 'Erreur lors du chargement des commandes',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      // 1. Charger les commandes du serveur
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).catch(() => ({ data: [] }));
      
      const rawServerOrders = response.data || [];
      // Filtrer uniquement les commandes rejetées/annulées du serveur
      const serverCancelledOrders = rawServerOrders
        .filter(order => order.status === 'cancelled' || order.status === 'rejected')
        .map(order => {
          const normalized = normalizeOrder(order, false);
          normalized.isArchived = true;
          return normalized;
        });
      
      // 2. Charger les commandes locales rejetées
      const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Enrichir avec les données utilisateur
      const enrichedPendingOrders = pendingOrders.map(order => {
        if (order.userId && !order.user) {
          const foundUser = users.find(u => u._id === order.userId || u.id === order.userId);
          if (foundUser) {
            return { ...order, user: foundUser };
          }
        }
        return order;
      });
      
      // Filtrer uniquement les commandes rejetées locales
      const localCancelledOrders = enrichedPendingOrders
        .filter(order => order.status === 'rejetee' || order.status === 'cancelled' || order.status === 'rejected')
        .map(order => {
          const normalized = normalizeOrder(order, true);
          normalized.isArchived = true;
          if (!normalized._id.toString().startsWith('local-')) {
            normalized._id = `local-${normalized._id}`;
          }
          return normalized;
        });
      
      // 3. Combiner et trier par date
      const allHistoryOrders = [...serverCancelledOrders, ...localCancelledOrders].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setOrders(allHistoryOrders);
      setLoading(false);
    } catch (error) {
      console.error("Erreur:", error);
      setLoading(false);
    }
  };

  // useEffect pour calculer les stats globales
  useEffect(() => {
    const calculateGlobalStats = async () => {
      try {
        // 1. Récupérer toutes les commandes serveur
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => ({ data: [] }));
        
        const serverOrders = (response.data || []).map(o => normalizeOrder(o, false));
        
        // 2. Récupérer toutes les commandes locales
        let pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Enrichir les commandes locales avec les données utilisateur
        pendingOrders = pendingOrders.map(order => {
          if (order.userId && !order.user) {
            const foundUser = users.find(u => u._id === order.userId || u.id === order.userId);
            if (foundUser) {
              return { ...order, user: foundUser };
            }
          }
          return order;
        });
        
        const localOrders = pendingOrders.map(o => normalizeOrder(o, true));
          
        // 3. Fusionner en évitant les doublons
        const allOrders = [...serverOrders];
        const serverKeys = new Set(serverOrders.map(o => `${o.vehicle.brand}-${o.vehicle.model}-${o.startDate}-${o.endDate}-${o.userName}`));
        
        localOrders.forEach(local => {
           const key = `${local.vehicle.brand}-${local.vehicle.model}-${local.startDate}-${local.endDate}-${local.userName}`;
           if (!serverKeys.has(key)) {
             allOrders.push(local);
           }
        });

        setGlobalStats({
          total: allOrders.length,
          en_attente: allOrders.filter(o => o.status === 'en_attente').length,
          validee: allOrders.filter(o => o.status === 'validee' || o.status === 'completed').length,
          rejetee: allOrders.filter(o => o.status === 'rejetee' || o.status === 'cancelled').length,
          invalid: allOrders.filter(o => !o.isValid).length
        });
        
      } catch (error) {
        console.error("Erreur calcul stats globales:", error);
      }
    };

    calculateGlobalStats();
    const interval = setInterval(calculateGlobalStats, 30000);
    window.addEventListener('newOrder', calculateGlobalStats);
    window.addEventListener('orderStatusChanged', calculateGlobalStats);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('newOrder', calculateGlobalStats);
      window.removeEventListener('orderStatusChanged', calculateGlobalStats);
    };
  }, []);

  // useEffect pour gérer le chargement selon le mode (active/history)
  useEffect(() => {
    if (viewMode === 'active') {
      fetchOrders();
    } else {
      fetchHistory();
    }
    
    const handleOrderCreated = () => {
      console.log('Order created event received in admin, refreshing...');
      if (viewMode === 'active') {
        fetchOrders();
      }
    };
    window.addEventListener('newOrder', handleOrderCreated);
    
    const interval = viewMode === 'active' ? setInterval(() => {
      fetchOrders();
    }, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('newOrder', handleOrderCreated);
    };
  }, [viewMode]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const orderToUpdate = orders.find(o => o._id === id);
      
      if (orderToUpdate?.isLocal) {
        const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        const localIdMatch = id.match(/^local-(.+)$/);
        
        if (localIdMatch) {
          const localId = localIdMatch[1];
          // Chercher par id ou _id
          let index = pendingOrders.findIndex(o => o.id == localId || o._id == localId);
          
          // Si l'ID est numérique (anciennes commandes), essayer de convertir
          if (index === -1 && !isNaN(localId)) {
            index = pendingOrders.findIndex(o => o.id == parseInt(localId));
          }
          
          // Si toujours pas trouvé, essayer par index direct (pour les mocks)
          if (index === -1 && !isNaN(localId)) {
             const idx = parseInt(localId);
             if (idx >= 0 && idx < pendingOrders.length) {
               index = idx;
             }
          }
        
        if (index >= 0 && index < pendingOrders.length) {
          const order = pendingOrders[index];
          order.status = status;
          order.updatedAt = new Date().toISOString();
          localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
          
          // Préparer les données de commande pour la notification
          const orderData = {
            _id: id,
            id: id,
            userName: order.userName || order.user?.name || order.shipping?.firstName,
            userEmail: order.userEmail || order.email || order.shipping?.email,
            vehicleName: order.vehicleName || `${order.vehicle?.brand || ''} ${order.vehicle?.model || ''}`.trim(),
            startDate: order.startDate,
            endDate: order.endDate,
            totalPrice: order.totalPrice
          };
          
          // Envoyer l'email de confirmation/rejet au client
          try {
            await sendOrderConfirmation(id, status);
            console.log('📧 Email envoyé pour commande locale');
          } catch (emailErr) {
            console.error('Erreur envoi email local:', emailErr);
          }

          // Extraire l'ID du véhicule pour mettre à jour sa disponibilité
          const vehicleId = order.vehicleId || order.vehicle?._id || order.vehicle?.id;
          console.log('🔄 Mise à jour du statut de commande - VehicleId:', vehicleId);
          
          // Dispatcher l'événement localement
          window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
            detail: { orderId: id, status, order: orderData, vehicleId }
          }));
          
          // Mettre à jour la disponibilité du véhicule
          window.dispatchEvent(new CustomEvent('orderStatusChanged', {
            detail: { orderId: id, status, vehicleId }
          }));
          
          setToast({
            message: `Commande ${status === 'validee' ? 'validée' : 'rejetée'} ! Email envoyé au client.`,
            type: 'success'
          });
          
          setSelectedOrder(null);
          await fetchOrders();
        } else {
          throw new Error('Commande locale introuvable');
        }
      }
    } else {
        const statusMapToBackend = {
          'en_attente': 'pending',
          'validee': 'confirmed',
          'rejetee': 'cancelled'
        };
        
        const backendStatus = statusMapToBackend[status] || status;
        
        await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, 
          { status: backendStatus },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        try {
          await sendOrderConfirmation(id, status);
          setToast({
            message: `Commande ${status === 'validee' ? 'validée' : 'rejetée'} ! Email de confirmation envoyé.`,
            type: 'success'
          });
        } catch (emailError) {
          console.error('Erreur envoi email:', emailError);
          setToast({
            message: `Commande ${status === 'validee' ? 'validée' : 'rejetée'} avec succès !`,
            type: 'success'
          });
        }
        
        // Notifier les autres composants du changement avec vehicleId
        const orderToNotify = orders.find(o => o._id === id);
        const vehicleId = orderToNotify?.vehicle?._id || orderToNotify?.vehicle?.id || orderToNotify?.vehicleId;
        console.log('🔄 Mise à jour du statut de commande backend - VehicleId:', vehicleId);
        
        window.dispatchEvent(new CustomEvent('orderStatusChanged', { 
          detail: { orderId: id, status, vehicleId } 
        }));
        
        await fetchOrders();
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      setToast({
        message: 'Erreur lors de la mise à jour du statut',
        type: 'error'
      });
    }
  };

  const deleteOrder = async (id) => {
    const orderToDelete = orders.find(o => o._id === id);
    
    const confirmMessage = orderToDelete?.isLocal
      ? 'Êtes-vous sûr de vouloir supprimer cette commande locale ? Cette action est irréversible.'
      : 'Êtes-vous sûr de vouloir annuler cette commande ?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (orderToDelete?.isLocal) {
        const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        const localIdMatch = id.match(/^local-(.+)$/);
        
        if (localIdMatch) {
          const localId = localIdMatch[1];
          let orderIndex = pendingOrders.findIndex(o => o.id === localId);
          
          if (orderIndex === -1 && !isNaN(localId)) {
            orderIndex = parseInt(localId);
          }
          
          if (orderIndex >= 0 && orderIndex < pendingOrders.length) {
            pendingOrders.splice(orderIndex, 1);
            localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
            setOrders(prevOrders => prevOrders.filter(o => o._id !== id));
            
            setToast({
              message: 'Commande locale supprimée avec succès !',
              type: 'success'
            });
          } else {
            throw new Error('Commande locale introuvable');
          }
        }
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/orders/${id}`, 
          { status: 'cancelled' },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setOrders(prevOrders => prevOrders.filter(o => o._id !== id));
        setToast({
          message: 'Commande annulée avec succès !',
          type: 'success'
        });
      }
      
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      setToast({
        message: error.message || 'Erreur lors de la suppression',
        type: 'error'
      });
    }
  };

  // Fonction pour nettoyer les commandes invalides
  const cleanInvalidOrders = () => {
    const invalidOrders = orders.filter(o => !o.isValid);
    
    if (window.confirm(`Supprimer ${invalidOrders.length} commande(s) invalide(s) ?`)) {
      // Nettoyer localStorage
      const validLocalOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]')
        .filter(o => {
          const normalized = normalizeOrder(o, true);
          return normalized.isValid;
        });
      
      localStorage.setItem('pendingOrders', JSON.stringify(validLocalOrders));
      
      // Retirer de la liste
      const invalidIds = invalidOrders.map(o => o._id);
      setOrders(prevOrders => prevOrders.filter(o => !invalidIds.includes(o._id)));
      
      setToast({
        message: `${invalidOrders.length} commande(s) invalide(s) supprimée(s) !`,
        type: 'success'
      });
    }
  };

  // Fonction pour envoyer un rappel de paiement
  const handleSendPaymentReminder = async (orderId) => {
    try {
      await sendPaymentReminder(orderId);
      setToast({
        message: '💳 Rappel de paiement envoyé avec succès !',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: 'Erreur lors de l\'envoi du rappel de paiement',
        type: 'error'
      });
    }
  };

  // Fonction pour envoyer le récapitulatif de location
  const handleSendRentalSummary = async (orderId) => {
    try {
      await sendRentalSummary(orderId);
      setToast({
        message: '📄 Récapitulatif envoyé avec succès !',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: 'Erreur lors de l\'envoi du récapitulatif',
        type: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'en_attente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'validee': 'bg-green-100 text-green-800 border-green-300',
      'rejetee': 'bg-red-100 text-red-800 border-red-300',
      'annulee': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      'en_attente': 'En attente',
      'validee': 'Validée',
      'rejetee': 'Rejetée',
      'annulee': 'Annulée'
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'en_attente': return <FaHourglassHalf />;
      case 'validee': return <FaCheckCircle />;
      case 'rejetee': return <FaTimesCircle />;
      case 'annulee': return <FaTimesCircle />;
      default: return <FaClock />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const filteredOrders = orders.filter(o => {
    // Filtrer par statut
    const statusMatch = filter === 'all' || 
                       (filter === 'validee' && (o.status === 'validee' || o.status === 'confirmed')) ||
                       (filter === 'rejetee' && (o.status === 'rejetee' || o.status === 'cancelled')) ||
                       o.status === filter;
    
    // Filtrer par recherche
    if (!searchTerm.trim()) return statusMatch;
    
    const search = searchTerm.toLowerCase();
    const searchMatch = 
      o.userName?.toLowerCase().includes(search) ||
      o.userEmail?.toLowerCase().includes(search) ||
      o.userPhone?.toLowerCase().includes(search) ||
      o.vehicle?.brand?.toLowerCase().includes(search) ||
      o.vehicle?.model?.toLowerCase().includes(search) ||
      o._id?.toLowerCase().includes(search);
    
    return statusMatch && searchMatch;
  });

  // Utiliser globalStats pour l'affichage des cartes, au lieu de calculer sur 'orders' (qui dépend de la vue)
  const statsToDisplay = globalStats || {
    total: 0,
    en_attente: 0,
    validee: 0,
    rejetee: 0,
    invalid: 0
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen overflow-y-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {newOrdersCount > 0 && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <FaBell className="text-red-600 text-xl animate-pulse" />
            </div>
            <div>
              <p className="font-black text-lg">Nouvelle{newOrdersCount > 1 ? 's' : ''} commande{newOrdersCount > 1 ? 's' : ''} !</p>
              <p className="text-sm text-red-100">{newOrdersCount} commande{newOrdersCount > 1 ? 's' : ''} en attente</p>
            </div>
          </div>
        </div>
      )}

      {statsToDisplay.invalid > 0 && (
        <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <p className="font-bold text-orange-800">Données incomplètes détectées</p>
              <p className="text-sm text-orange-700">
                {statsToDisplay.invalid} commande(s) avec des données invalides ou incomplètes.
              </p>
            </div>
            <button
              type="button"
              onClick={cleanInvalidOrders}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all text-sm shadow-lg"
            >
              🧹 Nettoyer ({statsToDisplay.invalid})
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
            <FaCar className="text-white text-xl" />
          </div>
          Gestion des Réservations
          {statsToDisplay.en_attente > 0 && (
            <span className="ml-2 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
              {statsToDisplay.en_attente} nouvelle{statsToDisplay.en_attente > 1 ? 's' : ''}
            </span>
          )}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-700 font-bold uppercase">Total</p>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FaCar className="text-white text-sm" />
              </div>
            </div>
            <p className="text-4xl font-black text-blue-600">{statsToDisplay.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-yellow-700 font-bold uppercase">En attente</p>
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <FaHourglassHalf className="text-white text-sm" />
              </div>
            </div>
            <p className="text-4xl font-black text-yellow-600">{statsToDisplay.en_attente}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-700 font-bold uppercase">Validées</p>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-white text-sm" />
              </div>
            </div>
            <p className="text-4xl font-black text-green-600">{statsToDisplay.validee}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-red-700 font-bold uppercase">Rejetées</p>
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <FaTimesCircle className="text-white text-sm" />
              </div>
            </div>
            <p className="text-4xl font-black text-red-600">{statsToDisplay.rejetee}</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setViewMode('active');
              setFilter('all');
            }}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
              viewMode === 'active'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            📋 Commandes Actives
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('history');
              setFilter('all');
            }}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
              viewMode === 'history'
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🗃️ Commandes non actives
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone, véhicule ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Effacer la recherche"
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm && (
              <span className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg font-medium whitespace-nowrap">
                {filteredOrders.length} résultat{filteredOrders.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Toutes ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('en_attente')}
            className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 ${
              filter === 'en_attente'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            En attente ({orders.filter(o => o.status === 'en_attente').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('validee')}
            className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 ${
              filter === 'validee'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Validées ({orders.filter(o => o.status === 'validee' || o.status === 'confirmed').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('rejetee')}
            className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 ${
              filter === 'rejetee'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Rejetées ({orders.filter(o => o.status === 'rejetee' || o.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-600 text-lg">Aucune réservation {filter !== 'all' ? `avec le statut "${getStatusText(filter)}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order._id} className={`bg-white rounded-xl shadow-lg overflow-hidden border ${!order.isValid ? 'border-orange-300' : 'border-gray-100'} hover:shadow-2xl transition-all duration-300`}>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                    <FaCar className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-lg">
                        {order.vehicle?.brand} {order.vehicle?.model}
                      </p>
                      {order.isLocal && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                          📱 LOCAL
                        </span>
                      )}
                      {!order.isValid && (
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">
                          ⚠️ INVALIDE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">#{String(order._id || '').slice(-8) || 'N/A'}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl border-2 font-bold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-2 uppercase">Client</p>
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-sm">
                        <FaUser className="text-red-600" />
                        <span className="font-semibold">{order.userName}</span>
                      </p>
                      <p className="flex items-start gap-2 text-sm text-gray-600">
                        <FaPhone className="text-red-600 mt-0.5" />
                        <span>{order.userPhone}</span>
                      </p>
                      <p className="flex items-start gap-2 text-sm text-gray-600">
                        <FaEnvelope className="text-red-600 mt-0.5" />
                        <span className="break-all">{order.userEmail}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-2 uppercase">Période</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FaCalendar className="text-red-600 mt-1 text-xs" />
                        <div className="text-sm">
                          <p className="font-semibold text-gray-700">Du:</p>
                          <p className="text-gray-900">{formatDate(order.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaCalendar className="text-red-600 mt-1 text-xs" />
                        <div className="text-sm">
                          <p className="font-semibold text-gray-700">Au:</p>
                          <p className="text-gray-900">{formatDate(order.endDate)}</p>
                        </div>
                      </div>
                      {order.duration > 0 ? (
                        <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                          <p className="flex items-center gap-2 text-sm">
                            <FaClock className="text-red-600" />
                            <span className="font-bold text-red-700">{order.duration} jour{order.duration > 1 ? 's' : ''}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                          <p className="flex items-center gap-2 text-xs text-orange-700">
                            <FaClock className="text-orange-600" />
                            <span className="font-semibold">Durée invalide</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-2 uppercase">Tarif</p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 px-3 py-2 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Par jour</p>
                        <p className="font-bold text-gray-900">{order.pricePerDay.toLocaleString()} FCFA</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100 px-4 py-3 rounded-lg border-2 border-red-200">
                        <div className="flex items-center gap-2 mb-1">
                          <FaMoneyBillWave className="text-red-600" />
                          <p className="text-xs text-red-700 font-bold uppercase">Total</p>
                        </div>
                        <p className="font-black text-2xl text-red-600">{order.totalPrice.toLocaleString()}</p>
                        <p className="text-xs text-red-700 font-bold">FCFA</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all"
                    >
                      <FaEye />
                      Détails
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => deleteOrder(order._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                    >
                      <FaTrash />
                      Supprimer
                    </button>
                    
                    {order.status === 'en_attente' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Valider la réservation de ${order.userName}?`)) {
                              handleStatusChange(order._id, 'validee', order.isLocal);
                            }
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                        >
                          <FaCheckCircle />
                          Valider
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Rejeter la réservation de ${order.userName}?`)) {
                              handleStatusChange(order._id, 'rejetee', order.isLocal);
                            }
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                        >
                          <FaTimesCircle />
                          Rejeter
                        </button>
                      </>
                    )}
                    
                    {order.status === 'validee' && !order.isLocal && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSendPaymentReminder(order._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          title="Envoyer un rappel de paiement"
                        >
                          <FaPaperPlane />
                          Rappel Paiement
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendRentalSummary(order._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          title="Envoyer le récapitulatif de location"
                        >
                          <FaFileInvoice />
                          Récapitulatif
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <h3 className="text-2xl font-black mb-2">Détails de la réservation</h3>
              <p className="text-red-100">#{String(selectedOrder._id || '').slice(-8) || 'N/A'}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaCar className="text-red-600" />
                  Véhicule
                </h4>
                <p className="text-lg font-semibold">{selectedOrder.vehicle?.brand} {selectedOrder.vehicle?.model}</p>
                <p className="text-sm text-gray-600">{selectedOrder.vehicle?.type}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaCalendar className="text-red-600" />
                  Période de location
                </h4>
                <p><strong>Du:</strong> {formatDate(selectedOrder.startDate)}</p>
                <p><strong>Au:</strong> {formatDate(selectedOrder.endDate)}</p>
                <p><strong>Durée:</strong> {selectedOrder.duration} jour{selectedOrder.duration > 1 ? 's' : ''}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaUser className="text-red-600" />
                  Informations client
                </h4>
                <p><strong>Nom:</strong> {selectedOrder.userName}</p>
                <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                <p><strong>Téléphone:</strong> {selectedOrder.userPhone}</p>
                <p><strong>Adresse:</strong> {selectedOrder.address}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaMoneyBillWave className="text-red-600" />
                  Détail du prix
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Prix par jour:</span>
                    <span className="font-bold">{selectedOrder.pricePerDay.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nombre de jours:</span>
                    <span className="font-bold">{selectedOrder.duration}</span>
                  </div>
                  <div className="h-px bg-gray-300 my-2"></div>
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total:</span>
                    <span className="font-black text-red-600">{selectedOrder.totalPrice.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {selectedOrder.status === 'en_attente' && (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        handleStatusChange(selectedOrder._id, 'validee', selectedOrder.isLocal);
                        setSelectedOrder(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      <FaCheck />
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleStatusChange(selectedOrder._id, 'rejetee', selectedOrder.isLocal);
                        setSelectedOrder(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      <FaTimes />
                      Rejeter
                    </button>
                  </div>
                )}
                
              </div>

              <div className="flex gap-4">{/* Keep existing close button here */}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}