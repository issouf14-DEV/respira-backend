export const API_URL = import.meta.env.VITE_API_URL;

export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LABELS = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export const FUEL_TYPES = {
  GASOLINE: "Essence",
  DIESEL: "Diesel",
  ELECTRIC: "Électrique",
  HYBRID: "Hybride",
};

export const TRANSMISSION_TYPES = {
  MANUAL: "Manuelle",
  AUTOMATIC: "Automatique",
  CVT: "CVT",
};

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

export const PAGINATION_LIMIT = 12;