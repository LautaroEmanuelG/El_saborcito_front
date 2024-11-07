import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/usuarios';

// Servicio para el login
export const loginUsuario = async (email: string, contraseña: string) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/login`, null, {
    params: { email, contraseña },
  });
  return response.data;
};

// Servicio para el registro
export const registerUsuario = async (usuario: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/register`, usuario);
  return response.data;
};