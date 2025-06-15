import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/promociones';

export const savePromocion = async (data: any) => {
  // Si tiene ID, es una actualización (PUT), si no tiene, es una creación (POST)
  if (data.id) {
    // Actualizar existente
    const response = await axiosInstance.put(`${API_BASE_URL}/${data.id}`, data);
    return response.data;
  } else {
    // Crear nuevo
    const response = await axiosInstance.post(`${API_BASE_URL}`, data);
    return response.data;
  }
};

export const deletePromocion = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getPromocionById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllPromociones = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

export const getDeletedPromociones = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/deleted`);
  return response.data;
};

export const restorePromocion = async (id: number) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/deleted/${id}/restore`);
  return response.data;
};
