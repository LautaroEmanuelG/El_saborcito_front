import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/categorias';

export const saveCategoria = async (categoriaData: any) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/guardar`,
    categoriaData
  );
  return response.data;
};

export const deleteCategoria = async (id: number) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/eliminar`, null, {
    params: { id },
  });
  return response.data;
};

export const getCategoriaById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/id`, {
    params: { id },
  });
  return response.data;
};

export const getAllCategorias = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/all`);
  return response.data;
};
