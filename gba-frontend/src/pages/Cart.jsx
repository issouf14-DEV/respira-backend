// ============================================
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaBan } from 'react-icons/fa';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    // Charger les commandes en attente depuis localStorage
    const loadOrders = () => {
      try {
        const orders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        
        // Récupérer l'utilisateur connecté
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserEmail = currentUser.email || '';
        const currentUserId = currentUser.id || currentUser._id || '';
        
        // Filtrer les commandes pour ne montrer que celles de l'utilisateur connecté
        const userOrders = orders.filter(order => {
          const orderEmail = order.userEmail || order.shipping?.email || order.email;
          const orderUserId = order.userId || order.user?.id || order.user?._id;
          return orderEmail === currentUserEmail || orderUserId === currentUserId;
        });
        
        if (isMounted) {
          setPendingOrders(userOrders);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
      }
    };
    
    loadOrders();
    
    // Écouter les changements de statut des commandes
    const handleOrderStatusChanged = () => {
      if (isMounted) {
        console.log('Order status changed, refreshing cart...');
        loadOrders();
      }
    };
    
    window.addEventListener('orderStatusChanged', handleOrderStatusChanged);
    
    return () => {
      isMounted = false;
      window.removeEventListener('orderStatusChanged', handleOrderStatusChanged);
    };
  }, []);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0 && pendingOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">Découvrez nos véhicules et ajoutez-en à votre panier</p>
          <Link
            to="/vehicles"
            className="inline-block bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-lg hover:from-red-500 hover:to-red-600 transition font-semibold"
          >
            Voir les véhicules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Mon Panier</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => {
              const basePrice = parseFloat(item.price) || 0;
              const optionsPrice = Object.values(item.options || {}).reduce(
                (sum, opt) => sum + (parseFloat(opt.price) || 0),
                0
              );
              const itemTotal = (basePrice + optionsPrice) * (item.quantity || 1);

              return (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex gap-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                          <p className="text-gray-600 mb-2">{item.brand}</p>
                          
                          {Object.keys(item.options || {}).length > 0 && (
                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Options:</strong>
                              {Object.entries(item.options || {}).map(([category, option]) => (
                                <div key={category}>
                                  {category}: {option.name} {option.price > 0 && `(+${option.price}€)`}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id, item.options)}
                          className="text-red-600 hover:text-red-700 h-6"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.options, item.quantity - 1)}
                            className="w-8 h-8 border rounded hover:bg-gray-100"
                          >
                            −
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.options, item.quantity + 1)}
                            className="w-8 h-8 border rounded hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {itemTotal.toLocaleString()}€
                          </div>
                          <div className="text-sm text-gray-600">
                            {basePrice.toLocaleString()}€ {optionsPrice > 0 && `+ ${optionsPrice}€`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center">
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Vider le panier
              </button>
              <Link
                to="/vehicles"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Continuer mes achats
              </Link>
            </div>
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span className="font-semibold">{getCartTotal().toLocaleString()}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className="text-green-600 font-semibold">Gratuite</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span className="font-semibold">
                    {(getCartTotal() * 0.2).toLocaleString()}€
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span className="text-blue-600">
                  {(getCartTotal() * 1.2).toLocaleString()}€
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-red-500 hover:to-red-600 transition mb-3"
              >
                Procéder au paiement
              </button>

              <div className="text-center text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span>🔒</span>
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>🚚</span>
                  <span>Livraison gratuite</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section des réservations en attente */}
        {pendingOrders.length > 0 && (
          <div className="mt-12">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 mb-6 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <FaClock className="text-orange-600 text-2xl" />
                <h2 className="text-2xl font-black text-gray-900">Vos réservations en attente</h2>
              </div>
              <p className="text-gray-700 text-sm">Ces réservations sont en cours de traitement. L'administrateur les validera dans les plus brefs délais.</p>
            </div>

            <div className="space-y-6">
              {pendingOrders.map((order, index) => {
                const statusMap = {
                  'en_attente': { label: 'EN ATTENTE DE VALIDATION', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', icon: <FaClock /> },
                  'validee': { label: 'VALIDÉE', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', icon: <FaCheckCircle /> },
                  'rejetee': { label: 'REJETÉE', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', icon: <FaTimesCircle /> }
                };
                const statusInfo = statusMap[order.status] || statusMap['en_attente'];
                
                return (
                <div key={index} className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${statusInfo.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`${statusInfo.bg} ${statusInfo.text} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Réservée le {new Date(order.timestamp).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const updatedOrders = pendingOrders.filter((_, i) => i !== index);
                        setPendingOrders(updatedOrders);
                        localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Véhicules */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        🚗 Véhicule{(order.vehicles || []).length > 1 ? 's' : ''}
                      </h3>
                      <div className="space-y-2">
                        {(order.vehicles || []).map((vehicle, vIdx) => (
                          <div key={vIdx} className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-semibold text-gray-900">{vehicle.brand} {vehicle.model || vehicle.name}</p>
                            <p className="text-sm text-gray-600">{vehicle.price?.toLocaleString()} FCFA/mois</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Informations de réservation */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        📅 Période de location
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        {order.reservation?.startDate && order.reservation?.endDate ? (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Du:</span>
                              <span className="font-semibold">{new Date(order.reservation.startDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Au:</span>
                              <span className="font-semibold">{new Date(order.reservation.endDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Durée:</span>
                              <span className="font-semibold">{order.reservation.duration || 1} jour{(order.reservation.duration || 1) > 1 ? 's' : ''}</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Informations de réservation non disponibles
                          </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span className="text-gray-900 font-bold">Total:</span>
                          <span className="font-black text-orange-600">{(order.reservation?.totalPrice || order.totalPrice || 0).toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className="mt-4 pt-4 border-t">
                    {order.shipping ? (
                      <>
                        <p className="text-sm text-gray-600">
                          <strong>Contact:</strong> {order.shipping.firstName || order.userName || 'N/A'} {order.shipping.lastName || ''} • {order.shipping.email || order.userEmail || 'N/A'} • {order.shipping.phone || order.userPhone || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Adresse:</strong> {order.shipping.address || order.address || 'Non spécifiée'}{order.shipping.city ? `, ${order.shipping.city}` : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          <strong>Contact:</strong> {order.userName || 'N/A'} • {order.userEmail || 'N/A'} • {order.userPhone || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Adresse:</strong> {order.address || 'Non spécifiée'}
                        </p>
                      </>
                    )}
                  </div>

                  {order.status === 'en_attente' && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm flex items-center gap-2">
                        <FaClock />
                        <span><strong>Statut:</strong> Cette réservation sera automatiquement envoyée au serveur dès qu'il sera disponible. Un administrateur la validera ensuite.</span>
                      </p>
                    </div>
                  )}
                  
                  {order.status === 'validee' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm flex items-center gap-2">
                        <FaCheckCircle />
                        <span><strong>Félicitations !</strong> Votre réservation a été validée par l'administrateur. Vous recevrez prochainement les détails par email.</span>
                      </p>
                    </div>
                  )}
                  
                  {order.status === 'rejetee' && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm flex items-center gap-2">
                        <FaBan />
                        <span><strong>Désolé,</strong> votre réservation a été rejetée. Veuillez contacter le service client pour plus d'informations.</span>
                      </p>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;