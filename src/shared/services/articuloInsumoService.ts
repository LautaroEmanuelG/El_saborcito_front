import axiosInstance from './axiosConfig';
import type { ArticuloInsumo } from '../../types/Articulo';

const API_BASE_URL = '/insumos';

// 🆕 **SERVICIOS ADAPTADOS PARA ELIMINACIÓN LÓGICA (SOFT DELETE)**

// Función para crear un nuevo artículo insumo (POST sin ID)
export const createArticuloInsumo = async (data: Partial<ArticuloInsumo>) => {
  // Para crear, no incluir ID en la URL, solo en el body como 0
  const payload = {
    ...data,
    id: 0, // El backend espera id: 0 para crear
  };

  const response = await axiosInstance.post(API_BASE_URL, payload);
  return response.data;
};

// Función para actualizar un artículo insumo existente (PUT con ID)
export const updateArticuloInsumo = async (data: Partial<ArticuloInsumo>) => {
  if (!data.id) {
    throw new Error('ID es requerido para actualizar');
  }

  const response = await axiosInstance.put(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

// Función genérica que decide entre create o update
export const saveArticuloInsumo = async (data: Partial<ArticuloInsumo>) => {
  if (data.id && data.id > 0) {
    return updateArticuloInsumo(data);
  } else {
    return createArticuloInsumo(data);
  }
};

// 🗑️ **MÉTODOS DE ELIMINACIÓN**

// Eliminación lógica (soft delete) - RECOMENDADO
export const deleteArticuloInsumo = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Restaurar artículo eliminado lógicamente
export const restoreArticuloInsumo = async (id: number) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/deleted/${id}/restore`);
  return response.data;
};

// 📖 **MÉTODOS DE CONSULTA**

export const getArticuloInsumoById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Obtener todos los artículos insumo ACTIVOS (excluye eliminados)
export const getAllArticuloInsumos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

// Obtener TODOS los artículos insumo (incluye eliminados)
export const getAllArticuloInsumosWithDeleted = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/with-deleted`);
  return response.data;
};

// Obtener solo artículos insumo ELIMINADOS
export const getDeletedArticuloInsumos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/deleted`);
  return response.data;
};

// Obtener un artículo insumo eliminado específico por ID
export const getDeletedArticuloInsumoById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/deleted/${id}`);
  return response.data;
};

// Obtener artículos insumo activos para elaborar
export const getAllArticuloInsumoEsParaElaborar = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/es-para-elaborar`);
  return response.data;
};

// Obtener artículos insumo para elaborar (incluye eliminados)
export const getAllArticuloInsumoEsParaElaborarWithDeleted = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/es-para-elaborar/with-deleted`);
  return response.data;
};

// Obtener artículos insumo activos NO para elaborar
export const getAllArticuloInsumoNoEsParaElaborar = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/no-es-para-elaborar`);
  return response.data;
};

// Obtener artículos insumo NO para elaborar (incluye eliminados)
export const getAllArticuloInsumoNoEsParaElaborarWithDeleted = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/no-es-para-elaborar/with-deleted`);
  return response.data;
};

// Obtener artículos insumo activos por categoría
export const getAllArticuloInsumoByCategoria = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/categoria/${id}`);
  return response.data;
};

// Obtener artículos insumo por categoría (incluye eliminados)
export const getAllArticuloInsumoByCategoriaWithDeleted = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/categoria/${id}/with-deleted`);
  return response.data;
};
