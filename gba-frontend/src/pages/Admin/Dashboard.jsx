import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingCart, Car, DollarSign, Package, Eye } from 'lucide-react';
import { mockVehicles, mockUsers, mockOrders } from '../../utils/mockData';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialiser les données mock UNIQUEMENT si la clé n'existe pas du tout
    // Si la clé existe mais est vide [], c'est que l'admin a tout supprimé, donc on ne remet pas les mocks
    if (localStorage.getItem('vehicles') === null) {
      localStorage.setItem('vehicles', JSON.stringify(mockVehicles));
      console.log('✅ Véhicules mock initialisés');
    }
    if (localStorage.getItem('users') === null) {
      localStorage.setItem('users', JSON.stringify(mockUsers));
      console.log('✅ Utilisateurs mock initialisés');
    }
    // Pour les commandes, on ne remet JAMAIS les mocks automatiquement si la clé existe
    // Cela permet à "Nettoyer" de fonctionner durablement
    if (localStorage.getItem('pendingOrders') === null) {
      localStorage.setItem('pendingOrders', JSON.stringify(mockOrders));
      console.log('✅ Commandes mock initialisées');
    }
    
    fetchStats();

    // Écouter les nouvelles commandes pour mettre à jour le dashboard
    const handleNewOrder = () => {
      console.log('🔔 Nouvelle commande détectée, mise à jour du dashboard...');
      fetchStats();
    };
    window.addEventListener('newOrder', handleNewOrder);
    window.addEventListener('orderStatusUpdated', handleNewOrder);

    return () => {
      window.removeEventListener('newOrder', handleNewOrder);
      window.removeEventListener('orderStatusUpdated', handleNewOrder);
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des stats admin...');
      
      // Fallback: utiliser les données localStorage si l'API échoue
      let users = [];
      let orders = [];
      let vehicles = [];

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token manquant - utilisation des données locales');
        }

        // Récupérer les données depuis différents endpoints
        const [usersRes, ordersRes, vehiclesRes] = await Promise.allSettled([
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(r => r.json()),
          fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(r => r.json()),
          fetch(`${import.meta.env.VITE_API_URL}/api/vehicles`, {
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(r => r.json())
        ]);

        console.log('Users Response:', usersRes);
        console.log('Orders Response:', ordersRes);
        console.log('Vehicles Response:', vehiclesRes);

        // Extraire les données
        users = usersRes.status === 'fulfilled' ? usersRes.value : [];
        orders = ordersRes.status === 'fulfilled' ? ordersRes.value : [];
        const vehiclesData = vehiclesRes.status === 'fulfilled' ? vehiclesRes.value : [];
        
        // Vehicles peut être un objet ou un array
        vehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
      } catch (apiError) {
        console.warn('⚠️ API non disponible, utilisation des données localStorage:', apiError);
      }

      // Fallback vers localStorage si pas de données de l'API
      if (!Array.isArray(users) || users.length === 0) {
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        users = Array.isArray(localUsers) ? localUsers : [];
        console.log('📦 Utilisation des utilisateurs localStorage:', users.length, users);
      }

      if (!Array.isArray(orders) || orders.length === 0) {
        const localOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        orders = Array.isArray(localOrders) ? localOrders : [];
        console.log('📦 Utilisation des commandes localStorage:', orders.length, orders);
      }

      if (!Array.isArray(vehicles) || vehicles.length === 0) {
        const localVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
        vehicles = Array.isArray(localVehicles) ? localVehicles : [];
        console.log('📦 Utilisation des véhicules localStorage:', vehicles.length, vehicles);
      }

      console.log('📊 Données finales:');
      console.log('  - Users:', users.length, users);
      console.log('  - Orders:', orders.length, orders);
      console.log('  - Vehicles:', vehicles.length, vehicles);

      // Calculer les statistiques avancées
      const totalRevenue = Array.isArray(orders) 
        ? orders.reduce((sum, order) => sum + (order.totalPrice || order.total || 0), 0)
        : 0;

      // Stats par statut
      console.log('📊 Statuts des commandes:', orders.map(o => o.status));
      
      // Normaliser les statuts pour le graphique
      const normalizedOrders = orders.map(o => {
        let status = o.status;
        if (status === 'pending' || status === 'en_attente') return 'En attente';
        if (status === 'validated' || status === 'validee' || status === 'approved') return 'Validée';
        if (status === 'rejected' || status === 'rejetee' || status === 'cancelled') return 'Rejetée';
        if (status === 'completed' || status === 'terminee') return 'Terminée';
        return 'Autre';
      });

      const ordersByStatus = [
        { name: 'En attente', value: normalizedOrders.filter(s => s === 'En attente').length, color: '#FFA500' },
        { name: 'Validée', value: normalizedOrders.filter(s => s === 'Validée').length, color: '#10B981' },
        { name: 'Terminée', value: normalizedOrders.filter(s => s === 'Terminée').length, color: '#8B5CF6' },
        { name: 'Rejetée', value: normalizedOrders.filter(s => s === 'Rejetée').length, color: '#EF4444' }
      ].filter(item => item.value > 0);

      // Stats mensuelles (derniers 6 mois)
      const monthlyRevenue = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
        const monthOrders = Array.isArray(orders) 
          ? orders.filter(o => new Date(o.createdAt).getMonth() === date.getMonth())
          : [];
        
        monthlyRevenue.push({
          name: monthName,
          revenus: monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
          commandes: monthOrders.length
        });
      }

      // Véhicules les plus réservés
      const vehicleCounts = {};
      if (Array.isArray(orders)) {
        orders.forEach(order => {
          const vehicleName = `${order.vehicle?.brand} ${order.vehicle?.model}`;
          vehicleCounts[vehicleName] = (vehicleCounts[vehicleName] || 0) + 1;
        });
      }

      const topVehicles = Object.entries(vehicleCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      const calculatedStats = {
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalRevenue: totalRevenue,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
        recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : [],
        ordersByStatus,
        monthlyRevenue,
        topVehicles,
        pendingOrders: Array.isArray(orders) ? orders.filter(o => o.status === 'en_attente').length : 0
      };

      console.log('✅ Stats calculées:', calculatedStats);
      setStats(calculatedStats);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des stats:', err);
      console.error('Détails:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button 
            onClick={fetchStats}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Commandes totales',
      value: stats?.totalOrders || 0,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      trend: '+12%',
      link: '/admin/orders'
    },
    {
      title: 'Revenus totaux',
      value: `${(stats?.totalRevenue || 0).toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      trend: '+8.5%',
      link: null
    },
    {
      title: 'Utilisateurs',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      trend: '+23%',
      link: '/admin/users'
    },
    {
      title: 'Véhicules',
      value: stats?.totalVehicles || 0,
      icon: Car,
      color: 'from-orange-500 to-orange-600',
      trend: '+5%',
      link: '/admin/vehicles'
    }
  ];

  // Données pour les graphiques (simulation si pas de données du backend)
  const monthlyData = stats?.monthlyRevenue || [
    { name: 'Jan', revenus: 12000, commandes: 25 },
    { name: 'Fév', revenus: 19000, commandes: 38 },
    { name: 'Mar', revenus: 15000, commandes: 30 },
    { name: 'Avr', revenus: 22000, commandes: 45 },
    { name: 'Mai', revenus: 28000, commandes: 55 },
    { name: 'Jun', revenus: 32000, commandes: 62 },
  ];

  const statusData = stats?.ordersByStatus && stats.ordersByStatus.length > 0 
    ? stats.ordersByStatus 
    : [
        { name: 'Aucune commande', value: 1, color: '#D1D5DB' }
      ];

  const COLORS = ['#FFA500', '#10B981', '#3B82F6', '#8B5CF6'];

  const recentOrders = stats?.recentOrders || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white py-10 shadow-xl">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2">Tableau de Bord Admin</h1>
              <p className="text-gray-300 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Vue d'ensemble de votre activité
              </p>
            </div>
            <button 
              onClick={fetchStats}
              className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`bg-gradient-to-r ${stat.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    {stat.trend && (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                    {stat.link && (
                      <Link 
                        to={stat.link} 
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique Revenus Mensuels */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Revenus & Commandes Mensuels
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenus" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="commandes" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique Statut des Commandes */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              Répartition des Commandes
            </h3>
            {statusData.length > 0 && statusData[0].name !== 'Aucune commande' ? (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {statusData.map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow"
                      style={{ borderColor: item.color }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-black" style={{ color: item.color }}>
                          {item.value}
                        </span>
                        <span className="text-sm font-semibold text-gray-500">
                          {((item.value / statusData.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} commande(s)`, props.payload.name]}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Aucune commande pour le moment</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/vehicles"
            className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="p-8 relative z-10">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-black text-2xl mb-2">Ajouter un véhicule</h3>
              <p className="text-blue-100 text-sm">Créer une nouvelle annonce</p>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="p-8 relative z-10">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-black text-2xl mb-2">Gérer les commandes</h3>
              <p className="text-green-100 text-sm">Voir toutes les commandes</p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="p-8 relative z-10">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-black text-2xl mb-2">Gérer les utilisateurs</h3>
              <p className="text-purple-100 text-sm">Voir tous les utilisateurs</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              Commandes récentes
            </h2>
            <Link 
              to="/admin/orders" 
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              Voir tout
              <Eye className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Aucune commande récente
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, idx) => (
                    <tr key={order._id || order.id || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">#{order._id?.slice(-6) || order.id || idx}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.name || order.customerName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{order.user?.email || order.customerEmail || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        {(order.totalPrice || order.total || 0).toLocaleString()}€
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${order.status === 'delivered' || order.status === 'livrée' ? 'bg-green-100 text-green-800' : ''}
                          ${order.status === 'processing' || order.status === 'en cours' ? 'bg-blue-100 text-blue-800' : ''}
                          ${order.status === 'pending' || order.status === 'en attente' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${order.status === 'cancelled' || order.status === 'annulée' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {order.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;