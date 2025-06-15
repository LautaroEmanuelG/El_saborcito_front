import axiosInstance from './axiosConfig';
import type { Articulo } from '../../types/Articulo';

const API_BASE_URL = '/articulos';

// 🆕 **SERVICIOS ADAPTADOS PARA ELIMINACIÓN LÓGICA (SOFT DELETE)**

// Función para crear un nuevo artículo (POST sin ID)
export const createArticulo = async (data: Partial<Articulo>) => {
  // Para crear, no incluir ID en la URL, solo en el body como 0
  const payload = {
    ...data,
    id: 0, // El backend espera id: 0 para crear
  };

  const response = await axiosInstance.post(API_BASE_URL, payload);
  return response.data;
};

// Función para actualizar un artículo existente (PUT con ID)
export const updateArticulo = async (data: Partial<Articulo>) => {
  if (!data.id) {
    throw new Error('ID es requerido para actualizar');
  }

  const response = await axiosInstance.put(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

// Función genérica que decide entre create o update
export const saveArticulo = async (data: Partial<Articulo>) => {
  if (data.id && data.id > 0) {
    return updateArticulo(data);
  } else {
    return createArticulo(data);
  }
};

// 🗑️ **MÉTODOS DE ELIMINACIÓN**

// Eliminación lógica (soft delete) - RECOMENDADO
export const deleteArticulo = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Restaurar artículo eliminado lógicamente
export const restoreArticulo = async (id: number) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/deleted/${id}/restore`);
  return response.data;
};

// 📖 **MÉTODOS DE CONSULTA**

export const getArticuloById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Obtener todos los artículos ACTIVOS (excluye eliminados)
export const getAllArticulos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

// Obtener TODOS los artículos (incluye eliminados)
export const getAllArticulosWithDeleted = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/with-deleted`);
  return response.data;
};

// Obtener solo artículos ELIMINADOS
export const getDeletedArticulos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/deleted`);
  return response.data;
};

// Obtener un artículo eliminado específico por ID
export const getDeletedArticuloById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/deleted/${id}`);
  return response.data;
};

// Obtener artículos activos por categoría (filtrado client-side por compatibilidad)
export const getArticulosByCategoria = async (categoriaId: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  // Filtrar los artículos cuya categoriaId coincida con el parámetro recibido
  return (
    response.data?.filter?.(
      (articulo: { categoriaId?: number }) => articulo.categoriaId === categoriaId
    ) ?? []
  );
};

// Obtener artículos por categoría (incluye eliminados, filtrado client-side)
export const getArticulosByCategoriaWithDeleted = async (categoriaId: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/with-deleted`);
  // Filtrar los artículos cuya categoriaId coincida con el parámetro recibido
  return (
    response.data?.filter?.(
      (articulo: { categoriaId?: number }) => articulo.categoriaId === categoriaId
    ) ?? []
  );
};

// 🔍 **ANÁLISIS DE PRODUCCIÓN**

// Analizar si es posible producir cantidades específicas de artículos
export const analizarProduccion = async (
  articulos: Array<{ articuloId: number; cantidad: number }>
) => {
  console.log('analizandoProduccion :>> ', articulos);
  const response = await axiosInstance.post(`${API_BASE_URL}/analizar-produccion`, {
    articulos,
  });
  console.log('analizandoProduccion Response :>> ', response.data);
  return response.data;
};
