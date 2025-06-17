import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/tipo-envios';

export const saveTipoEnvio = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteTipoEnvio = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getTipoEnvioById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllTipoEnvios = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`);
    const data = response.data;

    // Validar que los datos sean válidos
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ tipoEnvioService: API devolvió datos inválidos:', data);
      // Retornar fallback con tipos básicos
      return [
        { id: 1, nombre: 'DELIVERY' },
        { id: 2, nombre: 'TAKE_AWAY' },
      ];
    }

    return data;
  } catch (error) {
    console.error('❌ tipoEnvioService: Error en getAllTipoEnvios:', error);
    // En caso de error, retornar fallback
    return [
      { id: 1, nombre: 'DELIVERY' },
      { id: 2, nombre: 'TAKE_AWAY' },
    ];
  }
};
