// Lógica auxiliar para el módulo de cocina

import { EstadoId, ESTADO_IDS, esTransicionValida, getNombreEstado } from './Model';

// Retry genérico para promesas
export async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError;
}

// Validación estricta según las reglas del backend
export function validarDragDrop(
  estadoActual: EstadoId,
  nuevoEstado: EstadoId
): { valida: boolean; mensaje?: string } {
  if (estadoActual === nuevoEstado) {
    return { valida: false, mensaje: 'El pedido ya está en ese estado' };
  }

  // Validaciones exactas del backend
  switch (estadoActual) {
    case ESTADO_IDS.PENDIENTE:
      // PENDIENTE puede ir a EN_PREPARACION o DEMORADO
      if (nuevoEstado !== ESTADO_IDS.EN_PREPARACION && nuevoEstado !== ESTADO_IDS.DEMORADO) {
        return {
          valida: false,
          mensaje: 'Desde PENDIENTE solo puede ir a EN_PREPARACION o DEMORADO',
        };
      }
      break;

    case ESTADO_IDS.EN_PREPARACION:
      // EN_PREPARACION puede ir a LISTO o DEMORADO
      if (nuevoEstado !== ESTADO_IDS.LISTO && nuevoEstado !== ESTADO_IDS.DEMORADO) {
        return {
          valida: false,
          mensaje: 'Desde EN_PREPARACION solo puede ir a LISTO o DEMORADO',
        };
      }
      break;

    case ESTADO_IDS.DEMORADO:
      // DEMORADO puede ir a LISTO
      if (nuevoEstado !== ESTADO_IDS.LISTO) {
        return {
          valida: false,
          mensaje: 'Desde DEMORADO solo puede ir a LISTO',
        };
      }
      break;

    case ESTADO_IDS.LISTO:
      // LISTO puede ir a DELIVERY o ENTREGADO (pero no se muestran en el Kanban)
      if (nuevoEstado !== ESTADO_IDS.DELIVERY && nuevoEstado !== ESTADO_IDS.ENTREGADO) {
        return {
          valida: false,
          mensaje: 'Desde LISTO solo puede ir a DELIVERY o ENTREGADO',
        };
      }
      break;

    case ESTADO_IDS.DELIVERY:
    case ESTADO_IDS.ENTREGADO:
      // Estos estados no deberían aparecer en el Kanban de cocina
      return {
        valida: false,
        mensaje: 'Este pedido ya no está en cocina',
      };

    default:
      return {
        valida: false,
        mensaje: 'Estado no válido',
      };
  }

  return { valida: true };
}

// Helper para determinar si una transición debe usar /avanzar o /estado-cocina
export function debeUsarAvanzar(estadoActual: EstadoId, nuevoEstado: EstadoId): boolean {
  // Usar /avanzar para flujo normal hacia adelante:
  // PENDIENTE → EN_PREPARACION (flujo normal)
  // EN_PREPARACION → LISTO (flujo normal)
  // DEMORADO → LISTO (flujo normal)

  const transicionesAvanzar = [
    // Desde PENDIENTE a EN_PREPARACION (flujo normal)
    [ESTADO_IDS.PENDIENTE, ESTADO_IDS.EN_PREPARACION],

    // Desde EN_PREPARACION a LISTO (flujo normal)
    [ESTADO_IDS.EN_PREPARACION, ESTADO_IDS.LISTO],

    // Desde DEMORADO a LISTO (flujo normal)
    [ESTADO_IDS.DEMORADO, ESTADO_IDS.LISTO],

    // Desde LISTO a delivery/entrega (flujo normal)
    [ESTADO_IDS.LISTO, ESTADO_IDS.DELIVERY],
    [ESTADO_IDS.LISTO, ESTADO_IDS.ENTREGADO],
  ];

  return transicionesAvanzar.some(
    ([actual, siguiente]) => actual === estadoActual && siguiente === nuevoEstado
  );
}

// Helper para determinar qué acciones están disponibles para un estado
export function getAccionesDisponibles(estadoId: EstadoId): string[] {
  switch (estadoId) {
    case ESTADO_IDS.PENDIENTE:
      return ['avanzar_automatico', 'marcar_demorado'];
    case ESTADO_IDS.EN_PREPARACION:
      return ['completar', 'marcar_demorado', 'agregar_tiempo'];
    case ESTADO_IDS.DEMORADO:
      return ['completar'];
    case ESTADO_IDS.LISTO:
      return []; // Ya no se puede modificar desde cocina
    case ESTADO_IDS.DELIVERY:
      return ['marcar_entregado'];
    case ESTADO_IDS.ENTREGADO:
      return []; // Estado final
    default:
      return [];
  }
}

// Helper para obtener el color de animación según la transición
export function getAnimacionParaTransicion(
  estadoAnterior: EstadoId,
  nuevoEstado: EstadoId
): 'en-proceso' | 'demorado' | null {
  // PENDIENTE → EN_PREPARACION
  if (estadoAnterior === ESTADO_IDS.PENDIENTE && nuevoEstado === ESTADO_IDS.EN_PREPARACION) {
    return 'en-proceso';
  }

  // Cualquier transición a DEMORADO
  if (nuevoEstado === ESTADO_IDS.DEMORADO) {
    return 'demorado';
  }

  return null;
}

// Helper para determinar el mensaje de acción según el estado
export function getMensajeAccion(estadoId: EstadoId): string {
  switch (estadoId) {
    case ESTADO_IDS.PENDIENTE:
      return 'Iniciar preparación';
    case ESTADO_IDS.EN_PREPARACION:
      return 'Completar pedido';
    case ESTADO_IDS.DEMORADO:
      return 'Completar pedido';
    case ESTADO_IDS.LISTO:
      return 'Pedido finalizado';
    case ESTADO_IDS.DELIVERY:
      return 'Marcar como entregado';
    default:
      return 'Avanzar estado';
  }
}

// Helper para formatear tiempo estimado
export function formatearTiempoEstimado(tiempo: string): string {
  try {
    // Asumiendo formato HH:MM
    const [horas, minutos] = tiempo.split(':');
    return `${horas}:${minutos}`;
  } catch {
    return tiempo;
  }
}

// Helper para calcular tiempo transcurrido (útil para delivery)
export function calcularTiempoTranscurrido(horaInicio: string): number {
  try {
    const ahora = new Date();
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const inicio = new Date();
    inicio.setHours(horas, minutos, 0, 0);

    return Math.floor((ahora.getTime() - inicio.getTime()) / (1000 * 60)); // Minutos
  } catch {
    return 0;
  }
}

// Helper para refrescar pedidos después de cambios de estado
export function debeSalirDelKanban(estadoId: EstadoId): boolean {
  // Los pedidos que pasan a DELIVERY o ENTREGADO ya no aparecen en cocina
  return estadoId === ESTADO_IDS.DELIVERY || estadoId === ESTADO_IDS.ENTREGADO;
}

// Aquí puedes agregar más lógica de negocio o utilidades para el módulo de cocina
