import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/articulo-manufacturado-detalles';

export const saveArticuloManufacturadoDetalle = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteArticuloManufacturadoDetalle = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getArticuloManufacturadoDetalleById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllArticuloManufacturadoDetalles = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};
