import { useState, useEffect } from 'react';
import axios from 'axios';

export const useFetch = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(url);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des données');
        console.error('Erreur useFetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, ...dependencies]);

  const refetch = async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(url);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du rechargement');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};