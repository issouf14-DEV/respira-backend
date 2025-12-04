import { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <FaCheckCircle className="text-2xl" />,
    error: <FaTimesCircle className="text-2xl" />,
    warning: <FaExclamationTriangle className="text-2xl" />,
    info: <FaInfoCircle className="text-2xl" />
  };

  const colors = {
    success: 'from-green-500 to-green-600 border-green-400',
    error: 'from-red-500 to-red-600 border-red-400',
    warning: 'from-yellow-500 to-yellow-600 border-yellow-400',
    info: 'from-blue-500 to-blue-600 border-blue-400'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div className={`bg-gradient-to-r ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white min-w-[300px] max-w-md`}>
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className="font-semibold flex-1">{message}</p>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
