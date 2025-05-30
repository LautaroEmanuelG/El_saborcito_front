import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada
import type { ArticuloManufacturado } from '../../types/Articulo';

const API_BASE_URL = '/manufacturados';

// Función para crear un nuevo artículo manufacturado (POST sin ID)
export const createArticuloManufacturado = async (data: Partial<ArticuloManufacturado>) => {
  // Para crear, no incluir ID en la URL, solo en el body como 0
  const payload = {
    ...data,
    id: 0, // El backend espera id: 0 para crear
    preparacion: data.descripcion ?? '', // Mapear descripcion a preparacion si no existe
    // Asegurar que articuloManufacturadoDetalles esté presente
    articuloManufacturadoDetalles: data.articuloManufacturadoDetalles ?? [],
  };

  console.log('Creating ArticuloManufacturado:', payload);
  const response = await axiosInstance.post(API_BASE_URL, payload);
  return response.data;
};

// Función para actualizar un artículo manufacturado existente (PUT con ID)
export const updateArticuloManufacturado = async (data: Partial<ArticuloManufacturado>) => {
  if (!data.id) {
    throw new Error('ID es requerido para actualizar');
  }
  const payload = {
    ...data,
    preparacion: data.descripcion ?? '', // Mapear descripcion a preparacion si no existe
    // Asegurar que articuloManufacturadoDetalles esté presente
    articuloManufacturadoDetalles: data.articuloManufacturadoDetalles ?? [],
  };

  console.log('Updating ArticuloManufacturado:', payload);
  const response = await axiosInstance.put(`${API_BASE_URL}/${data.id}`, payload);
  return response.data;
};

// Función genérica que decide entre create o update
export const saveArticuloManufacturado = async (data: Partial<ArticuloManufacturado>) => {
  if (data.id && data.id > 0) {
    return updateArticuloManufacturado(data);
  } else {
    return createArticuloManufacturado(data);
  }
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
