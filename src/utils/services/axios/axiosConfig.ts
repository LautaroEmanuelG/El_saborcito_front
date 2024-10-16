// axiosConfig.ts
import axios from 'axios';

// Crear una instancia de Axios con la configuración base
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5252/api',  // Base URL común para todas las llamadas
  headers: {
    'Content-Type': 'application/json',  // Headers comunes
  },
  timeout: 10000,  // Tiempo de espera opcional
});

// Aquí puedes agregar interceptores si es necesario
axiosInstance.interceptors.request.use(
  (config) => {
    // Modificar la configuración de la solicitud antes de enviarla (por ejemplo, agregar token de autenticación)
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    // Manejo de errores antes de que se envíe la solicitud
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Puedes modificar la respuesta antes de retornarla
    return response;
  },
  (error) => {
    // Manejo de errores de respuesta
    return Promise.reject(error);
  }
);

export default axiosInstance;
