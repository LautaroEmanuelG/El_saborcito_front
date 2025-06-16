import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada
import { getDetallePedidosCliente } from './clientesInformes';
import type { PedidoResumenPorCliente } from '../../modules/HU26_28_informes/model';

const API_BASE_URL = '/pedidos';

export interface DetallePedido {
  cantidad: number;
  articuloId: number;
}

export interface PromocionSeleccionada {
  promocionId: number;
  cantidad: number;
}

export interface DomicilioPedido {
  calle: string;
  numero: number;
  cp: string;
  latitud: number;
  longitud: number;
  localidadId: number;
}

export interface CreatePedidoRequest {
  clienteId: number;
  tipoEnvioId: number;
  formaPagoId: number;
  sucursalId: number;
  domicilio?: DomicilioPedido;
  detalles: DetallePedido[];
  promocionesSeleccionadas?: PromocionSeleccionada[];
}

/**
 * Crear un nuevo pedido
 */
export const createPedido = async (data: CreatePedidoRequest) => {
  const response = await axiosInstance.post(`${API_BASE_URL}`, data);
  return response.data;
};

export const getAllPedidos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

export const getPedidoById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const savePedido = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deletePedido = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

/**
 * Actualizar el estado de un pedido
 */
export const updateEstadoPedido = async (pedidoId: number, nuevoEstado: string) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/${pedidoId}/estado?nuevoEstado=${nuevoEstado}`
  );
  return response.data;
};

/**
 * Obtener pedidos filtrados por estado
 */
export const getPedidosByEstado = async (estado: string) => {
  const response = await axiosInstance.get(`${API_BASE_URL}?estado=${estado}`);
  return response.data;
};

/**
 * Obtener detalles completos de pedidos con información de promociones y artículos
 * desde el endpoint /sucursales/pedidos-cliente
 */
export const getPedidosDetalladosCompletos = async () => {
  try {
    // Primero obtenemos todos los pedidos
    const pedidos = await getAllPedidos();

    const pedidosDetallados = [];

    for (const pedido of pedidos) {
      if (pedido.cliente?.id) {
        try {
          // Obtener detalles específicos del cliente para el pedido
          const fechaPedido = new Date(pedido.fechaPedido).toISOString().split('T')[0];
          const fechaFin = new Date(pedido.fechaPedido);
          fechaFin.setDate(fechaFin.getDate() + 1);
          const fechaFinStr = fechaFin.toISOString().split('T')[0];

          const detallesCliente = await getDetallePedidosCliente(
            pedido.cliente.id,
            fechaPedido,
            fechaFinStr
          );

          // Buscar el pedido específico en los detalles
          const pedidoDetallado = detallesCliente.find(
            (detalle: PedidoResumenPorCliente) => detalle.idPedido === pedido.id
          );

          if (pedidoDetallado) {
            // Combinar datos del pedido original con los detalles
            pedidosDetallados.push({
              ...pedido,
              detallesCompletos: pedidoDetallado.detalles,
              totalCalculado: pedidoDetallado.total,
            });
          } else {
            // Si no se encuentra en los detalles, usar el pedido original
            pedidosDetallados.push(pedido);
          }
        } catch (error) {
          console.warn(`Error obteniendo detalles para pedido ${pedido.id}:`, error);
          pedidosDetallados.push(pedido);
        }
      } else {
        pedidosDetallados.push(pedido);
      }
    }

    return pedidosDetallados;
  } catch (error) {
    console.error('Error en getPedidosDetalladosCompletos:', error);
    // Fallback al método original si hay error
    return getAllPedidos();
  }
};
