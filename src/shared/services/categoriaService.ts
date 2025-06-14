import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/categorias';

export const saveCategoria = async (categoriaData: any) => {
  if (categoriaData.id && categoriaData.id > 0) {
    // Editar: usar PUT con ID en la URL
    const response = await axiosInstance.put(`${API_BASE_URL}/${categoriaData.id}`, categoriaData);
    return response.data;
  } else {
    // Crear: usar POST sin ID en la URL
    const response = await axiosInstance.post(`${API_BASE_URL}`, categoriaData);
    return response.data;
  }
};

export const deleteCategoria = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getCategoriaById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllCategorias = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

// Restaurar categoría eliminada lógicamente
export const restoreCategoria = async (id: number) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/deleted/${id}/restore`);
  return response.data;
};

export const getDeletedCategorias = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/deleted`);
  return response.data;
};
