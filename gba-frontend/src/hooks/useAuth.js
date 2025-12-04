import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  if (context === null) {
    console.warn('AuthContext est null - vérifiez que le composant est bien dans un AuthProvider');
    return {
      user: null,
      login: () => Promise.resolve({ success: false, message: 'Service non disponible' }),
      register: () => Promise.resolve({ success: false, message: 'Service non disponible' }),
      logout: () => {},
      updateUser: () => {},
      fetchUser: () => {},
      loading: false,
      isAuthenticated: false,
      isAdmin: false
    };
  }
  return context;
};