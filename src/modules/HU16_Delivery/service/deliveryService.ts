// 🚚 **SERVICIOS ESPECÍFICOS PARA DELIVERY**

import { getAllPedidos, updateEstadoPedido } from '../../../shared/services/pedidoService';
import { PedidoCompleto } from '../../../types/Pedido';
import { ESTADO_DELIVERY, ESTADO_ENTREGADO } from '../Model';

/**
 * Servicio para obtener pedidos en estado EN_DELIVERY
 */
export const obtenerPedidosDelivery = async (): Promise<PedidoCompleto[]> => {
  try {
    const todosPedidos: PedidoCompleto[] = await getAllPedidos();
    return todosPedidos.filter(
      (pedido: PedidoCompleto) => pedido.estado.nombre === ESTADO_DELIVERY
    );
  } catch (error) {
    console.error('Error al obtener pedidos de delivery:', error);
    throw new Error('No se pudieron cargar los pedidos de delivery');
  }
};

/**
 * Servicio para marcar un pedido como entregado
 */
export const marcarPedidoComoEntregado = async (pedidoId: number): Promise<void> => {
  try {
    await updateEstadoPedido(pedidoId, ESTADO_ENTREGADO);
  } catch (error) {
    console.error('Error al marcar pedido como entregado:', error);
    throw new Error(`No se pudo marcar el pedido #${pedidoId} como entregado`);
  }
};

/**
 * Validar si un pedido puede ser marcado como entregado
 */
export const puedeMarcarComoEntregado = (pedido: PedidoCompleto): boolean => {
  return pedido.estado.nombre === ESTADO_DELIVERY;
};

/**
 * Obtener información de contacto del cliente
 */
export const obtenerContactoCliente = (pedido: PedidoCompleto) => {
  return {
    nombre: `${pedido.cliente.nombre} ${pedido.cliente.apellido}`,
    telefono: pedido.cliente.telefono,
    email: pedido.cliente.email,
  };
};

/**
 * Validar si un pedido tiene información de dirección completa
 */
export const tieneInformacionDireccion = (pedido: PedidoCompleto): boolean => {
  if (!pedido.cliente.domicilios || pedido.cliente.domicilios.length === 0) {
    return false;
  }

  const domicilio = pedido.cliente.domicilios[0];
  return !!(domicilio.calle && domicilio.numero && domicilio.localidad);
};

/**
 * Obtener coordenadas para el mapa
 */
export const obtenerCoordenadasPedido = (
  pedido: PedidoCompleto
): { lat: number; lng: number } | null => {
  const domicilioConCoordenadas = pedido.cliente.domicilios?.find((d) => d.latitud && d.longitud);

  if (
    domicilioConCoordenadas &&
    domicilioConCoordenadas.latitud &&
    domicilioConCoordenadas.longitud
  ) {
    return {
      lat: domicilioConCoordenadas.latitud,
      lng: domicilioConCoordenadas.longitud,
    };
  }

  return null;
};
