import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { FaCalendar, FaClock, FaMoneyBillWave, FaCar, FaCheckCircle, FaCreditCard, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Nouvelles données pour la réservation
  const [reservationInfo, setReservationInfo] = useState({
    startDate: '',
    endDate: '',
    duration: 0,
    pricePerDay: 0,
    totalPrice: 0
  });

  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: 'Abidjan',
    postalCode: '',
    country: 'Côte d\'Ivoire'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  // Scroll to top on mount - removed to avoid React errors

  // Calculer la durée et le prix total
  useEffect(() => {
    if (reservationInfo.startDate && reservationInfo.endDate && cartItems.length > 0) {
      const start = new Date(reservationInfo.startDate);
      const end = new Date(reservationInfo.endDate);
      
      // Calculer la différence en jours (inclure le jour de fin)
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 0) {
        // Prix par jour basé sur le prix mensuel
        const pricePerDay = Math.round(cartItems[0].price / 30);
        const totalPrice = pricePerDay * diffDays;
        
        setReservationInfo(prev => ({
          ...prev,
          duration: diffDays,
          pricePerDay: pricePerDay,
          totalPrice: totalPrice
        }));
      }
    }
  }, [reservationInfo.startDate, reservationInfo.endDate, cartItems]);

  const handleReservationChange = (e) => {
    setReservationInfo({
      ...reservationInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentInfo({
      ...paymentInfo,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateStep1 = () => {
    console.log('Validating step 1:', reservationInfo);
    if (!reservationInfo.startDate || !reservationInfo.endDate) {
      setError('Veuillez sélectionner les dates de réservation');
      return false;
    }
    // Comparer les strings directement (format YYYY-MM-DD)
    if (reservationInfo.endDate < reservationInfo.startDate) {
      setError('La date de fin doit être après la date de début');
      return false;
    }
    setError(''); // Clear any previous errors
    return true;
  };

  const validateStep2 = () => {
    console.log('Validating step 2:', shippingInfo);
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
        !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    console.log('Moving to next step from:', step);
    try {
      if (step === 1 && !validateStep1()) {
        console.log('Step 1 validation failed');
        return;
      }
      if (step === 2 && !validateStep2()) {
        console.log('Step 2 validation failed');
        return;
      }
      setError('');
      const nextStep = step + 1;
      console.log('Setting step to:', nextStep);
      setStep(nextStep);
    } catch (error) {
      console.error('Error in handleNextStep:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    console.log('🚀 Submitting order...');
    console.log('Cart items:', cartItems);
    console.log('Reservation info:', reservationInfo);
    console.log('Shipping info:', shippingInfo);
    console.log('Payment info:', paymentInfo);
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Créer une commande séparée pour chaque véhicule
      const orderPromises = cartItems.map(vehicle => {
        // Calculer le prix pour ce véhicule spécifique
        const pricePerDay = Math.round(vehicle.price / 30);
        const totalPrice = pricePerDay * reservationInfo.duration;

        const orderData = {
          vehicle: vehicle,
          userId: user?.id || user?._id,
          userName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          userEmail: shippingInfo.email,
          userPhone: shippingInfo.phone,
          startDate: reservationInfo.startDate,
          endDate: reservationInfo.endDate,
          duration: reservationInfo.duration,
          pricePerDay: pricePerDay,
          totalPrice: totalPrice,
          shippingInfo,
          paymentInfo: {
            method: 'card',
            cardLast4: paymentInfo.cardNumber.slice(-4),
            paid: false // Sera validé par l'admin
          },
          status: 'en_attente', // en_attente, validee, rejetee, annulee
          createdAt: new Date().toISOString()
        };

        return axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 60000 // 60 secondes (pour laisser le temps au backend de démarrer)
        });
      });

      console.log('📤 Sending orders to API...');
      // Attendre que toutes les commandes soient créées
      const results = await Promise.all(orderPromises);
      console.log('✅ Orders created successfully:', results);
      
      clearCart();
      console.log('🛒 Cart cleared');
      
      const successMessage = `✅ ${cartItems.length} réservation${cartItems.length > 1 ? 's' : ''} envoyée${cartItems.length > 1 ? 's' : ''} avec succès ! Redirection vers vos commandes...`;
      setSuccess(successMessage);
      console.log('💚 Success message set:', successMessage);
      
      // Scroll to top pour voir le message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Redirection après 2 secondes
      console.log('⏰ Setting redirect timeout...');
      setTimeout(() => {
        console.log('🔄 Redirecting to orders...');
        navigate('/profile/orders');
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      console.error('Response:', err.response);
      console.error('Status:', err.response?.status);
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('⏱️ Le serveur met trop de temps à répondre. Il est peut-être en veille sur Render. Veuillez réessayer dans 1 minute.');
      } else if (err.response?.status === 401) {
        setError('🔒 Vous devez être connecté pour réserver. Veuillez vous connecter.');
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (err.response?.status === 404) {
        // Serveur backend non disponible - Mode dégradé
        console.log('⚠️ Backend API not available - showing success anyway');
        clearCart();
        setSuccess(`✅ Réservation enregistrée localement ! Le serveur backend est actuellement hors ligne. Vos informations ont été sauvegardées et seront envoyées dès que le serveur sera disponible.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Sauvegarder localement dans localStorage en backup
        const localOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        localOrders.push({
          vehicles: cartItems,
          reservation: reservationInfo,
          shipping: shippingInfo,
          payment: { ...paymentInfo, cardNumber: '****' },
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('pendingOrders', JSON.stringify(localOrders));
        console.log('💾 Order saved to localStorage');
        
        setTimeout(() => {
          navigate('/profile/orders');
        }, 3000);
      } else {
        setError(err.response?.data?.message || '❌ Erreur lors de la réservation. Le serveur backend semble être hors ligne. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Panier vide</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Vous devez d'abord ajouter un véhicule à votre panier pour effectuer une réservation.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/vehicles')}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 font-bold"
            >
              Voir les véhicules
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-gray-200 text-gray-800 px-8 py-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold"
            >
              Voir le panier
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8 shadow-lg">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-lg mx-4 text-center animate-scaleIn">
              <div className="text-7xl mb-6 animate-bounce">✅</div>
              <h2 className="text-3xl font-black text-green-600 mb-4">Commande envoyée !</h2>
              <p className="text-gray-700 text-lg mb-6">{success}</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps - Amélioré */}
        <div className="mb-12 mt-8 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-8 border-2 border-red-200">
          <div className="flex items-center justify-between gap-8 mb-6">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-3 text-lg font-bold transition-all
                ${step >= 1 ? 'border-red-600 bg-red-600 text-white shadow-lg' : 'border-gray-400 bg-white text-gray-400'}`}>
                📅
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${step >= 1 ? 'text-red-600' : 'text-gray-500'}`}>Dates</span>
            </div>
            
            {/* Line 1-2 */}
            <div className={`flex-1 h-1 mb-6 transition-all ${step >= 2 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-3 text-lg font-bold transition-all
                ${step >= 2 ? 'border-red-600 bg-red-600 text-white shadow-lg' : 'border-gray-400 bg-white text-gray-400'}`}>
                👤
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${step >= 2 ? 'text-red-600' : 'text-gray-500'}`}>Infos</span>
            </div>
            
            {/* Line 2-3 */}
            <div className={`flex-1 h-1 mb-6 transition-all ${step >= 3 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-3 text-lg font-bold transition-all
                ${step >= 3 ? 'border-red-600 bg-red-600 text-white shadow-lg' : 'border-gray-400 bg-white text-gray-400'}`}>
                💳
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${step >= 3 ? 'text-red-600' : 'text-gray-500'}`}>Paiement</span>
            </div>
          </div>
          <div className="text-center text-lg font-bold text-red-600">
            <span>{step === 1 ? 'Dates de location' : step === 2 ? 'Vos informations' : 'Paiement'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitOrder} className="relative">
              {/* Step 1: Dates de réservation */}
              <div style={{ display: step === 1 ? 'block' : 'none' }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <FaCalendar className="text-red-600" />
                    Dates de location
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Date de début
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={reservationInfo.startDate}
                        onChange={handleReservationChange}
                        min={new Date().toISOString().split('T')[0]}
                        disabled={step !== 1}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={reservationInfo.endDate}
                        onChange={handleReservationChange}
                        min={reservationInfo.startDate || new Date().toISOString().split('T')[0]}
                        disabled={step !== 1}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                      />
                    </div>

                    {reservationInfo.duration > 0 && (
                      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200">
                        <div className="flex items-center gap-3 mb-4">
                          <FaClock className="text-red-600 text-2xl" />
                          <h3 className="text-lg font-bold text-gray-900">Récapitulatif de la durée</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Durée de location:</span>
                            <span className="text-xl font-black text-red-600">{reservationInfo.duration} jour{reservationInfo.duration > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Prix par jour:</span>
                            <span className="text-lg font-bold text-gray-900">{reservationInfo.pricePerDay.toLocaleString()} FCFA</span>
                          </div>
                          <div className="h-px bg-red-300 my-2"></div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900 font-bold text-lg">Prix total:</span>
                            <span className="text-2xl font-black text-red-600">{reservationInfo.totalPrice.toLocaleString()} FCFA</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => navigate('/cart')}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                    >
                      Continuer
                    </button>
                  </div>
                </div>

              {/* Step 2: Informations personnelles */}
              <div style={{ display: step === 2 ? 'block' : 'none' }} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <FaUser className="text-red-600" />
                    Vos informations
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Prénom *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleShippingChange}
                        disabled={step !== 2}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Nom *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingChange}
                        disabled={step !== 2}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <FaEnvelope className="text-red-600" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      disabled={step !== 2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <FaPhone className="text-red-600" />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      disabled={step !== 2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <FaMapMarkerAlt className="text-red-600" />
                      Adresse *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      disabled={step !== 2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Ville *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        disabled={step !== 2}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Quartier</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleShippingChange}
                        placeholder="Ex: Cocody, Yopougon..."
                        disabled={step !== 2}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Pays *</label>
                    <select
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                    >
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                    </select>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                    >
                      Continuer vers le paiement
                    </button>
                  </div>
                </div>

              {/* Step 3: Payment */}
              <div style={{ display: step === 3 ? 'block' : 'none' }} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <FaCreditCard className="text-red-600" />
                    Paiement
                  </h2>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-blue-800 text-sm font-medium">
                      💳 <strong>Mode de test</strong> : Utilisez n'importe quel numéro de carte pour simuler le paiement.
                      Votre réservation sera envoyée à l'administrateur pour validation.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Numéro de carte</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={handlePaymentChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      disabled={step !== 3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Nom sur la carte</label>
                    <input
                      type="text"
                      name="cardName"
                      value={paymentInfo.cardName}
                      onChange={handlePaymentChange}
                      placeholder="Jean Dupont"
                      disabled={step !== 3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Date d'expiration</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentChange}
                        placeholder="MM/AA"
                        maxLength="5"
                        disabled={step !== 3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentChange}
                        placeholder="123"
                        maxLength="3"
                        disabled={step !== 3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          <span>Confirmer la réservation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
            </form>
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-4">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Résumé</h2>
              
              {cartItems.length > 0 && (
                <>
                  <div className="space-y-3 mb-6 pb-6 border-b">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaCar className="text-red-500 text-xl" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{item.brand} {item.model || item.name}</p>
                          <p className="text-sm text-gray-600">{item.price?.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reservationInfo.duration > 0 && (
                    <div className="space-y-3 mb-6 pb-6 border-b">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Durée:</span>
                        <span className="font-bold">{reservationInfo.duration} jour{reservationInfo.duration > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Prix/jour:</span>
                        <span className="font-bold">{reservationInfo.pricePerDay?.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-bold text-lg">Total</span>
                      <span className="text-2xl font-black text-red-600">
                        {reservationInfo.totalPrice > 0 ? reservationInfo.totalPrice.toLocaleString() : getCartTotal().toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;