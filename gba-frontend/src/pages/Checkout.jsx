import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { notifyAdminNewOrder } from '../services/emailService';
import axios from 'axios';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../config/stripe';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaCreditCard, FaLock, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

// Composant interne qui contient toute la logique du formulaire
const CheckoutForm = ({ stripe, elements, isStripeEnabled }) => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fonction Toast pour notifications visuelles
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } transform transition-all duration-300`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const [formData, setFormData] = useState(() => {
    const getUserName = () => {
      if (!user) return '';
      if (user.name) return user.name;
      if (user.fullName) return user.fullName;
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      return `${firstName} ${lastName}`.trim();
    };
    
    return {
      fullName: getUserName(),
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      startDate: '',
      endDate: '',
      notes: '',
      acceptTerms: false
    };
  });

  const selectedVehicle = React.useMemo(() => {
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return null;
    }
    return cartItems[0] || null;
  }, [cartItems]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const isEmailValid = (email) => {
    return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getDurationDays = () => {
    try {
      if (!formData.startDate || !formData.endDate) return 0;
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
      
      const diffTime = Math.abs(end - start);
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(days, 1);
    } catch (error) {
      console.warn('Erreur calcul durée:', error);
      return 0;
    }
  };

  const calculatePrice = () => {
    try {
      const duration = getDurationDays();
      console.log('🔢 Calcul prix - Duration:', duration, 'Vehicle:', selectedVehicle);
      
      if (!selectedVehicle) {
        console.warn('❌ Aucun véhicule sélectionné pour le calcul');
        return 0;
      }
      
      if (duration === 0) {
        console.warn('❌ Durée de location = 0 jours');
        console.log('📅 Dates actuelles:', { start: formData.startDate, end: formData.endDate });
        return 0;
      }
      
      const price = selectedVehicle.price || selectedVehicle.pricePerDay || 89000;
      const total = duration * price;
      console.log('💰 Calcul prix final:', { duration, pricePerDay: price, total });
      return total;
    } catch (error) {
      console.error('❌ Erreur calcul prix:', error);
      return 0;
    }
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      setError('❌ Veuillez entrer votre nom complet');
      return false;
    }
    if (formData.fullName.trim().length < 3) {
      setError('❌ Le nom doit contenir au moins 3 caractères');
      return false;
    }
    if (!isEmailValid(formData.email)) {
      setError('❌ Veuillez entrer une adresse email valide (ex: nom@email.com)');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('❌ Veuillez entrer votre numéro de téléphone');
      return false;
    }
    // Validation du format du téléphone (minimum 8 chiffres)
    const phoneRegex = /^[\d\s\+\-\(\)]{8,}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError('❌ Numéro de téléphone invalide (minimum 8 chiffres, ex: +225 XX XX XX XX)');
      return false;
    }
    if (!formData.address.trim()) {
      setError('❌ Veuillez entrer votre adresse complète');
      return false;
    }
    if (formData.address.trim().length < 10) {
      setError('❌ L\'adresse doit être complète (minimum 10 caractères)');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.startDate) {
      setError('❌ Veuillez sélectionner une date de début de location');
      return false;
    }
    if (!formData.endDate) {
      setError('❌ Veuillez sélectionner une date de fin de location');
      return false;
    }
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Vérifier que la date de début n'est pas dans le passé
    if (start < today) {
      setError('❌ La date de début ne peut pas être dans le passé');
      return false;
    }
    
    if (end <= start) {
      setError('❌ La date de fin doit être après la date de début');
      return false;
    }
    
    return true;
  };

  const validateStep3 = () => {
    if (!formData.acceptTerms) {
      setError('❌ Vous devez accepter les conditions générales pour continuer');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setError('');
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Validation complète des 3 étapes
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }
    
    if (!validateStep3()) {
      setError('Vous devez accepter les conditions générales pour continuer');
      // Faire défiler vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    let paymentMethodId = null;

    // On tente le paiement Stripe seulement si activé ET chargé
    if (isStripeEnabled && stripe && elements) {
        const cardElement = elements.getElement(CardElement);
        if (cardElement) {
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: {
                    line1: formData.address,
                },
                },
            });

            if (stripeError) {
                setError(stripeError.message);
                return;
            }
            paymentMethodId = paymentMethod.id;
        }
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!selectedVehicle) {
        throw new Error('Aucun véhicule sélectionné');
      }
      
      const duration = getDurationDays();
      const totalPrice = calculatePrice();
      
      // Générer un ID de commande unique
      const orderId = `GBA-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      console.log('📊 Données commande avant envoi:', {
        vehicle: selectedVehicle?.brand + ' ' + selectedVehicle?.model,
        duration,
        totalPrice,
        dates: { start: formData.startDate, end: formData.endDate }
      });
      
      if (totalPrice === 0) {
        throw new Error('Le prix total ne peut pas être 0. Vérifiez les dates de location.');
      }
      
      const orderData = {
        orderId: orderId,
        vehicle: selectedVehicle,
        userId: user?.id || user?._id || 'anonymous',
        userName: formData.fullName,
        userEmail: formData.email,
        userPhone: formData.phone,
        address: formData.address,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: duration,
        totalPrice: totalPrice,
        pricePerDay: selectedVehicle.price || 89000,
        notes: formData.notes || '',
        status: 'en_attente',
        createdAt: new Date().toISOString(),
        paymentMethodId: paymentMethodId,
        paymentStatus: paymentMethodId ? 'authorized' : 'pending_offline'
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token') || '';
      
      try {
        await axios.post(`${apiUrl}/api/orders`, orderData, {
          headers: { 
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        setSuccess(`✅ Réservation envoyée avec succès ! Redirection...`);
        
        // Envoyer une notification à l'admin
        try {
          const emailData = {
            orderId: orderId,
            userName: formData.fullName,
            userEmail: formData.email,
            userPhone: formData.phone,
            vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year || new Date().getFullYear()}`,
            startDate: formData.startDate,
            endDate: formData.endDate,
            totalPrice: totalPrice
          };
          
          await notifyAdminNewOrder(emailData);
          showToast('✅ Réservation confirmée ! Contactez-nous au 0503713115', 'success');
        } catch (emailError) {
          console.error('Erreur notification admin:', emailError);
          showToast('✅ Réservation enregistrée ! Contactez-nous au 0503713115', 'success');
        }
        
      } catch (apiError) {
        console.warn('Erreur API, sauvegarde locale...', apiError);
        
        // Fallback localStorage
        const localOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        const localOrderData = {
          ...orderData,
          id: Date.now(),
          savedLocally: true,
          syncError: apiError.message
        };
        
        localOrders.push(localOrderData);
        localStorage.setItem('pendingOrders', JSON.stringify(localOrders));
        
        setSuccess(`✅ Réservation enregistrée avec succès ! Redirection...`);
        
        // Envoyer une notification à l'admin même en mode local
        try {
          const emailData = {
            orderId: orderId,
            userName: formData.fullName,
            userEmail: formData.email,
            userPhone: formData.phone,
            vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year || new Date().getFullYear()}`,
            startDate: formData.startDate,
            endDate: formData.endDate,
            totalPrice: totalPrice
          };
          
          await notifyAdminNewOrder(emailData);
          showToast('✅ Réservation confirmée ! Contactez-nous au 0503713115', 'success');
        } catch (emailError) {
          console.error('Erreur notification admin:', emailError);
          showToast('✅ Réservation enregistrée ! Contactez-nous au 0503713115', 'success');
        }
      }
      
      // Déclencher un événement pour informer les autres pages (ce qui activera les notifications)
      window.dispatchEvent(new CustomEvent('newOrder', { 
        detail: { 
          order: {
            ...orderData,
            vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model}`
          } 
        } 
      }));
      
      setTimeout(() => {
        clearCart();
        navigate('/client/orders', { replace: true, state: { orderSuccess: true, refresh: true } });
      }, 2000);
      
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError(`Erreur: ${err.message || 'Impossible de traiter votre commande'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connexion requise</h2>
          <p className="text-gray-600 mb-6">Veuillez vous connecter pour finaliser votre réservation.</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCreditCard className="text-gray-400 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Panier vide</h2>
          <p className="text-gray-600 mb-6">Votre panier est vide. Découvrez nos véhicules disponibles.</p>
          <button 
            onClick={() => navigate('/vehicles')}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Voir les véhicules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8" translate="no">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Finaliser votre réservation
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Plus que quelques étapes pour prendre la route
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${currentStep >= step ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300 text-gray-500'}
                  font-bold transition-colors duration-200`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-4 rounded 
                    ${currentStep > step ? 'bg-red-600' : 'bg-gray-200'}
                    transition-colors duration-200`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 gap-20 text-sm font-medium text-gray-500">
            <span className={currentStep >= 1 ? 'text-red-600' : ''}>Informations</span>
            <span className={currentStep >= 2 ? 'text-red-600' : ''}>Dates</span>
            <span className={currentStep >= 3 ? 'text-red-600' : ''}>Paiement</span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Formulaire (Gauche) */}
          <div className="lg:col-span-7">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaCheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <div className="p-8">
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Vos coordonnées</h2>
                    
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          📧 Vous recevrez la confirmation à cette adresse
                        </p>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPhone className="text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                            placeholder="+225 07 12 34 56 78"
                            required
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          📞 Format : +225 XX XX XX XX XX ou 07 12 34 56 78
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                            <FaMapMarkerAlt className="text-gray-400" />
                          </div>
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            rows={3}
                            className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                            placeholder="Cocody, Abidjan"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Détails de la réservation</h2>
                    
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendarAlt className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={formData.startDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                            required
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          📅 À partir d'aujourd'hui
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendarAlt className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={formData.endDate}
                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                            required
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          📅 Date de retour du véhicule
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          rows={3}
                          className="focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4"
                          placeholder="Demandes spéciales..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Paiement sécurisé</h2>
                    
                    {/* Message d'aide pour le paiement */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">💳</div>
                        <div>
                          <h4 className="font-bold text-blue-900 mb-1">Comment payer ?</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Entrez les informations de votre carte bancaire ci-dessous</li>
                            <li>• Le format accepté : <strong>Numéro (16 chiffres)</strong>, <strong>Date d'expiration (MM/AA)</strong>, <strong>CVC (3 chiffres au dos)</strong></li>
                            <li>• Acceptez les conditions générales</li>
                            <li>• Cliquez sur "Confirmer la réservation"</li>
                          </ul>
                          <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                            <FaLock /> <strong>100% sécurisé</strong> - Vos données sont cryptées
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Informations de la carte</h3>
                        <div className="flex space-x-2">
                          <FaCreditCard className="text-gray-400 text-xl" />
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-gray-300">
                        {stripe && elements ? (
                          <CardElement options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: '#424770',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                '::placeholder': {
                                  color: '#aab7c4',
                                },
                              },
                              invalid: {
                                color: '#9e2146',
                              },
                            },
                          }} />
                        ) : (
                          <div className="py-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                            <p className="text-gray-600 text-sm">Chargement...</p>
                          </div>
                        )}
                      </div>
                      
                      <p className="mt-2 text-xs text-gray-500 flex items-center">
                        <FaLock className="mr-1" /> Paiement sécurisé. Vos données sont protégées.
                      </p>
                    </div>

                    {/* Checkbox des conditions - AMÉLIORÉE */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={formData.acceptTerms}
                          onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                          className="mt-1 focus:ring-red-500 h-5 w-5 text-red-600 border-gray-300 rounded cursor-pointer"
                          required
                        />
                        <label htmlFor="terms" className="flex-1 cursor-pointer">
                          <span className="font-bold text-gray-900 text-base">
                            J'accepte les conditions générales de location *
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            En cochant cette case, vous acceptez nos conditions de location et confirmez avoir lu nos politiques.
                          </p>
                        </label>
                      </div>
                      
                      {!formData.acceptTerms && error && (
                        <div className="mt-3 text-sm text-red-600 font-medium flex items-center gap-2">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Vous devez accepter les conditions pour continuer
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaArrowLeft className="mr-2" /> Retour
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Suivant <FaArrowRight className="ml-2" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    disabled={loading || !formData.acceptTerms}
                    className={`flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white transition-all duration-300 ${
                      loading || !formData.acceptTerms 
                        ? 'bg-gray-400 cursor-not-allowed opacity-75' 
                        : 'bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }`}
                    title={!formData.acceptTerms ? 'Veuillez accepter les conditions générales' : ''}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement en cours...
                      </>
                    ) : !formData.acceptTerms ? (
                      <>
                        <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Acceptez les conditions
                      </>
                    ) : (
                      <>
                        Confirmer et payer <FaCheckCircle className="ml-2" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Résumé (Droite) - CORRIGÉ */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 sticky top-24">
              <div className="p-6 bg-gray-900 text-white">
                <h3 className="text-lg font-bold">Récapitulatif</h3>
              </div>
              
              <div className="p-6">
                {selectedVehicle && (
                  <div className="flex items-start space-x-4 mb-6">
                    <img 
                      src={selectedVehicle.image || selectedVehicle.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'} 
                      alt={selectedVehicle.brand} 
                      className="w-24 h-16 object-cover rounded-lg bg-gray-100"
                      onError={(e) => {
                        e.target.src = '/placeholder-car.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{selectedVehicle.brand} {selectedVehicle.model}</h4>
                      <p className="text-sm text-gray-500">{selectedVehicle.type || selectedVehicle.fuelType}</p>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prix par jour</span>
                    <span className="font-medium text-gray-900">
                      {(selectedVehicle?.price || 89000).toLocaleString()} FCFA
                    </span>
                  </div>
                  
                  {formData.startDate && formData.endDate && getDurationDays() > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Période</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(formData.startDate)} - {formatDate(formData.endDate)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Durée</span>
                        <span className="font-medium text-gray-900">{getDurationDays()} jour{getDurationDays() > 1 ? 's' : ''}</span>
                      </div>
                    </>
                  )}

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      {getDurationDays() > 0 ? (
                        <>
                          <span className="text-xl font-bold text-red-600">
                            {calculatePrice().toLocaleString()} FCFA
                          </span>
                          <p className="text-xs text-gray-500">
                            {(selectedVehicle?.price || 89000).toLocaleString()} × {getDurationDays()} jour{getDurationDays() > 1 ? 's' : ''}
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-xl font-bold text-red-600">
                            {(selectedVehicle?.price || 89000).toLocaleString()} FCFA
                          </span>
                          <p className="text-xs text-gray-500">
                            Prix par jour (sélectionnez les dates)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    En cliquant sur "Confirmer", vous acceptez nos conditions générales de location. Une caution pourra être demandée lors de la récupération du véhicule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper pour extraire les hooks quand on est dans le contexte Elements
const StripeCheckoutWrapper = () => {
  const stripe = useStripe();
  const elements = useElements();
  return <CheckoutForm stripe={stripe} elements={elements} isStripeEnabled={true} />;
};

const Checkout = () => {
  // Toujours wrapper dans Elements même si stripePromise est null
  // Cela permet au CardElement de s'afficher correctement
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutWrapper />
    </Elements>
  );
};

export default Checkout;