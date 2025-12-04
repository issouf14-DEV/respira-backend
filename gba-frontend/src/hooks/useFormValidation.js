/**
 * Hook personnalisé pour la validation de formulaires
 */
import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Valider un champ spécifique
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Required
    if (rules.required && (!value || value.toString().trim() === '')) {
      return rules.required === true ? 'Ce champ est requis' : rules.required;
    }

    // Min length
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} caractères`;
    }

    // Max length
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} caractères`;
    }

    // Email
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Email invalide';
      }
    }

    // Phone
    if (rules.phone) {
      const phoneRegex = /^[\d\s\+\-\(\)]{8,}$/;
      if (!phoneRegex.test(value)) {
        return 'Numéro de téléphone invalide';
      }
    }

    // Pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage || 'Format invalide';
    }

    // Min value
    if (rules.min !== undefined && parseFloat(value) < rules.min) {
      return `La valeur minimum est ${rules.min}`;
    }

    // Max value
    if (rules.max !== undefined && parseFloat(value) > rules.max) {
      return `La valeur maximum est ${rules.max}`;
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value, values);
      if (customError) return customError;
    }

    return null;
  }, [validationRules, values]);

  // Valider tous les champs
  const validateAll = useCallback(() => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField, validationRules]);

  // Gérer le changement d'un champ
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({ ...prev, [name]: newValue }));
    
    // Valider si le champ a été touché
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // Gérer le blur (perte de focus)
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  // Gérer la soumission
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      // Marquer tous les champs comme touchés
      const allTouched = {};
      Object.keys(validationRules).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Valider
      const isValid = validateAll();
      
      if (isValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      } else {
        // Scroll vers la première erreur
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`);
          if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
      
      setIsSubmitting(false);
    };
  }, [values, validateAll, validationRules, errors]);

  // Reset
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set values programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // Set error programmatically
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
    validateAll
  };
};

/**
 * Composant Input avec validation intégrée
 */
export const ValidatedInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required,
  placeholder,
  className = '',
  ...props 
}) => {
  const showError = touched && error;
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
          showError ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {showError && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

/**
 * Composant Textarea avec validation intégrée
 */
export const ValidatedTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required,
  placeholder,
  rows = 4,
  className = '',
  ...props 
}) => {
  const showError = touched && error;
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
          showError ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {showError && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

/**
 * Composant Select avec validation intégrée
 */
export const ValidatedSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required,
  options,
  placeholder = 'Sélectionner...',
  className = '',
  ...props 
}) => {
  const showError = touched && error;
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
          showError ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showError && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};
