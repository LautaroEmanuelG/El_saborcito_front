// services/ticketService.ts
import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/ticket';

export const createTicket = async (
  productos: { cantidad: number; productoId: number }[],
  pago: string
) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/nuevo`, {
    productos,
    pago,
  });
  return response.data;
};

export const getAllTickets = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/all`);
  return response.data;
};
