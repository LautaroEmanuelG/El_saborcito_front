// axiosConfig.ts
import axios from 'axios';

// Crear una instancia de Axios con la configuración base
const BASE_URL = import.meta.env.VITE_BACK_API_BASE_URL ?? 'http://localhost:5252/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
