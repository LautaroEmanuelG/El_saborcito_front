import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/formas-pago';

export interface FormaPago {
  id: number;
  nombre: string;
}

/**
 * Obtener todas las formas de pago disponibles
 */
export const getAllFormaPagos = async (): Promise<FormaPago[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`);
    const data = response.data;

    // Validar que los datos sean válidos
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ formaPagoService: API devolvió datos inválidos:', data);
      // Retornar fallback con formas de pago básicas
      return [
        { id: 1, nombre: 'EFECTIVO' },
        { id: 2, nombre: 'MERCADO_PAGO' },
      ];
    }

    return data;
  } catch (error) {
    console.error('❌ formaPagoService: Error en getAllFormaPagos:', error);
    // En caso de error, retornar fallback
    return [
      { id: 1, nombre: 'EFECTIVO' },
      { id: 2, nombre: 'MERCADO_PAGO' },
    ];
  }
};

/**
 * Obtener una forma de pago por ID
 */
export const getFormaPagoById = async (id: number): Promise<FormaPago> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

/**
 * Obtener una forma de pago por nombre
 */
export const getFormaPagoPorNombre = async (nombre: string): Promise<FormaPago> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/nombre/${nombre}`);
  return response.data;
};

export const saveFormaPago = async (data: FormaPago) => {
  const response = await axiosInstance.post(`${API_BASE_URL}`, data);
  return response.data;
};

export const updateFormaPago = async (id: number, data: FormaPago) => {
  const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteFormaPago = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};
