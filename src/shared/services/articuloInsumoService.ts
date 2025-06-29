import axiosInstance from './axiosConfig';
import type { ArticuloInsumo } from '../../types/Articulo';
import { uploadImageToArticuloInsumo } from './cloudinaryService';

const API_BASE_URL = '/insumos';

// 🆕 **SERVICIOS ADAPTADOS PARA ELIMINACIÓN LÓGICA (SOFT DELETE)**

// Función para crear un nuevo artículo insumo con imagen opcional
export const createArticuloInsumo = async (data: Partial<ArticuloInsumo>, imageFile?: File) => {
  // Para crear, no incluir ID en la URL, solo en el body como 0
  const payload = {
    ...data,
    id: 0, // El backend espera id: 0 para crear
  };

  const response = await axiosInstance.post(API_BASE_URL, payload);
  const newInsumo = response.data;

  // Si hay una imagen, subirla después de crear el insumo
  if (imageFile && newInsumo?.id) {
    try {
      const imageResult = await uploadImageToArticuloInsumo(newInsumo.id, imageFile);
      if (imageResult.cloudinaryUrl) {
        // Actualizar el objeto con la información de la imagen
        newInsumo.imagen = {
          id: imageResult.imagenId,
          url: imageResult.cloudinaryUrl,
        };
      }
    } catch (imageError) {
      console.warn('Insumo creado pero falló la subida de imagen:', imageError);
      // No lanzar error para que el insumo se mantenga creado
    }
  }

  return newInsumo;
};

// Función para actualizar un artículo insumo existente con imagen opcional
export const updateArticuloInsumo = async (data: Partial<ArticuloInsumo>, imageFile?: File) => {
  if (!data.id) {
    throw new Error('ID es requerido para actualizar');
  }

  const response = await axiosInstance.put(`${API_BASE_URL}/${data.id}`, data);
  const updatedInsumo = response.data;

  // Si hay una imagen, subirla después de actualizar el insumo
  if (imageFile && data.id) {
    try {
      const imageResult = await uploadImageToArticuloInsumo(data.id, imageFile);
      if (imageResult.cloudinaryUrl) {
        // Actualizar el objeto con la información de la imagen
        updatedInsumo.imagen = {
          id: imageResult.imagenId,
          url: imageResult.cloudinaryUrl,
        };
      }
    } catch (imageError) {
      console.warn('Insumo actualizado pero falló la subida de imagen:', imageError);
      // No lanzar error para que la actualización se mantenga
    }
  }

  return updatedInsumo;
};

// Función genérica que decide entre create o update con imagen opcional
export const saveArticuloInsumo = async (data: Partial<ArticuloInsumo>, imageFile?: File) => {
  if (data.id && data.id > 0) {
    return updateArticuloInsumo(data, imageFile);
  } else {
    return createArticuloInsumo(data, imageFile);
  }
};

// 🗑️ **MÉTODOS DE ELIMINACIÓN**

// Eliminación lógica (soft delete) - RECOMENDADO
export const deleteArticuloInsumo = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Verificar si un artículo insumo puede ser restaurado (validar que su categoría no esté eliminada)
export const canRestoreArticuloInsumo = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}/can-restore`);
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

// 🆕 Consultar si un insumo puede venderse (tiene stock suficiente)
export const canBeSold = async (id: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/${id}/can-be-sold`);
    return response.data;
  } catch (error) {
    console.error('Error al consultar stock del insumo:', error);
    return false; // Si hay error, considerar que no se puede vender
  }
};

// 🔍 **VALIDACIÓN DE DUPLICADOS - DENOMINACIÓN**

// Verificar si existe una denominación entre los insumos activos
export const existsByDenominacion = async (denominacion: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/validate-denominacion`, {
      params: { denominacion },
    });
    return response.data;
  } catch (error) {
    console.error('Error al validar denominación de insumo (activos):', error);
    return false;
  }
};

// Verificar si existe una denominación entre todos los insumos (incluyendo eliminados)
export const existsByDenominacionIncludingDeleted = async (
  denominacion: string
): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/validate-denominacion-all`, {
      params: { denominacion },
    });
    return response.data;
  } catch (error) {
    console.error('Error al validar denominación de insumo (incluyendo eliminados):', error);
    return false;
  }
};

// Función combinada para obtener detalles sobre el estado del duplicado
export const checkDenominacionStatus = async (
  denominacion: string
): Promise<{
  isActive: boolean;
  isDeleted: boolean;
  message: string;
}> => {
  try {
    const [existsActive, existsAll] = await Promise.all([
      existsByDenominacion(denominacion),
      existsByDenominacionIncludingDeleted(denominacion),
    ]);

    if (existsActive) {
      return {
        isActive: true,
        isDeleted: false,
        message: 'Ya existe un insumo activo con esta denominación',
      };
    } else if (existsAll) {
      return {
        isActive: false,
        isDeleted: true,
        message:
          'Ya existe un insumo eliminado con esta denominación. Puede restaurarlo si lo necesita',
      };
    } else {
      return {
        isActive: false,
        isDeleted: false,
        message: 'Denominación disponible',
      };
    }
  } catch (error) {
    console.error('Error al verificar estado de denominación:', error);
    return {
      isActive: false,
      isDeleted: false,
      message: 'Error al verificar denominación',
    };
  }
};

// 🔗 **OBTENER ARTÍCULOS MANUFACTURADOS QUE USAN UN INSUMO**

// Obtener todos los artículos manufacturados que utilizan un insumo específico
export const getArticuloManufacturadosByInsumo = async (insumoId: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${insumoId}/manufacturados`);
  return response.data;
};
