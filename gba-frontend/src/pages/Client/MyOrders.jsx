import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { resendOrderEmail } from '../../services/emailService';
import { FaCar, FaCalendar, FaClock, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaEye, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';

const MyOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (location.state?.orderSuccess || location.state?.refresh) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
    fetchOrders();
    
    // Écouter les événements de création de commande
    const handleOrderCreated = () => {
      console.log('Order created event received, refreshing...');
      fetchOrders();
    };
    window.addEventListener('orderCreated', handleOrderCreated);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated);
    };
  }, [location]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour voir vos commandes');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      console.log('Fetching orders from:', `${import.meta.env.VITE_API_URL}/api/orders/myorders`);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Récupérer les commandes du serveur
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/myorders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      }).catch(() => ({ data: [] }));
      
      const serverOrders = Array.isArray(response.data) ? response.data : [];
      
      // Récupérer l'utilisateur connecté
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserEmail = currentUser.email || '';
      const currentUserId = currentUser.id || currentUser._id || '';
      
      // Ajouter les commandes locales (filtrer par utilisateur)
      const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      const localOrders = pendingOrders
        .filter(order => {
          // Filtrer pour ne montrer que les commandes de l'utilisateur connecté
          const orderEmail = order.userEmail || order.shipping?.email || order.email;
          const orderUserId = order.userId || order.user?.id || order.user?._id;
          return orderEmail === currentUserEmail || orderUserId === currentUserId;
        })
        .map((order, index) => ({
        _id: order.id ? `local-${order.id}` : `local-${index}`,
        status: order.status || 'en_attente',
        createdAt: order.createdAt || order.timestamp || new Date().toISOString(),
        userName: order.userName || `${order.shipping?.firstName || ''} ${order.shipping?.lastName || ''}`,
        userEmail: order.userEmail || order.shipping?.email,
        userPhone: order.userPhone || order.shipping?.phone,
        startDate: order.startDate || order.reservation?.startDate,
        endDate: order.endDate || order.reservation?.endDate,
        duration: order.duration || order.reservation?.duration,
        pricePerDay: order.pricePerDay || order.reservation?.pricePerDay,
        totalPrice: order.totalPrice || order.reservation?.totalPrice,
        vehicle: order.vehicle || (order.vehicles && order.vehicles[0]) || {},
        shippingInfo: order.shipping,
        isLocal: true
      }));
      
      console.log('Orders received:', [...serverOrders, ...localOrders]);
      setOrders([...serverOrders, ...localOrders]);
      setError('');
    } catch (err) {
      console.error('Error details:', err.response || err);
      if (err.response?.status === 401) {
        setError('Session expirée. Redirection vers la connexion...');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 404) {
        setError('Service non disponible. Le backend est peut-être en veille sur Render (démarrage en cours...)');
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('⏱️ Le serveur met du temps à répondre. Il est peut-être en veille sur Render. Veuillez patienter 30 secondes et rafraîchir la page.');
      } else {
        setError(err.response?.data?.message || 'Erreur lors du chargement des réservations');
      }
    } finally {
      setLoading(false);
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
      'validee': 'Validée ✓',
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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      const orderIdStr = String(orderId);
      
      // Vérifier si c'est une commande locale (ID commence par "local-" ou la commande a isLocal=true)
      const orderInList = orders.find(o => String(o._id) === orderIdStr || String(o.id) === orderIdStr);
      const isLocalOrder = orderIdStr.startsWith('local-') || (orderInList && orderInList.isLocal);
      
      console.log('Annulation commande:', { orderId: orderIdStr, isLocal: isLocalOrder });
      
      if (isLocalOrder) {
        // Annuler une commande locale
        const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        
        // Extraire l'ID réel si c'est un ID formaté "local-xxx"
        const realId = orderIdStr.startsWith('local-') ? orderIdStr.replace('local-', '') : orderIdStr;
        
        console.log('Recherche dans pendingOrders avec ID:', realId);
        console.log('PendingOrders actuels:', pendingOrders);
        
        // Trouver l'index de la commande
        let index = pendingOrders.findIndex(o => {
          const oId = String(o.id || '');
          const o_Id = String(o._id || '');
          return oId === realId || o_Id === realId || 
                 oId === orderIdStr || o_Id === orderIdStr;
        });
        
        console.log('Index trouvé:', index);
        
        if (index >= 0) {
          // Marquer comme annulée
          pendingOrders[index].status = 'annulee';
          pendingOrders[index].updatedAt = new Date().toISOString();
          localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
          alert('✅ Réservation annulée avec succès !');
        } else {
          // Essayer de supprimer par timestamp ou autre identifiant
          const originalLength = pendingOrders.length;
          const filtered = pendingOrders.filter((o, i) => {
            // Garder les commandes qui ne correspondent pas
            const oId = String(o.id || i);
            return oId !== realId && `local-${oId}` !== orderIdStr;
          });
          
          if (filtered.length < originalLength) {
            localStorage.setItem('pendingOrders', JSON.stringify(filtered));
            alert('✅ Réservation annulée avec succès !');
          } else {
            alert('✅ Réservation annulée !');
          }
        }
        
        fetchOrders();
      } else {
        // Annuler une commande backend
        await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, 
          { status: 'cancelled' },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        alert('✅ Réservation annulée avec succès !');
        fetchOrders();
      }
    } catch (err) {
      console.error('Erreur annulation:', err);
      alert('Erreur lors de l\'annulation. Veuillez réessayer.');
    }
  };

  const handleResendEmail = async (orderId) => {
    try {
      await resendOrderEmail(orderId);
      alert('Email renvoyé avec succès !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors du renvoi de l\'email. Veuillez contacter le support.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Spacer pour le header fixe */}
      <div className="h-20"></div>
      
      {showSuccess && (
        <div className="fixed top-24 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3">
          <FaCheckCircle className="text-2xl" />
          <div>
            <p className="font-bold">Réservation confirmée !</p>
            <p className="text-sm">Numéro: {location.state?.orderId}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff0000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-red-500/50">
              <FaCar />
            </div>
            <div>
              <h1 className="text-4xl font-black mb-2">Mes Réservations</h1>
              <p className="text-gray-400 text-lg">Suivez l'état de vos locations de véhicules</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {error ? (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-lg">
            <p className="font-semibold">{error}</p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center border border-gray-100 mt-12">
            <div className="mb-8 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80&auto=format"
                alt="Voiture"
                className="w-64 h-48 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Aucune réservation</h2>
            <p className="text-gray-600 mb-8 text-lg">Vous n'avez pas encore réservé de véhicule</p>
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 font-bold text-lg"
            >
              <FaCar />
              Découvrir nos véhicules
            </Link>
          </div>
        ) : (
          <>
            {orders.some(o => o.isLocal) && (
              <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 px-6 py-4 rounded-lg shadow-lg mb-6">
                <div className="flex items-center gap-3">
                  <FaHourglassHalf className="text-2xl" />
                  <div>
                    <p className="font-bold">Commandes locales détectées</p>
                    <p className="text-sm">Ces réservations sont enregistrées localement. Une fois validées par l'admin, elles seront synchronisées sur le serveur.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id || order.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Réservation #{order._id?.slice(-8) || order.id}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {order.isLocal && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-300">
                        📱 LOCAL
                      </span>
                    )}
                  </div>
                  <div className={`px-4 py-2 rounded-xl border-2 font-bold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Vehicle Info */}
                    <div className="lg:col-span-2">
                      <div className="flex gap-4">
                        <div className="w-32 h-24 bg-gradient-to-br from-black to-gray-900 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                          <img 
                            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=80&auto=format"
                            alt={`${order.vehicle?.brand} ${order.vehicle?.model}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {order.vehicle?.brand} {order.vehicle?.model || order.vehicle?.name}
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaCalendar className="text-red-600" />
                              <div>
                                <p className="font-semibold">Début</p>
                                <p>{formatDate(order.startDate)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaCalendar className="text-red-600" />
                              <div>
                                <p className="font-semibold">Fin</p>
                                <p>{formatDate(order.endDate)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-gray-700">
                            <FaClock className="text-red-600" />
                            <span className="font-bold">{order.duration} jour{order.duration > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
                      <div className="text-center">
                        <FaMoneyBillWave className="text-red-600 text-3xl mx-auto mb-3" />
                        <p className="text-gray-700 text-sm font-medium mb-2">Prix total</p>
                        <p className="text-3xl font-black text-red-600">
                          {order.totalPrice?.toLocaleString()} FCFA
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          {order.pricePerDay?.toLocaleString()} FCFA/jour
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-4 border-t pt-4 flex-wrap">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                    >
                      <FaEye />
                      Détails
                    </button>
                    
                    {order.status === 'en_attente' && (
                      <button
                        onClick={() => handleCancelOrder(order._id || order.id)}
                        className="flex items-center gap-2 px-6 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-all duration-300"
                      >
                        <FaTimesCircle />
                        Annuler
                      </button>
                    )}

                    {(order.status === 'validee' || order.status === 'rejetee') && !order.isLocal && (
                      <button
                        onClick={() => handleResendEmail(order._id || order.id)}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-all duration-300"
                      >
                        <FaEnvelope />
                        Renvoyer l'email
                      </button>
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de détails */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <h3 className="text-2xl font-black mb-2">Détails de la réservation</h3>
              <p className="text-red-100">#{selectedOrder._id?.slice(-8) || selectedOrder.id}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Véhicule */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaCar className="text-red-600" />
                  Véhicule
                </h4>
                <p className="text-lg font-semibold">{selectedOrder.vehicle?.brand} {selectedOrder.vehicle?.model}</p>
              </div>

              {/* Dates */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaCalendar className="text-red-600" />
                  Période de location
                </h4>
                <p><strong>Du:</strong> {formatDate(selectedOrder.startDate)}</p>
                <p><strong>Au:</strong> {formatDate(selectedOrder.endDate)}</p>
                <p><strong>Durée:</strong> {selectedOrder.duration} jour{selectedOrder.duration > 1 ? 's' : ''}</p>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-600" />
                  Informations de contact
                </h4>
                <p><strong>Nom:</strong> {selectedOrder.userName}</p>
                <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                <p><strong>Téléphone:</strong> {selectedOrder.userPhone}</p>
                <p><strong>Adresse:</strong> {selectedOrder.shippingInfo?.address}, {selectedOrder.shippingInfo?.city}</p>
              </div>

              {/* Prix */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaMoneyBillWave className="text-red-600" />
                  Détail du prix
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Prix par jour:</span>
                    <span className="font-bold">{selectedOrder.pricePerDay?.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nombre de jours:</span>
                    <span className="font-bold">{selectedOrder.duration}</span>
                  </div>
                  <div className="h-px bg-gray-300 my-2"></div>
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total:</span>
                    <span className="font-black text-red-600">{selectedOrder.totalPrice?.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
