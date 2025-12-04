/**
 * Utilitaires pour la gestion centralisée des erreurs API
 */

export class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
    this.timestamp = new Date();
  }
}

/**
 * Messages d'erreur personnalisés par code HTTP
 */
export const ERROR_MESSAGES = {
  400: 'Requête invalide. Veuillez vérifier vos données.',
  401: 'Session expirée. Veuillez vous reconnecter.',
  403: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
  404: 'Ressource non trouvée.',
  408: 'Délai d\'attente dépassé. Le serveur est peut-être en veille.',
  409: 'Conflit. Cette ressource existe déjà.',
  422: 'Données invalides. Veuillez vérifier les champs du formulaire.',
  429: 'Trop de requêtes. Veuillez patienter.',
  500: 'Erreur serveur. Veuillez réessayer plus tard.',
  502: 'Serveur temporairement indisponible.',
  503: 'Service temporairement indisponible.',
  504: 'Le serveur met trop de temps à répondre.'
};

/**
 * Analyser et formater une erreur API
 */
export const parseAPIError = (error) => {
  // Erreur réseau
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
    return {
      type: 'network',
      message: '❌ Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      status: 0,
      canRetry: true
    };
  }

  // Erreur timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: 'timeout',
      message: '⏱️ Le serveur met trop de temps à répondre. Il est peut-être en veille sur Render. Veuillez patienter 30 secondes et réessayer.',
      status: 408,
      canRetry: true
    };
  }

  // Erreur HTTP avec réponse
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    return {
      type: 'http',
      message: data?.message || ERROR_MESSAGES[status] || 'Une erreur est survenue',
      status,
      data,
      canRetry: status >= 500
    };
  }

  // Erreur inconnue
  return {
    type: 'unknown',
    message: error.message || 'Une erreur inattendue s\'est produite',
    status: 0,
    canRetry: true
  };
};

/**
 * Hook pour gérer les erreurs avec retry automatique
 */
import { useState, useCallback } from 'react';

export const useAPIError = (maxRetries = 3) => {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = useCallback((err) => {
    const parsedError = parseAPIError(err);
    setError(parsedError);
    
    // Log pour débogage
    console.error('API Error:', {
      type: parsedError.type,
      message: parsedError.message,
      status: parsedError.status,
      originalError: err
    });

    return parsedError;
  }, []);

  const retry = useCallback(async (fn) => {
    if (retryCount >= maxRetries) {
      return null;
    }

    setRetryCount(prev => prev + 1);
    setError(null);

    try {
      const result = await fn();
      setRetryCount(0);
      return result;
    } catch (err) {
      return handleError(err);
    }
  }, [retryCount, maxRetries, handleError]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    error,
    retryCount,
    handleError,
    retry,
    clearError,
    canRetry: error?.canRetry && retryCount < maxRetries
  };
};

/**
 * Composant d'affichage d'erreur avec retry
 */
export const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
  if (!error) return null;

  const getIcon = () => {
    switch (error.type) {
      case 'network': return '🌐';
      case 'timeout': return '⏱️';
      case 'http': return '⚠️';
      default: return '❌';
    }
  };

  const getColor = () => {
    if (error.status >= 500) return 'bg-red-100 border-red-500 text-red-800';
    if (error.status === 401 || error.status === 403) return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    return 'bg-orange-100 border-orange-500 text-orange-800';
  };

  return (
    <div className={`${getColor()} border-l-4 p-4 rounded-lg mb-4 animate-slide-down`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getIcon()}</span>
        <div className="flex-1">
          <p className="font-semibold mb-1">{error.message}</p>
          {error.data?.details && (
            <p className="text-sm opacity-80">{error.data.details}</p>
          )}
        </div>
        <div className="flex gap-2">
          {error.canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-white rounded hover:bg-gray-100 transition text-sm font-semibold"
            >
              🔄 Réessayer
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-2 py-1 hover:opacity-70 transition text-lg"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Wrapper pour les requêtes API avec gestion d'erreur automatique
 */
export const withErrorHandling = async (fn, options = {}) => {
  const { onError, showToast = true, maxRetries = 1 } = options;
  
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const parsedError = parseAPIError(error);
      
      // Si c'est une erreur 401, rediriger vers login
      if (parsedError.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      // Si c'est le dernier essai, gérer l'erreur
      if (attempt === maxRetries) {
        if (onError) {
          onError(parsedError);
        }
        
        if (showToast && window.showToast) {
          window.showToast(parsedError.message, 'error');
        }
        
        throw parsedError;
      }
      
      // Attendre avant de réessayer (backoff exponentiel)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw lastError;
};
