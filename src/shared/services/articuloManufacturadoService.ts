import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/manufacturados';

export const saveArticuloManufacturado = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteArticuloManufacturado = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getArticuloManufacturadoById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllArticuloManufacturados = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

export const getAllArticuloManufacturadosByCategoria = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/categoria/${id}`);
  return response.data;
};
