import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Import des layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Import des pages publiques
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Cart from './pages/Cart';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Import des pages protégées
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import MyOrders from './pages/Client/MyOrders';
import OrderHistory from './pages/OrderHistory';

// Import des pages admin
import Dashboard from './pages/Admin/Dashboard';
import ManageVehicles from './pages/Admin/ManageVehicles';
import ManageOrders from './pages/Admin/ManageOrders';
import ManageUsers from './pages/Admin/ManageUsers';

// Composant de chargement
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="text-center">
      <div className="relative">
        <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-t-red-600 border-r-red-600 border-b-gray-700 border-l-gray-700 mb-6"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-800 opacity-20 animate-pulse"></div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">GBA</h2>
      <p className="text-gray-400 font-medium animate-pulse">Chargement en cours...</p>
    </div>
  </div>
);

// Composant de protection des routes
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  console.log('🔒 ProtectedRoute:', { isAuthenticated, isAdmin, loading, user });

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log('❌ Non authentifié, redirection vers /login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('❌ Non admin, redirection vers /');
    return <Navigate to="/" replace />;
  }

  console.log('✅ Accès autorisé');
  return children;
};

// Composant pour rediriger les utilisateurs connectés loin de login/register
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Composant Routes principal
const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques - Login et Register uniquement si non connecté */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Routes protégées avec MainLayout - Nécessitent connexion */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/orders" element={<MyOrders />} />
        <Route path="/client/orders" element={<MyOrders />} />
        <Route path="/order-history" element={<OrderHistory />} />
      </Route>

      {/* Routes admin avec AdminLayout */}
      <Route
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/vehicles" element={<ManageVehicles />} />
        <Route path="/admin/orders" element={<ManageOrders />} />
        <Route path="/admin/users" element={<ManageUsers />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;