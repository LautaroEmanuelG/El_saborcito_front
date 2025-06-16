import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/historial-pedidos';

export const saveHistorialPedido = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteHistorialPedido = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getHistorialPedidoById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllHistorialPedidos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

// 🆕 Endpoint específico para obtener historial por cliente
export const getHistorialPedidosByCliente = async (clienteId: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/cliente/${clienteId}`);
  return response.data;
};
