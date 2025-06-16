// 📊 Modelos para HU13 - Historial de Pedidos del Cliente

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export interface PedidoResumen {
  id: number;
  fechaPedido: string;
  horasEstimadaFinalizacion: string;
  total: number;
  estado: string;
  tipoEnvio: string;
  formaPago: string;
  sucursal: string;
  cantidadArticulos: number;
}

export interface HistorialPedido {
  id: number;
  fechaRegistro: string;
  observacion: string;
  cliente: Cliente;
  pedido: PedidoResumen;
}

export interface EstadoPedido {
  [key: string]: {
    color: string;
    bgColor: string;
    label: string;
  };
}

export const ESTADOS_PEDIDO: EstadoPedido = {
  PENDIENTE: {
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    label: 'Pendiente',
  },
  EN_COCINA: {
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    label: 'En Cocina',
  },
  LISTO: {
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    label: 'Listo',
  },
  EN_DELIVERY: {
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    label: 'En Delivery',
  },
  ENTREGADO: {
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    label: 'Entregado',
  },
  CANCELADO: {
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    label: 'Cancelado',
  },
};

export const TIPOS_ENVIO = {
  DELIVERY: 'Delivery',
  TAKE_AWAY: 'Take Away',
  EN_LOCAL: 'En Local',
};

export const FORMAS_PAGO = {
  EFECTIVO: 'Efectivo',
  MERCADO_PAGO: 'Mercado Pago',
  TARJETA: 'Tarjeta',
};
