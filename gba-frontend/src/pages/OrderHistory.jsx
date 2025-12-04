import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FaClock, FaCheckCircle, FaTimesCircle, FaBan, FaTruck, FaCalendarAlt, FaCar, FaFilePdf, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement de l\'historique des commandes...');
      
      // Récupérer l'utilisateur connecté
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserEmail = currentUser.email || '';
      const currentUserId = currentUser.id || currentUser._id || '';
      
      // Récupération depuis le localStorage
      const localOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      
      // Normaliser les commandes pour avoir un format cohérent
      const normalizeOrder = (order) => {
        return {
          id: order.id || order._id,
          vehicleName: order.vehicleName || order.vehicle?.name || 'Véhicule',
          startDate: order.startDate || order.reservation?.startDate,
          endDate: order.endDate || order.reservation?.endDate,
          totalPrice: order.totalPrice || order.reservation?.totalPrice || 0,
          status: order.status || 'en_attente',
          createdAt: order.createdAt || order.timestamp || new Date().toISOString(),
          validatedAt: order.validatedAt,
          completedAt: order.completedAt,
          userEmail: order.userEmail || order.shipping?.email || order.email,
          userId: order.userId || order.user?.id || order.user?._id
        };
      };

      // Filtrer les commandes pour l'utilisateur connecté uniquement
      const filterUserOrders = (orders) => {
        return orders.filter(order => {
          const orderEmail = order.userEmail || order.shipping?.email || order.email;
          const orderUserId = order.userId || order.user?.id || order.user?._id;
          return orderEmail === currentUserEmail || orderUserId === currentUserId;
        });
      };

      const allOrders = [
        ...filterUserOrders(localOrders).map(normalizeOrder),
        ...filterUserOrders(pendingOrders).map(normalizeOrder)
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log('✅ Commandes chargées:', allOrders.length);
      console.log('📦 Détails des commandes:', allOrders);
      setOrders(allOrders);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchOrdersSafe = async () => {
      if (isMounted) {
        await fetchOrders();
      }
    };
    
    fetchOrdersSafe();
    
    // Écouter les événements de mise à jour de commandes
    const handleOrderUpdate = () => {
      if (isMounted) {
        console.log('🔄 Événement de mise à jour reçu, rechargement...');
        fetchOrdersSafe();
      }
    };
    
    window.addEventListener('orderCreated', handleOrderUpdate);
    window.addEventListener('orderStatusChanged', handleOrderUpdate);
    
    return () => {
      isMounted = false;
      window.removeEventListener('orderCreated', handleOrderUpdate);
      window.removeEventListener('orderStatusChanged', handleOrderUpdate);
    };
  }, []);

  const getStatusInfo = (status) => {
    const statusMap = {
      en_attente: {
        label: 'En attente',
        icon: FaClock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        description: 'Votre commande est en cours de traitement'
      },
      validee: {
        label: 'Validée',
        icon: FaCheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100',
        description: 'Votre commande a été validée par l\'équipe'
      },
      validated: {
        label: 'Validée',
        icon: FaCheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100',
        description: 'Votre commande a été validée par l\'équipe'
      },
      in_progress: {
        label: 'En cours',
        icon: FaTruck,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        description: 'Votre véhicule est en cours de préparation'
      },
      completed: {
        label: 'Terminée',
        icon: FaCheckCircle,
        color: 'text-green-800',
        bg: 'bg-green-200',
        description: 'Location terminée avec succès'
      },
      cancelled: {
        label: 'Annulée',
        icon: FaTimesCircle,
        color: 'text-red-600',
        bg: 'bg-red-100',
        description: 'Cette commande a été annulée'
      },
      rejetee: {
        label: 'Rejetée',
        icon: FaBan,
        color: 'text-red-700',
        bg: 'bg-red-200',
        description: 'Cette commande a été rejetée'
      },
      rejected: {
        label: 'Refusée',
        icon: FaBan,
        color: 'text-red-700',
        bg: 'bg-red-200',
        description: 'Cette commande a été refusée'
      }
    };

    return statusMap[status] || statusMap.en_attente;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Date non disponible';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToPDF = async () => {
    if (!exportRef.current || orders.length === 0) return;
    
    setExporting(true);
    
    try {
      // Créer un élément temporaire pour le PDF
      const exportElement = document.createElement('div');
      exportElement.style.padding = '40px';
      exportElement.style.backgroundColor = 'white';
      exportElement.style.width = '210mm'; // A4 width
      
      // En-tête
      exportElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; font-size: 32px; font-weight: bold; margin-bottom: 10px;">
            LE-GBA - Historique des Commandes
          </h1>
          <p style="color: #666; font-size: 14px;">
            Généré le ${new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 5px;">
            Client: ${user?.email || 'Non renseigné'}
          </p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background: #f3f4f6; border-left: 4px solid #dc2626; border-radius: 8px;">
          <p style="font-weight: bold; font-size: 18px; color: #1f2937;">
            ${orders.length} commande${orders.length > 1 ? 's' : ''} au total
          </p>
        </div>
      `;
      
      // Ajouter chaque commande
      orders.forEach((order, index) => {
        const statusInfo = getStatusInfo(order.status);
        
        const orderHtml = `
          <div style="margin-bottom: 25px; padding: 20px; border: 2px solid #e5e7eb; border-radius: 12px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
              <div>
                <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">
                  🚗 ${order.vehicleName || order.vehicle?.name || 'Véhicule'}
                </h2>
                <p style="color: #6b7280; font-size: 12px;">
                  Commande #${order.id.toString().slice(-6)}
                </p>
              </div>
              <div style="padding: 8px 16px; background: ${statusInfo.bg.replace('bg-', '#')}; border-radius: 8px;">
                <span style="color: ${statusInfo.color.replace('text-', '#')}; font-weight: bold; font-size: 14px;">
                  ${statusInfo.label}
                </span>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <p style="color: #6b7280; font-size: 12px; margin-bottom: 3px;">📅 Période de location</p>
                <p style="font-weight: 600; font-size: 14px; color: #1f2937;">
                  ${formatDate(order.startDate)}
                </p>
                <p style="font-weight: 600; font-size: 14px; color: #1f2937;">
                  ${formatDate(order.endDate)}
                </p>
              </div>
              <div>
                <p style="color: #6b7280; font-size: 12px; margin-bottom: 3px;">💰 Prix total</p>
                <p style="font-weight: bold; font-size: 20px; color: #1f2937;">
                  ${(order.totalPrice || 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
            
            <div style="padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 11px;">
                Créée le ${formatDateTime(order.createdAt)}
              </p>
              ${order.validatedAt ? `
                <p style="color: #6b7280; font-size: 11px;">
                  Validée le ${formatDateTime(order.validatedAt)}
                </p>
              ` : ''}
              ${order.completedAt ? `
                <p style="color: #6b7280; font-size: 11px;">
                  Terminée le ${formatDateTime(order.completedAt)}
                </p>
              ` : ''}
            </div>
          </div>
        `;
        
        exportElement.innerHTML += orderHtml;
      });
      
      // Pied de page
      exportElement.innerHTML += `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 11px;">
          <p>LE-GBA - Location de véhicules de luxe</p>
          <p>📞 05 03 71 33 15 | 📧 contact@le-gba.com</p>
          <p style="margin-top: 10px;">Ce document a été généré automatiquement et constitue un récapitulatif de vos commandes.</p>
        </div>
      `;
      
      document.body.appendChild(exportElement);
      
      // Générer le canvas
      const canvas = await html2canvas(exportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Supprimer l'élément temporaire
      document.body.removeChild(exportElement);
      
      // Créer le PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297; // A4 height in mm
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Ajouter la première page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Télécharger le PDF
      const fileName = `historique-commandes-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Spacer pour éviter la navbar */}
      <div className="h-20"></div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">📋 Historique des commandes</h1>
              <p className="text-red-100">Suivez l'état de vos réservations en temps réel</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaClock className={`text-xl ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Chargement...' : 'Actualiser'}</span>
              </button>
              
              {orders.length > 0 && (
                <button
                  onClick={exportToPDF}
                  disabled={exporting}
                  className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      <span>Génération du PDF...</span>
                    </>
                  ) : (
                    <>
                      <FaFilePdf className="text-xl" />
                      <span>Exporter en PDF</span>
                      <FaDownload />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aucune commande trouvée</h2>
            <p className="text-gray-600 mb-8">Vous n'avez pas encore effectué de réservation</p>
            <a
              href="/vehicles"
              className="inline-block bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition font-semibold"
            >
              Découvrir nos véhicules
            </a>
          </div>
        ) : (
          <div className="space-y-6" ref={exportRef}>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {orders.length} commande{orders.length > 1 ? 's' : ''} trouvée{orders.length > 1 ? 's' : ''}
                  </h2>
                  <p className="text-gray-600">Voici l'historique complet de vos réservations</p>
                </div>
                
                <button
                  onClick={exportToPDF}
                  disabled={exporting}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Export en cours...</span>
                    </>
                  ) : (
                    <>
                      <FaFilePdf className="text-xl" />
                      <span>Télécharger en PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {orders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={order.id || index} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    
                    {/* Informations principales */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white text-xl">
                          <FaCar />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {order.vehicleName || order.vehicle?.name || 'Véhicule'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Commande #{order.id.toString().slice(-6)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <FaCalendarAlt className="text-red-500" />
                          <div>
                            <p className="text-sm text-gray-600">Période de location</p>
                            <p className="font-semibold">
                              {formatDate(order.startDate)} - {formatDate(order.endDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-red-500 text-lg">💰</div>
                          <div>
                            <p className="text-sm text-gray-600">Prix total</p>
                            <p className="font-bold text-xl text-gray-800">
                              {(order.totalPrice || 0).toLocaleString()}€
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status et actions */}
                    <div className="lg:text-right">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusInfo.bg} ${statusInfo.color} font-semibold mb-3`}>
                        <StatusIcon className="text-lg" />
                        <span>{statusInfo.label}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {statusInfo.description}
                      </p>

                      <div className="text-xs text-gray-500">
                        <p>Créée le {formatDateTime(order.createdAt)}</p>
                        {order.validatedAt && (
                          <p>Validée le {formatDateTime(order.validatedAt)}</p>
                        )}
                        {order.completedAt && (
                          <p>Terminée le {formatDateTime(order.completedAt)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline de progression */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        {/* Étape 1: Demandé */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`w-4 h-4 rounded-full ${
                            order.status !== 'cancelled' && order.status !== 'rejected' 
                              ? 'bg-green-500' 
                              : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs text-gray-600 mt-2 whitespace-nowrap">Demandé</span>
                        </div>
                        
                        {/* Ligne 1 */}
                        <div className={`flex-1 h-1 mx-2 ${
                          order.status === 'validee' || order.status === 'validated' || order.status === 'in_progress' || order.status === 'completed' 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}></div>
                        
                        {/* Étape 2: Validation */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`w-4 h-4 rounded-full ${
                            order.status === 'validee' || order.status === 'validated' || order.status === 'in_progress' || order.status === 'completed' 
                              ? 'bg-green-500' 
                              : order.status === 'en_attente' 
                                ? 'bg-yellow-500' 
                                : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs text-gray-600 mt-2 whitespace-nowrap">Validation</span>
                        </div>
                        
                        {/* Ligne 2 */}
                        <div className={`flex-1 h-1 mx-2 ${
                          order.status === 'en_cours' || order.status === 'in_progress' || order.status === 'completed' || order.status === 'terminee' 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}></div>
                        
                        {/* Étape 3: En cours */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`w-4 h-4 rounded-full ${
                            order.status === 'en_cours' || order.status === 'in_progress' || order.status === 'completed' || order.status === 'terminee'
                              ? 'bg-green-500' 
                              : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs text-gray-600 mt-2 whitespace-nowrap">En cours</span>
                        </div>
                        
                        {/* Ligne 3 */}
                        <div className={`flex-1 h-1 mx-2 ${
                          order.status === 'completed' || order.status === 'terminee'
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}></div>
                        
                        {/* Étape 4: Terminé */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`w-4 h-4 rounded-full ${
                            order.status === 'completed' || order.status === 'terminee'
                              ? 'bg-green-500' 
                              : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs text-gray-600 mt-2 whitespace-nowrap">Terminé</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;