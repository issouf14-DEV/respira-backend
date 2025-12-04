import axios from "axios";

// En dev, utiliser le proxy Vite (/api), en prod utiliser l'URL complète
const isDev = import.meta.env.DEV;
const API_URL = isDev ? '' : (import.meta.env.VITE_API_URL || 'https://le-gba-backend.onrender.com');

const API = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => API.post("/auth/register", userData),
  login: (credentials) => API.post("/auth/login", credentials),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getProfile: () => API.get("/auth/profile"),
  updateProfile: (userData) => API.put("/auth/profile", userData),
};

export default API