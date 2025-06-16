// axiosConfig.ts
import axios from 'axios';

const API_URL = import.meta.env.BACK_API_BASE_URL || 'http://localhost:5252/api'; // URL base de la API

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
    console.log('Enviando petición a:', config.url);
    console.log('Datos de la petición:', config.data);
    // Modificar la configuración de la solicitud antes de enviarla (por ejemplo, agregar token de autenticación)
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('Error en la petición:', error);
    // Manejo de errores antes de que se envíe la solicitud
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida:', response.data);
    // Puedes modificar la respuesta antes de retornarla
    return response;
  },
  (error) => {
    console.error('Error en la respuesta:', error.response?.data);
    // Manejo de errores de respuesta
    return Promise.reject(error);
  }
);

export default axiosInstance;
