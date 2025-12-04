import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const StateManager = () => {
  const { user, fetchUser } = useAuth();
  const { refreshCart } = useCart();

  useEffect(() => {
    const handleAuthChange = (e) => {
      try {
        console.log('🔄 Auth change détecté:', e.detail);
        // Refresh cart when auth changes
        if (refreshCart && typeof refreshCart === 'function') {
          setTimeout(() => {
            refreshCart();
          }, 200);
        }
      } catch (error) {
        console.warn('Erreur dans handleAuthChange:', error);
      }
    };

    const handleUserChange = () => {
      try {
        console.log('🔄 User change détecté');
        // Refresh cart when user changes
        if (refreshCart && typeof refreshCart === 'function') {
          setTimeout(() => {
            refreshCart();
          }, 200);
        }
      } catch (error) {
        console.warn('Erreur dans handleUserChange:', error);
      }
    };

    const handleStorageChange = (e) => {
      try {
        console.log('🔄 Storage change détecté:', e.key);
        if (e.key === 'token' || e.key === 'user') {
          // Force refresh of auth and cart
          setTimeout(() => {
            if (fetchUser && typeof fetchUser === 'function') fetchUser();
            if (refreshCart && typeof refreshCart === 'function') refreshCart();
          }, 200);
        }
      } catch (error) {
        console.warn('Erreur dans handleStorageChange:', error);
      }
    };

    const handleVisibilityChange = () => {
      try {
        if (!document.hidden) {
          console.log('🔄 Page visible - refresh state');
          // Refresh when page becomes visible again
          setTimeout(() => {
            // Ne pas appeler fetchUser car la route n'existe pas sur le backend
            if (refreshCart && typeof refreshCart === 'function') refreshCart();
          }, 200);
        }
      } catch (error) {
        console.warn('Erreur dans handleVisibilityChange:', error);
      }
    };

    // Listen to various events
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('user-changed', handleUserChange);
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh on focus (mais limité à une fois toutes les 5 minutes)
    let lastFocusRefresh = 0;
    const REFRESH_COOLDOWN = 5 * 60 * 1000; // 5 minutes
    
    const handleFocus = () => {
      try {
        const now = Date.now();
        if (now - lastFocusRefresh < REFRESH_COOLDOWN) {
          // Trop tôt pour refresh, on skip
          return;
        }
        
        lastFocusRefresh = now;
        console.log('🔄 Window focus - refresh state');
        setTimeout(() => {
          // Ne pas appeler fetchUser car la route n'existe pas sur le backend
          // L'utilisateur est déjà chargé depuis le localStorage
          if (refreshCart && typeof refreshCart === 'function') refreshCart();
        }, 100);
      } catch (error) {
        console.warn('Erreur dans handleFocus:', error);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('user-changed', handleUserChange);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshCart, fetchUser]);

  return null; // Ce composant ne rend rien, il gère juste les événements
};

export default StateManager;