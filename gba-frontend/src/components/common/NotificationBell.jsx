import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { FaBell, FaCheck, FaTrash, FaTimes } from 'react-icons/fa';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '🛒';
      case 'order_validated':
        return '✅';
      case 'order_rejected':
        return '❌';
      case 'order_pending':
        return '⏳';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order_validated':
        return 'bg-green-50 border-green-200';
      case 'order_rejected':
        return 'bg-red-50 border-red-200';
      case 'order_pending':
      case 'order':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-red-600 transition-colors"
        aria-label="Notifications"
      >
        <FaBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaBell className="text-red-600" />
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <FaCheck size={12} />
                  Tout marquer lu
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: '500px' }}>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBell size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Aucune notification</p>
                <p className="text-sm mt-1">Vous êtes à jour ! 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notif.read ? 'bg-blue-50' : ''
                    } ${getNotificationColor(notif.type)}`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-semibold ${
                            !notif.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notif.title}
                          </h4>
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notif.timestamp)}
                          </span>
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                              <FaCheck size={10} />
                              Marquer lu
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
