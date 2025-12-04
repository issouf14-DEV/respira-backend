import { useState, useEffect } from 'react';
import axios from 'axios';

export const useVehicles = (filters = {}) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchVehicles();
  }, [filters, pagination.page]);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await axios.get('/api/vehicles', { params });
      setVehicles(response.data.vehicles || response.data);
      
      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des véhicules');
      console.error('Erreur useVehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const setPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const refetch = () => {
    fetchVehicles();
  };

  return { 
    vehicles, 
    loading, 
    error, 
    pagination, 
    setPage, 
    refetch 
  };
};