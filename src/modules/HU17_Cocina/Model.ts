// Modelos y utilidades para el módulo de cocina

// IDs fijos de estados según especificación del backend
export const ESTADO_IDS = {
  PENDIENTE: 1,
  EN_PREPARACION: 3,
  LISTO: 4,
  DELIVERY: 5,
  ENTREGADO: 6,
  DEMORADO: 8,
} as const;

export type EstadoId = (typeof ESTADO_IDS)[keyof typeof ESTADO_IDS];
export type EstadoNombre =
  | 'PENDIENTE'
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
  [ESTADO_IDS.LISTO]: [ESTADO_IDS.DELIVERY, ESTADO_IDS.ENTREGADO],
  [ESTADO_IDS.DELIVERY]: [ESTADO_IDS.ENTREGADO],
  [ESTADO_IDS.ENTREGADO]: [], // Estado final
};

// Función para validar si una transición es válida (ahora solo informativa)
export function esTransicionValida(estadoActual: EstadoId, nuevoEstado: EstadoId): boolean {
  return TRANSICIONES_VALIDAS[estadoActual].includes(nuevoEstado);
}

// Función para obtener el nombre del estado por ID
export function getNombreEstado(estadoId: EstadoId): EstadoNombre {
  const estado = ESTADOS.find((e) => e.id === estadoId);
  if (estado) return estado.nombre;

  // Estados que no están en el Kanban pero existen en el sistema
  switch (estadoId) {
    case ESTADO_IDS.DELIVERY:
      return 'DELIVERY';
    case ESTADO_IDS.ENTREGADO:
      return 'ENTREGADO';
    default:
      return 'PENDIENTE';
  }
}

// Función para obtener el ID del estado por nombre
export function getIdEstado(estadoNombre: EstadoNombre): EstadoId {
  const estado = ESTADOS.find((e) => e.nombre === estadoNombre);
  if (estado) return estado.id;

  // Estados que no están en el Kanban
  switch (estadoNombre) {
    case 'DELIVERY':
      return ESTADO_IDS.DELIVERY;
    case 'ENTREGADO':
      return ESTADO_IDS.ENTREGADO;
    default:
      return ESTADO_IDS.PENDIENTE;
  }
}

// Función para obtener pedidos activos desde la API
export async function fetchPedidosActivos(): Promise<Pedido[]> {
  const res = await fetch('http://localhost:5252/api/cocina/pedidos/activos');
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al obtener pedidos activos: ${res.status} - ${errorText}`);
  }
  return res.json();
}

// Función para avanzar estado automáticamente con mejor manejo de errores
export async function avanzarEstadoPedido(pedidoId: number): Promise<Pedido> {
  const res = await fetch(`http://localhost:5252/api/cocina/pedidos/${pedidoId}/avanzar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    let errorMessage = `Error ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const errorText = await res.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(`Error al avanzar pedido #${pedidoId}: ${errorMessage}`);
  }

  return res.json();
}

// Función para cambiar estado específico con mejor manejo de errores
export async function updatePedidoEstado(
  pedidoId: number,
  nuevoEstadoId: EstadoId
): Promise<Pedido> {
  const res = await fetch(
    `http://localhost:5252/api/cocina/pedidos/${pedidoId}/estado-cocina?nuevoEstadoId=${nuevoEstadoId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    let errorMessage = `Error ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const errorText = await res.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(`Error al actualizar estado del pedido #${pedidoId}: ${errorMessage}`);
  }

  return res.json();
}

// Función legacy mantenida para compatibilidad (deprecada)
export async function fetchPedidos(): Promise<Pedido[]> {
  console.warn('⚠️ fetchPedidos() está deprecada. Usar fetchPedidosActivos() en su lugar.');
  return fetchPedidosActivos();
}
