/**
 * Formate un nombre en prix (avec séparateurs de milliers et devise)
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0€';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Formate une date en format français
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calcule le prix mensuel approximatif
 */
export const calculateMonthlyPayment = (price, months = 60) => {
  if (!price) return 0;
  return Math.round(price / months);
};

/**
 * Valide un email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valide un numéro de téléphone
 */
export const isValidPhone = (phone) => {
  const regex = /^[\d\s\-\+\(\)]+$/;
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 8;
};

/**
 * Tronque un texte
 */
export const truncate = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Génère un ID unique
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Débounce une fonction
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Vérifie si un objet est vide
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Clone profond d'un objet
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export default {
  formatPrice,
  formatDate,
  calculateMonthlyPayment,
  isValidEmail,
  isValidPhone,
  truncate,
  generateId,
  debounce,
  isEmpty,
  deepClone,
};