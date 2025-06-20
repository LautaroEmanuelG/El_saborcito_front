import axiosInstance from './axiosConfig';
import type { ArticuloManufacturado } from '../../types/Articulo';
import { uploadImageToArticuloManufacturado } from './cloudinaryService';

const API_BASE_URL = '/manufacturados';

// 🆕 **SERVICIOS ADAPTADOS PARA ELIMINACIÓN LÓGICA (SOFT DELETE)**

// Función para crear un nuevo artículo manufacturado con imagen opcional
export const createArticuloManufacturado = async (
  data: Partial<ArticuloManufacturado>,
  imageFile?: File
) => {
  // Para crear, no incluir ID en la URL, solo en el body como 0
  const payload = {
    ...data,
    id: 0, // El backend espera id: 0 para crear
    preparacion: data.descripcion ?? '', // Mapear descripcion a preparacion si no existe
    // Asegurar que articuloManufacturadoDetalles esté presente
    articuloManufacturadoDetalles: data.articuloManufacturadoDetalles ?? [],
  };

  const response = await axiosInstance.post(API_BASE_URL, payload);
  const newArticulo = response.data;

  // Si hay una imagen, subirla después de crear el artículo
  if (imageFile && newArticulo?.id) {
    try {
      const imageResult = await uploadImageToArticuloManufacturado(newArticulo.id, imageFile);
      if (imageResult.cloudinaryUrl) {
        // Actualizar el objeto con la información de la imagen
        newArticulo.imagen = {
          id: imageResult.imagenId,
          url: imageResult.cloudinaryUrl,
        };
      }
    } catch (imageError) {
      console.warn('Artículo creado pero falló la subida de imagen:', imageError);
      // No lanzar error para que el artículo se mantenga creado
    }
  }

  return newArticulo;
};

// Función para actualizar un artículo manufacturado existente con imagen opcional
export const updateArticuloManufacturado = async (
  data: Partial<ArticuloManufacturado>,
  imageFile?: File
) => {
  if (!data.id) {
    throw new Error('ID es requerido para actualizar');
  }
  const payload = {
    ...data,
    preparacion: data.descripcion ?? '', // Mapear descripcion a preparacion si no existe
    // Asegurar que articuloManufacturadoDetalles esté presente
    articuloManufacturadoDetalles: data.articuloManufacturadoDetalles ?? [],
  };

  const response = await axiosInstance.put(`${API_BASE_URL}/${data.id}`, payload);
  const updatedArticulo = response.data;

  // Si hay una imagen, subirla después de actualizar el artículo
  if (imageFile && data.id) {
    try {
      const imageResult = await uploadImageToArticuloManufacturado(data.id, imageFile);
      if (imageResult.cloudinaryUrl) {
        // Actualizar el objeto con la información de la imagen
        updatedArticulo.imagen = {
          id: imageResult.imagenId,
          url: imageResult.cloudinaryUrl,
        };
      }
    } catch (imageError) {
      console.warn('Artículo actualizado pero falló la subida de imagen:', imageError);
      // No lanzar error para que la actualización se mantenga
    }
  }

  return updatedArticulo;
};

// Función genérica que decide entre create o update con imagen opcional
export const saveArticuloManufacturado = async (
  data: Partial<ArticuloManufacturado>,
  imageFile?: File
) => {
  if (data.id && data.id > 0) {
    return updateArticuloManufacturado(data, imageFile);
  } else {
    return createArticuloManufacturado(data, imageFile);
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

// 🔍 **VALIDACIÓN DE DUPLICADOS**

// Validar si existe un artículo manufacturado con la denominación dada (solo activos)
export const validateDenominacion = async (
  denominacion: string,
  excludeId?: number
): Promise<boolean> => {
  try {
    const params = new URLSearchParams();
    params.append('denominacion', denominacion.trim());
    if (excludeId) {
      params.append('excludeId', excludeId.toString());
    }

    const response = await axiosInstance.get<boolean>(
      `${API_BASE_URL}/validate-denominacion?${params}`
    );
    return response.data;
  } catch (error) {
    console.error('Error validando denominación:', error);
    return false;
  }
};

// Validar si existe un artículo manufacturado con la denominación dada (incluyendo eliminados)
export const validateDenominacionIncludingDeleted = async (
  denominacion: string,
  excludeId?: number
): Promise<boolean> => {
  try {
    const params = new URLSearchParams();
    params.append('denominacion', denominacion.trim());
    if (excludeId) {
      params.append('excludeId', excludeId.toString());
    }

    const response = await axiosInstance.get<boolean>(
      `${API_BASE_URL}/validate-denominacion-all?${params}`
    );
    return response.data;
  } catch (error) {
    console.error('Error validando denominación incluyendo eliminados:', error);
    return false;
  }
};

// Validar denominación con información detallada sobre el estado
export const validateDenominacionWithDetails = async (
  denominacion: string,
  excludeId?: number
): Promise<{
  exists: boolean;
  isActive: boolean;
  isDeleted: boolean;
}> => {
  try {
    const [activeExists, allExists] = await Promise.all([
      validateDenominacion(denominacion, excludeId),
      validateDenominacionIncludingDeleted(denominacion, excludeId),
    ]);

    return {
      exists: allExists,
      isActive: activeExists,
      isDeleted: allExists && !activeExists,
    };
  } catch (error) {
    console.error('Error validando denominación con detalles:', error);
    return {
      exists: false,
      isActive: false,
      isDeleted: false,
    };
  }
};
