import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada
import { AxiosError } from 'axios';

const API_BASE_URL = '/estados';

export const saveEstado = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteEstado = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getEstadoById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllEstados = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

/**
 * 🔄 Servicio unificado para manejo de estados de pedidos
 * Proporciona funcionalidad consistente para avanzar estados en todos los módulos
 */

/**
 * Avanza automáticamente el estado de un pedido
 * Esta función determina automáticamente el próximo estado basado en la lógica del backend
 * @param pedidoId ID del pedido a avanzar
 * @returns Pedido actualizado
 */
export const avanzarEstadoPedidoGenerico = async (pedidoId: number): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/cocina/pedidos/${pedidoId}/avanzar`);
    return response.data;
  } catch (error) {
    let errorMessage = `Error al avanzar pedido #${pedidoId}`;

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as any;
      errorMessage = errorData?.message || errorData?.error || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Marcar pedido como entregado (específico para delivery)
 * @param pedidoId ID del pedido a marcar como entregado
 */
export const marcarPedidoEntregado = async (pedidoId: number): Promise<any> => {
  try {
    // Utilizamos el mismo endpoint genérico, el backend manejará la transición a ENTREGADO
    return await avanzarEstadoPedidoGenerico(pedidoId);
  } catch (error) {
    throw new Error(
      `Error al marcar pedido #${pedidoId} como entregado: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
};
