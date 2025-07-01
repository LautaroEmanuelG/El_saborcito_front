// 🍳 Modelos y constantes para el módulo de cocina

// IDs fijos de estados según especificación del backend
export const ESTADO_IDS = {
  A_CONFIRMAR: 1,
  CANCELADO: 7,
  CONFIRMADO: 9,
  DEMORADO: 3,
  EN_DELIVERY: 5,
  EN_PREPARACION: 2,
  ENTREGADO: 6,
  LISTO: 4,
  PENDIENTE: 8,
} as const;

export type EstadoId = (typeof ESTADO_IDS)[keyof typeof ESTADO_IDS];
export type EstadoNombre =
  | 'PENDIENTE'
  | 'EN_COCINA'
  | 'EN_PREPARACION'
  | 'LISTO'
  | 'DELIVERY'
  | 'ENTREGADO'
  | 'DEMORADO';

export interface Estado {
  id: number;
  nombre: EstadoNombre;
}

export interface DetallePedido {
  cantidad: number;
  articulo: {
    denominacion: string;
  };
}

export interface Pedido {
  id: number;
  estado: Estado;
  horasEstimadaFinalizacion: string;
  detalles: DetallePedido[];
  fechaPedido?: string;
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  total?: number;
  totalCosto?: number;
}

// Interfaces para el Historial de Cocina
export interface PedidoDTO {
  id: number;
  fechaPedido: string;
  cliente: {
    nombre: string;
    apellido: string;
  };
  detalles: {
    cantidad: number;
    articulo: {
      denominacion: string;
    };
  }[];
  estado: {
    id: number;
    nombre: string;
  };
  horasEstimadaFinalizacion: string;
}

export interface IngredienteDTO {
  nombre: string;
  cantidad: number;
  unidadMedida: string;
}

export interface DetalleConRecetaDTO {
  articuloNombre: string;
  cantidad: number;
  esManufacturado: boolean;
  receta: IngredienteDTO[];
}

export interface PedidoConRecetasDTO {
  id: number;
  fecha: string;
  cliente: string;
  detalles: DetalleConRecetaDTO[];
}

// Constantes de estados y colores para el Kanban (solo estados de cocina)
export const ESTADOS: { id: EstadoId; nombre: EstadoNombre; title: string; color: string }[] = [
  { id: ESTADO_IDS.PENDIENTE, nombre: 'PENDIENTE', title: 'Pendiente', color: '#334FFF' },
  {
    id: ESTADO_IDS.EN_PREPARACION,
    nombre: 'EN_PREPARACION',
    title: 'En Proceso',
    color: '#EB9417',
  },
  { id: ESTADO_IDS.DEMORADO, nombre: 'DEMORADO', title: 'Demorado', color: '#EB1741' },
  { id: ESTADO_IDS.LISTO, nombre: 'LISTO', title: 'Listo', color: '#60AF29' },
];

// Validaciones de flujo de estados (simplificadas, el backend maneja la lógica)
export const TRANSICIONES_VALIDAS: Record<EstadoId, EstadoId[]> = {
  [ESTADO_IDS.PENDIENTE]: [ESTADO_IDS.EN_PREPARACION, ESTADO_IDS.LISTO, ESTADO_IDS.DEMORADO],
  [ESTADO_IDS.EN_PREPARACION]: [ESTADO_IDS.LISTO, ESTADO_IDS.DEMORADO],
  [ESTADO_IDS.DEMORADO]: [ESTADO_IDS.LISTO],
  [ESTADO_IDS.LISTO]: [ESTADO_IDS.EN_DELIVERY, ESTADO_IDS.ENTREGADO],
  [ESTADO_IDS.EN_DELIVERY]: [ESTADO_IDS.ENTREGADO],
  [ESTADO_IDS.ENTREGADO]: [],
  [ESTADO_IDS.A_CONFIRMAR]: [],
  [ESTADO_IDS.CANCELADO]: [],
  [ESTADO_IDS.CONFIRMADO]: [],
};

// Función para validar si una transición es válida (ahora solo informativa)
export const esTransicionValida = (estadoActual: EstadoId, nuevoEstado: EstadoId): boolean => {
  return TRANSICIONES_VALIDAS[estadoActual].includes(nuevoEstado);
};

// Función para obtener el nombre del estado por ID
export const getNombreEstado = (estadoId: EstadoId): EstadoNombre => {
  const estado = ESTADOS.find((e) => e.id === estadoId);
  if (estado) return estado.nombre;

  // Estados que no están en el Kanban pero existen en el sistema
  switch (estadoId) {
    case ESTADO_IDS.EN_DELIVERY:
      return 'DELIVERY';
    case ESTADO_IDS.ENTREGADO:
      return 'ENTREGADO';
    default:
      return 'PENDIENTE';
  }
};

// Función para obtener el ID del estado por nombre
export const getIdEstado = (estadoNombre: EstadoNombre): EstadoId => {
  const estado = ESTADOS.find((e) => e.nombre === estadoNombre);
  if (estado) return estado.id;

  // Estados que no están en el Kanban
  switch (estadoNombre) {
    case 'DELIVERY':
      return ESTADO_IDS.EN_DELIVERY;
    case 'ENTREGADO':
      return ESTADO_IDS.ENTREGADO;
    default:
      return ESTADO_IDS.PENDIENTE;
  }
};

// 📝 IMPORTANTE: Las funciones de API están en service/cocinaService.ts
// Para usar los servicios:
// import { fetchPedidosActivos, avanzarEstadoPedido, updatePedidoEstado, updateTiempoEstimado } from './service/cocinaService';
