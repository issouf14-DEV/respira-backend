import { useState, useMemo, useCallback } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { useDebounce } from './useCache';

/**
 * Hook pour la recherche et le filtrage avancés
 */
export const useAdvancedFilter = (items, options = {}) => {
  const {
    searchFields = [],
    filterConfig = {},
    sortConfig = {}
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  // Debounce de la recherche
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrer et trier les items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Appliquer la recherche
    if (debouncedSearchTerm && searchFields.length > 0) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = getNestedValue(item, field);
          return value?.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    // Appliquer les filtres
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      const config = filterConfig[key];
      if (!config) return;

      if (config.type === 'select' || config.type === 'radio') {
        result = result.filter(item => getNestedValue(item, key) === value);
      } else if (config.type === 'multiselect' || config.type === 'checkbox') {
        result = result.filter(item => {
          const itemValue = getNestedValue(item, key);
          return Array.isArray(value) 
            ? value.includes(itemValue)
            : itemValue === value;
        });
      } else if (config.type === 'range') {
        result = result.filter(item => {
          const itemValue = getNestedValue(item, key);
          const numValue = parseFloat(itemValue);
          return numValue >= value.min && numValue <= value.max;
        });
      } else if (config.type === 'date') {
        result = result.filter(item => {
          const itemDate = new Date(getNestedValue(item, key));
          if (value.start && itemDate < new Date(value.start)) return false;
          if (value.end && itemDate > new Date(value.end)) return false;
          return true;
        });
      }
    });

    // Appliquer le tri
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sortBy);
        const bValue = getNestedValue(b, sortBy);

        // Gestion des différents types
        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [items, debouncedSearchTerm, filters, sortBy, sortOrder, searchFields, filterConfig]);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setSortBy(null);
    setSortOrder('asc');
  }, []);

  const toggleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key];
    return value && (!Array.isArray(value) || value.length > 0);
  }).length + (searchTerm ? 1 : 0);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    sortBy,
    sortOrder,
    toggleSort,
    filteredItems,
    activeFiltersCount,
    totalItems: items.length,
    filteredCount: filteredItems.length
  };
};

/**
 * Obtenir une valeur imbriquée d'un objet (ex: "user.name")
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Composant de barre de recherche
 */
export const SearchBar = ({ value, onChange, placeholder = 'Rechercher...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

/**
 * Composant de filtre select
 */
export const FilterSelect = ({ label, value, onChange, options, placeholder = 'Tous' }) => {
  return (
    <div>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Composant de filtre par fourchette (prix, année, etc.)
 */
export const FilterRange = ({ label, value = {}, onChange, min, max, step = 1, unit = '' }) => {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value.min || min}
            onChange={(e) => handleChange('min', parseFloat(e.target.value))}
            placeholder={`Min ${unit}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value.max || max}
            onChange={(e) => handleChange('max', parseFloat(e.target.value))}
            placeholder={`Max ${unit}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Composant de panneau de filtres
 */
export const FilterPanel = ({ 
  filters, 
  activeFiltersCount, 
  onClearAll, 
  children,
  title = 'Filtres'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-800 hover:text-blue-600 transition"
        >
          <FaFilter />
          {title}
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {isOpen && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
