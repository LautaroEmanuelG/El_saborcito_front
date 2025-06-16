// 🧠 Lógica de negocio para HU13 - Historial de Pedidos del Cliente

import { HistorialPedido, ESTADOS_PEDIDO, TIPOS_ENVIO, FORMAS_PAGO } from './Model';

export const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(precio);
};

export const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatearFechaConHora = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const obtenerEstiloEstado = (estado: string) => {
  return (
    ESTADOS_PEDIDO[estado] ?? {
      color: 'text-gray-800',
      bgColor: 'bg-gray-100',
      label: estado.replace(/_/g, ' '),
    }
  );
};

export const formatearTipoEnvio = (tipoEnvio: string): string => {
  return TIPOS_ENVIO[tipoEnvio as keyof typeof TIPOS_ENVIO] ?? tipoEnvio.replace(/_/g, ' ');
};

export const formatearFormaPago = (formaPago: string): string => {
  return FORMAS_PAGO[formaPago as keyof typeof FORMAS_PAGO] ?? formaPago.replace(/_/g, ' ');
};

export const ordenarPedidosPorFecha = (pedidos: HistorialPedido[]): HistorialPedido[] => {
  return [...pedidos].sort(
    (a, b) => new Date(b.pedido.fechaPedido).getTime() - new Date(a.pedido.fechaPedido).getTime()
  );
};

export const filtrarPedidosPorEstado = (
  pedidos: HistorialPedido[],
  estado?: string
): HistorialPedido[] => {
  if (!estado) return pedidos;
  return pedidos.filter((historial) => historial.pedido.estado === estado);
};

export const calcularTotalGastado = (pedidos: HistorialPedido[]): number => {
  return pedidos.reduce((total, historial) => total + historial.pedido.total, 0);
};
