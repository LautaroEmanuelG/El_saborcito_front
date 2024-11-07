// services/ticketService.ts
import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/transaccion';

export const getAllTransaccion = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/all`);
  return response.data;
};
