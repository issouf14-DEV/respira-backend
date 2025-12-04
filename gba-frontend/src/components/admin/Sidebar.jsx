import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Tableau de bord' },
    { path: '/admin/vehicles', icon: '🚗', label: 'Véhicules' },
    { path: '/admin/orders', icon: '📦', label: 'Commandes' },
    { path: '/admin/users', icon: '👥', label: 'Utilisateurs' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-700">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition"
        >
          <span className="text-2xl">🏠</span>
          <span>Retour au site</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;