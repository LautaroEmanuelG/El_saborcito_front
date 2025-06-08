import axiosInstance from './axiosConfig';
import type { ArticuloManufacturado } from '../../types/Articulo';

const API_BASE_URL = '/manufacturados';

// 🆕 **SERVICIOS ADAPTADOS PARA ELIMINACIÓN LÓGICA (SOFT DELETE)**

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

// 🗑️ **MÉTODOS DE ELIMINACIÓN**

// Eliminación lógica (soft delete) - RECOMENDADO
export const deleteArticuloManufacturado = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Restaurar artículo eliminado lógicamente
export const restoreArticuloManufacturado = async (id: number) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/deleted/${id}/restore`);
  return response.data;
};

// 📖 **MÉTODOS DE CONSULTA**

export const getArticuloManufacturadoById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Obtener todos los artículos manufacturados ACTIVOS (excluye eliminados)
export const getAllArticuloManufacturados = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

// Obtener solo artículos manufacturados ELIMINADOS
export const getDeletedArticuloManufacturados = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/deleted`);
  return response.data;
};

// Obtener un artículo eliminado específico por ID
export const getDeletedArticuloManufacturadoById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/deleted/${id}`);
  return response.data;
};

// Obtener artículos manufacturados activos por categoría
export const getAllArticuloManufacturadosByCategoria = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/categoria/${id}`);
  return response.data;
};

// Consultar si un artículo manufacturado puede fabricarse (tiene insumos suficientes)
export const canBeManufactured = async (id: number): Promise<boolean> => {
  const response = await axiosInstance.get<boolean>(`${API_BASE_URL}/${id}/can-be-manufactured`);
  return response.data ?? false;
};
