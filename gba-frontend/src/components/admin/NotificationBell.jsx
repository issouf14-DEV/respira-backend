import { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { FaBell } from 'react-icons/fa';

const NotificationBell = () => {
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <FaBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                {unreadCount} nouvelle(s)
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Aucune notification
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notif.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-medium ${!notif.read ? 'text-blue-900' : 'text-gray-900'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
