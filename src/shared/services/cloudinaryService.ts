import axiosInstance from './axiosConfig';

// 📸 **SERVICIO PARA SUBIR IMÁGENES A CLOUDINARY**

// Interfaz para la respuesta de Cloudinary
interface CloudinaryResponse {
  imagenId: number;
  cloudinaryUrl: string;
  publicId: string;
  entityUpdated: boolean;
  success?: boolean;
  message?: string;
}

// Función para validar archivos de imagen
export const validateImageFile = (file: File): void => {
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño (10MB máximo)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error('La imagen es demasiado grande (máximo 10MB)');
  }

  // Validar formatos específicos
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato no soportado. Use JPEG, PNG, GIF o WebP');
  }
};

// 🎯 **SUBIDA DE IMÁGENES PARA PROMOCIONES**
export const uploadImageToPromocion = async (
  promocionId: number,
  file: File
): Promise<CloudinaryResponse> => {
  try {
    validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(`/promociones/${promocionId}/imagen`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error al subir imagen a promoción:', error);
    throw new Error(error?.response?.data?.message ?? 'Error al subir imagen');
  }
};

// 🏭 **SUBIDA DE IMÁGENES PARA ARTÍCULOS MANUFACTURADOS**
export const uploadImageToArticuloManufacturado = async (
  articuloId: number,
  file: File
): Promise<CloudinaryResponse> => {
  try {
    validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(`/manufacturados/${articuloId}/imagen`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error al subir imagen a artículo manufacturado:', error);
    throw new Error(error?.response?.data?.message ?? 'Error al subir imagen');
  }
};

// 📦 **SUBIDA DE IMÁGENES PARA ARTÍCULOS INSUMO**
export const uploadImageToArticuloInsumo = async (
  insumoId: number,
  file: File
): Promise<CloudinaryResponse> => {
  try {
    validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(`/insumos/${insumoId}/imagen`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error al subir imagen a artículo insumo:', error);
    throw new Error(error?.response?.data?.message ?? 'Error al subir imagen');
  }
};

// 🔄 **SUBIDA DIRECTA DE IMÁGENES**
export const uploadImageDirect = async (file: File): Promise<CloudinaryResponse> => {
  try {
    validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(`/imagenes/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error al subir imagen directamente:', error);
    throw new Error(error?.response?.data?.message ?? 'Error al subir imagen');
  }
};

// 🗑️ **ELIMINAR IMAGEN**
export const deleteImage = async (imagenId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/imagenes/${imagenId}`);
  } catch (error: any) {
    console.error('Error al eliminar imagen:', error);
    throw new Error(error?.response?.data?.message ?? 'Error al eliminar imagen');
  }
};
