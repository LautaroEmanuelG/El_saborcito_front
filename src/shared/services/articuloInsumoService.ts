import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/articulo-insumos';

export const saveArticuloInsumo = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteArticuloInsumo = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getArticuloInsumoById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllArticuloInsumos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

export const getAllArticuloInsumoEsParaElaborar = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/es-para-elaborar`);
  return response.data;
};

export const getAllArticuloInsumoNoEsParaElaborar = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/no-es-para-elaborar`);
  return response.data;
};
