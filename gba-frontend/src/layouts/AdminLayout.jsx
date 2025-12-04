import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import NotificationBell from '../components/admin/NotificationBell';
import { useNotifications } from '../context/NotificationContext';

const AdminLayout = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const handleNewOrder = (event) => {
      const order = event.detail?.order || {};
      const userName = order.userName || order.user?.name || 'Client';
      const vehicleName = order.vehicleName || order.vehicle?.brand || 'Véhicule';
      
      addNotification({
        title: 'Nouvelle commande',
        message: `Nouvelle commande de ${userName} pour ${vehicleName}`,
        type: 'info'
      });
    };

    window.addEventListener('newOrder', handleNewOrder);
    return () => window.removeEventListener('newOrder', handleNewOrder);
  }, [addNotification]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm py-4 px-6 flex justify-end items-center">
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
              A
            </div>
          </div>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;


