import axiosInstance from '../../../shared/services/axiosConfig';
import { añadirTiempoPedido } from '../../../shared/services/pedidoService';
import type { Pedido, EstadoId } from '../Model';
import { AxiosError } from 'axios';

const API_BASE_URL = '/cocina';

/**
 * 🍳 Servicio para el módulo de cocina
 * Gestiona todas las operaciones relacionadas con pedidos en cocina
 */

/**
 * Obtener pedidos activos para cocina
 */
export const fetchPedidosActivos = async (): Promise<Pedido[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/pedidos/activos`);
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(`Error al obtener pedidos activos: ${errorMessage}`);
  }
};

/**
 * Avanzar estado automáticamente de un pedido
 */
export const avanzarEstadoPedido = async (pedidoId: number): Promise<Pedido> => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/pedidos/${pedidoId}/avanzar`);
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
 * Cambiar estado específico de un pedido
 */
export const updatePedidoEstado = async (
  pedidoId: number,
  nuevoEstadoId: EstadoId
): Promise<Pedido> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/pedidos/${pedidoId}/estado-cocina?nuevoEstadoId=${nuevoEstadoId}`
    );
    return response.data;
  } catch (error) {
    let errorMessage = `Error al actualizar estado del pedido #${pedidoId}`;

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
 * 🕒 Añadir tiempo adicional a un pedido
 */
export const añadirTiempoAPedido = async (
  pedidoId: number,
  minutosAdicionales: number
): Promise<Pedido> => {
  try {
    return await añadirTiempoPedido(pedidoId, minutosAdicionales);
  } catch (error) {
    let errorMessage = `Error al añadir tiempo al pedido #${pedidoId}`;

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
 * 🆔 Obtener pedido por ID (para refrescar datos después de actualización)
 */
export const getPedidoById = async (pedidoId: number): Promise<Pedido> => {
  try {
    const response = await axiosInstance.get(`/pedidos/${pedidoId}`);
    return response.data;
  } catch (error) {
    let errorMessage = `Error al obtener pedido #${pedidoId}`;

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
 * 🚫 Cancelar un pedido
 */
export const cancelarPedido = async (pedidoId: number): Promise<Pedido> => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/pedidos/${pedidoId}/cancelar`);
    return response.data;
  } catch (error) {
    let errorMessage = `Error al cancelar pedido #${pedidoId}`;

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
