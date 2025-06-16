import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada
import { Localidad } from '../../modules/HU1_2_Registro_Login/models';

const API_BASE_URL = '/localidades';

export const saveLocalidad = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteLocalidad = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getLocalidadById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllLocalidades = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

export const getLocalidades = async (): Promise<Localidad[]> => {
  const response = await axiosInstance.get(API_BASE_URL);
  return response.data;
};

export const getLocalidadesByProvincia = async (provinciaId: number): Promise<Localidad[]> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/provincia/${provinciaId}`);
  return response.data;
};
