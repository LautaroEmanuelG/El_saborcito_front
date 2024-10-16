// services/productoService.ts
import axiosInstance from './axiosConfig';  // Importar la instancia preconfigurada

const API_BASE_URL = '/productos';

export const saveProduct = async (productData: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/guardar`, productData);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/eliminar`, null, { params: { id } });
  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/id`, { params: { id } });
  return response.data;
};

export const getAllProductos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/all`);
  return response.data;
};
