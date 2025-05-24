// services/transaccionService.ts
import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/transacciones'; // Corregido de /transaccion a /transacciones

export const saveTransaccion = async (data: any) => {
  // Añadido saveTransaccion
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteTransaccion = async (id: number) => {
  // Añadido deleteTransaccion
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getTransaccionById = async (id: number) => {
  // Añadido getTransaccionById
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllTransaccion = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  // Filtrar transacciones que no contienen un ticket
  const validTransacciones = response.data.filter(
    (transaccion: any) => transaccion.ticket !== null
  );
  return validTransacciones;
};
