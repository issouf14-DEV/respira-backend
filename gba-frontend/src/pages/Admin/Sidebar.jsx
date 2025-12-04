import { Link, useLocation } from "react-router-dom";
import { FaChartBar, FaBox, FaShoppingCart, FaUsers, FaTimes } from "react-icons/fa";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "bg-kia_red text-white" : "text-gray-700 hover:bg-gray-100";

  const menuItems = [
    { path: "/admin", label: "Tableau de bord", icon: <FaChartBar size={20} /> },
    { path: "/admin/vehicles", label: "Véhicules", icon: <FaBox size={20} /> },
    { path: "/admin/orders", label: "Commandes", icon: <FaShoppingCart size={20} /> },
    { path: "/admin/users", label: "Utilisateurs", icon: <FaUsers size={20} /> },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform z-50 md:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 flex justify-between items-center md:block">
          <h2 className="text-2xl font-bold text-kia_red">Admin</h2>
          <button className="md:hidden" onClick={onClose}>
            <FaTimes size={24} />
          </button>
        </div>

        <nav className="space-y-2 p-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive(
                item.path
              )}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}