import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/articulos';

export const saveArticulo = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteArticulo = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getArticuloById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllArticulos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

export const getArticulosByCategoria = async (categoriaId: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  // Filtrar los artículos cuya categoriaId coincida con el parámetro recibido
  return (
    response.data?.filter?.(
      (articulo: { categoriaId?: number }) => articulo.categoriaId === categoriaId
    ) ?? []
  );
};
