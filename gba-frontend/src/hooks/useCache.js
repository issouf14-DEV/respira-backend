/**
 * Hook pour la gestion du cache des données
 */
import { useState, useEffect, useCallback, useRef } from 'react';

const cache = new Map();
const cacheTimestamps = new Map();
const pendingRequests = new Map();

export const useCache = (key, fetchFn, options = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes par défaut
    forceRefresh = false,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(() => {
    if (!forceRefresh && cache.has(key)) {
      const timestamp = cacheTimestamps.get(key);
      if (Date.now() - timestamp < ttl) {
        return cache.get(key);
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (force = false) => {
    // Vérifier le cache d'abord
    if (!force && !forceRefresh && cache.has(key)) {
      const timestamp = cacheTimestamps.get(key);
      if (Date.now() - timestamp < ttl) {
        const cachedData = cache.get(key);
        if (mountedRef.current) {
          setData(cachedData);
          setLoading(false);
        }
        return cachedData;
      }
    }

    // Si une requête est déjà en cours, attendre son résultat
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const promise = fetchFn();
      pendingRequests.set(key, promise);
      
      const result = await promise;
      
      // Mettre en cache
      cache.set(key, result);
      cacheTimestamps.set(key, Date.now());
      
      if (mountedRef.current) {
        setData(result);
        setLoading(false);
        onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
        onError?.(err);
      }
      throw err;
    } finally {
      pendingRequests.delete(key);
    }
  }, [key, fetchFn, ttl, forceRefresh, onSuccess, onError]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.delete(key);
    cacheTimestamps.delete(key);
  }, [key]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return { data, loading, error, refresh, invalidate };
};

/**
 * Fonction pour invalider le cache d'une clé spécifique
 */
export const invalidateCache = (key) => {
  cache.delete(key);
  cacheTimestamps.delete(key);
};

/**
 * Fonction pour invalider tout le cache
 */
export const clearAllCache = () => {
  cache.clear();
  cacheTimestamps.clear();
};

/**
 * Hook pour les requêtes API optimisées
 */
export const useOptimizedFetch = (url, options = {}) => {
  const {
    method = 'GET',
    body,
    headers = {},
    cache: shouldCache = true,
    ttl,
    dependencies = []
  } = options;

  const cacheKey = `${method}:${url}:${JSON.stringify(body)}`;

  const fetchFn = useCallback(async () => {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...headers
    };

    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      ...(body && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [url, method, body, headers]);

  return useCache(
    shouldCache ? cacheKey : `nocache:${Date.now()}`,
    fetchFn,
    { ttl, forceRefresh: !shouldCache }
  );
};

/**
 * Hook pour le debouncing (éviter les requêtes excessives)
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook pour le throttling (limiter la fréquence d'exécution)
 */
export const useThrottle = (callback, delay = 500) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};
