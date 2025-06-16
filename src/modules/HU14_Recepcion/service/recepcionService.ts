// 🔧 **SERVICIOS ESPECÍFICOS PARA RECEPCIÓN**

import {
  getAllPedidos,
  updateEstadoPedido,
  getPedidoById,
} from '../../../shared/services/pedidoService';
import { getAllEstados } from '../../../shared/services/estadoService';
import { PedidoCompleto, Estado } from '../../../types/Pedido';

/**
 * Servicio para obtener todos los pedidos con información completa
 */
export const obtenerTodosPedidos = async (): Promise<PedidoCompleto[]> => {
  try {
    const pedidos = await getAllPedidos();
    return pedidos;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw new Error('No se pudieron cargar los pedidos');
  }
};

/**
 * Servicio para obtener todos los estados disponibles
 */
export const obtenerEstados = async (): Promise<Estado[]> => {
  try {
    const estados = await getAllEstados();
    return estados;
  } catch (error) {
    console.error('Error al obtener estados:', error);
    throw new Error('No se pudieron cargar los estados');
  }
};

/**
 * Servicio para cambiar el estado de un pedido
 */
export const cambiarEstadoPedido = async (pedidoId: number, nuevoEstado: string): Promise<void> => {
  try {
    await updateEstadoPedido(pedidoId, nuevoEstado);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    throw new Error(`No se pudo cambiar el estado a ${nuevoEstado}`);
  }
};

/**
 * Servicio para obtener un pedido específico por ID
 */
export const obtenerPedidoPorId = async (id: number): Promise<PedidoCompleto> => {
  try {
    const pedido = await getPedidoById(id);
    return pedido;
  } catch (error) {
    console.error('Error al obtener pedido por ID:', error);
    throw new Error(`No se pudo encontrar el pedido #${id}`);
  }
};

/**
 * Servicio para filtrar pedidos por estado
 */
export const filtrarPedidosPorEstado = (
  pedidos: PedidoCompleto[],
  estado: string
): PedidoCompleto[] => {
  if (!estado || estado === '') {
    return pedidos;
  }
  return pedidos.filter((pedido) => pedido.estado.nombre === estado);
};

/**
 * Servicio para buscar pedidos por ID
 */
export const buscarPedidosPorId = (
  pedidos: PedidoCompleto[],
  buscarId: string
): PedidoCompleto[] => {
  if (!buscarId || buscarId.trim() === '') {
    return pedidos;
  }
  return pedidos.filter((pedido) => pedido.id.toString().includes(buscarId.trim()));
};

/**
 * Validar si un estado es válido para transición
 */
export const validarTransicionEstado = (estadoActual: string, nuevoEstado: string): boolean => {
  const transicionesValidas: Record<string, string[]> = {
    PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
    CONFIRMADO: ['EN_PREPARACION', 'LISTO', 'CANCELADO'],
    EN_PREPARACION: ['LISTO', 'DEMORADO'],
    LISTO: ['EN_DELIVERY', 'ENTREGADO'],
    EN_DELIVERY: ['ENTREGADO'],
    DEMORADO: ['LISTO', 'CANCELADO'],
  };

  return transicionesValidas[estadoActual]?.includes(nuevoEstado) || false;
};
