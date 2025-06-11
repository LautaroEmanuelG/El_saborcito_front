import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

// Cambia la URL base para que coincida con el endpoint del backend
const API_BASE_URL = '/unidades';

export const saveUnidadMedida = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteUnidadMedida = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getUnidadMedidaById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllUnidadMedidas = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};
