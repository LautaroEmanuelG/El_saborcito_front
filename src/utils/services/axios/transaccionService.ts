// services/transaccionService.ts
import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/transaccion';

export const getAllTransaccion = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/all`);
  // Filtrar transacciones que no contienen un ticket
  const validTransacciones = response.data.filter((transaccion: any) => transaccion.ticket !== null);
  return validTransacciones;
};