// axiosConfig.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5252/api'; // URL base de la API

// Crear una instancia de Axios con la configuración base
const axiosInstance = axios.create({
  baseURL: API_URL, // Base URL común para todas las llamadas
  headers: {
    'Content-Type': 'application/json', // Headers comunes
  },
  timeout: 10000, // Tiempo de espera opcional
});

// Aquí puedes agregar interceptores si es necesario
axiosInstance.interceptors.request.use(
  (config) => {
    // Modificar la configuración de la solicitud antes de enviarla (por ejemplo, agregar token de autenticación)
    const token = localStorage.getItem('token'); // Cambió de 'authToken' a 'token'
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
