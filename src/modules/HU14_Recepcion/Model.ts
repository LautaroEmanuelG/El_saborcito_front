// 📋 **TIPOS Y MODELOS PARA RECEPCIÓN DE PEDIDOS**

import { PedidoCompleto } from '../../types/Pedido';

// Estados del flujo de pedidos
export const ESTADOS_PEDIDO = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADO: 'CONFIRMADO',
  EN_PREPARACION: 'EN_PREPARACION',
  LISTO: 'LISTO',
  EN_DELIVERY: 'EN_DELIVERY',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
  DEMORADO: 'DEMORADO',
} as const;

// Flujo de estados permitido
export const FLUJO_ESTADOS: Record<string, string[]> = {
  [ESTADOS_PEDIDO.PENDIENTE]: [ESTADOS_PEDIDO.CONFIRMADO, ESTADOS_PEDIDO.CANCELADO],
  [ESTADOS_PEDIDO.CONFIRMADO]: [
    ESTADOS_PEDIDO.EN_PREPARACION,
    ESTADOS_PEDIDO.LISTO,
    ESTADOS_PEDIDO.CANCELADO,
  ],
  [ESTADOS_PEDIDO.EN_PREPARACION]: [ESTADOS_PEDIDO.LISTO, ESTADOS_PEDIDO.DEMORADO],
  [ESTADOS_PEDIDO.LISTO]: [ESTADOS_PEDIDO.EN_DELIVERY, ESTADOS_PEDIDO.ENTREGADO],
  [ESTADOS_PEDIDO.EN_DELIVERY]: [ESTADOS_PEDIDO.ENTREGADO],
  [ESTADOS_PEDIDO.DEMORADO]: [ESTADOS_PEDIDO.LISTO, ESTADOS_PEDIDO.CANCELADO],
};

// Configuración de estados
export const ESTADO_CONFIG = {
  [ESTADOS_PEDIDO.PENDIENTE]: {
    color: 'yellow',
    icon: '⏳',
    descripcion: 'Esperando confirmación',
    prioridad: 1,
  },
  [ESTADOS_PEDIDO.CONFIRMADO]: {
    color: 'blue',
    icon: '✅',
    descripcion: 'Confirmado, listo para procesar',
    prioridad: 2,
  },
  [ESTADOS_PEDIDO.EN_PREPARACION]: {
    color: 'orange',
    icon: '👨‍🍳',
    descripcion: 'En preparación en cocina',
    prioridad: 3,
  },
  [ESTADOS_PEDIDO.LISTO]: {
    color: 'green',
    icon: '🍽️',
    descripcion: 'Listo para entrega',
    prioridad: 4,
  },
  [ESTADOS_PEDIDO.EN_DELIVERY]: {
    color: 'purple',
    icon: '🚚',
    descripcion: 'En camino al cliente',
    prioridad: 5,
  },
  [ESTADOS_PEDIDO.ENTREGADO]: {
    color: 'gray',
    icon: '📦',
    descripcion: 'Entregado exitosamente',
    prioridad: 6,
  },
  [ESTADOS_PEDIDO.CANCELADO]: {
    color: 'red',
    icon: '❌',
    descripcion: 'Pedido cancelado',
    prioridad: 0,
  },
  [ESTADOS_PEDIDO.DEMORADO]: {
    color: 'red',
    icon: '⚠️',
    descripcion: 'Pedido demorado',
    prioridad: 3,
  },
};

// Tipos de envío
export const TIPOS_ENVIO = {
  DELIVERY: 'DELIVERY',
  TAKE_AWAY: 'TAKE_AWAY',
  EN_LOCAL: 'EN_LOCAL',
} as const;

// Formas de pago
export const FORMAS_PAGO = {
  EFECTIVO: 'EFECTIVO',
  MERCADO_PAGO: 'MERCADO_PAGO',
  TARJETA: 'TARJETA',
} as const;

// Filtros para la tabla
export interface FiltrosRecepcion {
  estado: string;
  buscarId: string;
  tipoEnvio?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Resumen de estadísticas
export interface EstadisticasRecepcion {
  totalPedidos: number;
  pendientes: number;
  enPreparacion: number;
  listos: number;
  enDelivery: number;
  entregados: number;
  cancelados: number;
  totalVentas: number;
}

// Funciones auxiliares
export const obtenerConfigEstado = (estado: string) => {
  return ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG] || ESTADO_CONFIG.PENDIENTE;
};

export const puedeTransicionarA = (estadoActual: string, estadoDestino: string): boolean => {
  const transicionesPermitidas = FLUJO_ESTADOS[estadoActual] || [];
  return transicionesPermitidas.includes(estadoDestino);
};

export const obtenerEstadosPermitidos = (estadoActual: string): string[] => {
  return FLUJO_ESTADOS[estadoActual] || [];
};

export const formatearEstadoParaMostrar = (estado: string): string => {
  return estado
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const calcularEstadisticas = (pedidos: PedidoCompleto[]): EstadisticasRecepcion => {
  return {
    totalPedidos: pedidos.length,
    pendientes: pedidos.filter((p) => p.estado.nombre === ESTADOS_PEDIDO.PENDIENTE).length,
    enPreparacion: pedidos.filter((p) => p.estado.nombre === ESTADOS_PEDIDO.EN_PREPARACION).length,
    listos: pedidos.filter((p) => p.estado.nombre === ESTADOS_PEDIDO.LISTO).length,
    enDelivery: pedidos.filter((p) => p.estado.nombre === ESTADOS_PEDIDO.EN_DELIVERY).length,
    entregados: pedidos.filter((p) => p.estado.nombre === ESTADOS_PEDIDO.ENTREGADO).length,
    cancelados: pedidos.filter((p) => p.estado.nombre === ESTADOS_PEDIDO.CANCELADO).length,
    totalVentas: pedidos
      .filter((p) => p.estado.nombre === ESTADOS_PEDIDO.ENTREGADO)
      .reduce((sum, p) => sum + p.total, 0),
  };
};
