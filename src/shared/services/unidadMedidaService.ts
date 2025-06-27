import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

// Cambia la URL base para que coincida con el endpoint del backend
const API_BASE_URL = '/unidades';

export const saveUnidadMedida = async (data: any) => {
  console.log('data :>> ', data);
  if (data.id) {
    // Actualizar
    const response = await axiosInstance.put(`${API_BASE_URL}/${data.id}`, data);
    return response.data;
  } else {
    // Crear
    const response = await axiosInstance.post(`${API_BASE_URL}`, data);
    return response.data;
  }
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
  const response = await axiosInstance.get(`${API_BASE_URL}`); // Solo activas
  return response.data;
};

export const getAllUnidadMedidasIncludingDeleted = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/all`); // Incluye eliminadas
  return response.data;
};

export const deleteUnidadMedidaLogico = async (id: number) => {
  const response = await axiosInstance.patch(`${API_BASE_URL}/${id}/baja`);
  return response.data;
};

export const restaurarUnidadMedida = async (id: number) => {
  const response = await axiosInstance.patch(`${API_BASE_URL}/${id}/restaurar`);
  return response.data;
};
