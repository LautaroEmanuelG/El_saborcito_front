import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada
import { uploadImageToPromocion } from './cloudinaryService';

const API_BASE_URL = '/promociones';

export const savePromocion = async (data: any, imageFile?: File) => {
  let resultado;

  // Si tiene ID, es una actualización (PUT), si no tiene, es una creación (POST)
  if (data.id) {
    // Actualizar existente
    const response = await axiosInstance.put(`${API_BASE_URL}/${data.id}`, data);
    resultado = response.data;
  } else {
    // Crear nuevo
    const response = await axiosInstance.post(`${API_BASE_URL}`, data);
    resultado = response.data;
  }

  // Si hay una imagen y tenemos el ID del resultado, subirla
  if (imageFile && resultado?.id) {
    try {
      const imageResult = await uploadImageToPromocion(resultado.id, imageFile);
      if (imageResult.cloudinaryUrl) {
        // Actualizar el objeto con la información de la imagen
        resultado.imagen = {
          id: imageResult.imagenId,
          url: imageResult.cloudinaryUrl,
        };
      }
    } catch (imageError) {
      console.warn('Promoción guardada pero falló la subida de imagen:', imageError);
      // No lanzar error para que la promoción se mantenga guardada
    }
  }

  return resultado;
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
