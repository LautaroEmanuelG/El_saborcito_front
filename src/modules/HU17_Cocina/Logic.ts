// 🧠 Lógica auxiliar optimizada para el módulo de cocina

import { EstadoId, ESTADO_IDS } from './Model';
import {
  CONFIG,
  TRANSICIONES_PERMITIDAS,
  TRANSICIONES_AVANZAR,
  ACCIONES_POR_ESTADO,
  MENSAJES_ESTADO,
  NOMBRES_ESTADOS,
} from './constants';

/**
 * 🔄 Retry genérico para promesas con backoff exponencial
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries = CONFIG.RETRY_ATTEMPTS,
  delay = CONFIG.RETRY_DELAY
): Promise<T> => {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay * Math.pow(2, i))); // Backoff exponencial
      }
    }
  }
  throw lastError;
};

/**
 * ✅ Validación estricta de transiciones según las reglas del backend
 */
export const validarDragDrop = (
  estadoActual: EstadoId,
  nuevoEstado: EstadoId
): { valida: boolean; mensaje?: string } => {
  if (estadoActual === nuevoEstado) {
    return { valida: false, mensaje: 'El pedido ya está en ese estado' };
  }

  const transicionesPermitidas = TRANSICIONES_PERMITIDAS[estadoActual];
  if (!transicionesPermitidas?.includes(nuevoEstado)) {
    const nombreActual = NOMBRES_ESTADOS[estadoActual];
    const nombreNuevo = NOMBRES_ESTADOS[nuevoEstado];
    return {
      valida: false,
      mensaje: `No se puede cambiar de ${nombreActual} a ${nombreNuevo}`,
    };
  }

  return { valida: true };
};

/**
 * 🚀 Determina si debe usar endpoint /avanzar o /estado-cocina
 */
export const debeUsarAvanzar = (estadoActual: EstadoId, nuevoEstado: EstadoId): boolean => {
  return TRANSICIONES_AVANZAR.some(
    ([actual, siguiente]) => actual === estadoActual && siguiente === nuevoEstado
  );
};

/**
 * 🎮 Obtiene acciones disponibles para un estado
 */
export const getAccionesDisponibles = (estadoId: EstadoId): readonly string[] => {
  return ACCIONES_POR_ESTADO[estadoId] || [];
};

/**
 * 🎨 Obtiene animación para una transición específica
 */
export const getAnimacionParaTransicion = (
  estadoAnterior: EstadoId,
  nuevoEstado: EstadoId
): 'en-proceso' | 'demorado' | null => {
  if (estadoAnterior === ESTADO_IDS.PENDIENTE && nuevoEstado === ESTADO_IDS.EN_PREPARACION) {
    return 'en-proceso';
  }
  if (nuevoEstado === ESTADO_IDS.DEMORADO) {
    return 'demorado';
  }
  return null;
};

/**
 * 💬 Obtiene mensaje de acción según el estado
 */
export const getMensajeAccion = (estadoId: EstadoId): string => {
  return MENSAJES_ESTADO[estadoId] || 'Avanzar estado';
};

/**
 * 🏃‍♂️ Determina si un pedido debe salir del Kanban de cocina
 */
export const debeSalirDelKanban = (estadoId: EstadoId): boolean => {
  return estadoId === ESTADO_IDS.DELIVERY || estadoId === ESTADO_IDS.ENTREGADO;
};

/**
 * ⏰ Formatear tiempo estimado (helper de tiempo)
 */
export const formatearTiempoEstimado = (tiempo: string): string => {
  try {
    if (!tiempo) return 'Sin tiempo';

    // Si contiene millisegundos (ej: 12:11:17.067)
    if (tiempo.includes('.')) {
      const [hms] = tiempo.split('.');
      const [horas, minutos] = hms.split(':');
      return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
    }

    // Si es formato HH:MM:SS
    if (tiempo.split(':').length === 3) {
      const [horas, minutos] = tiempo.split(':');
      return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
    }

    // Si ya es HH:MM
    const [horas, minutos] = tiempo.split(':');
    return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
  } catch {
    return 'Formato inválido';
  }
};

/**
 * ⏱️ Calcular tiempo transcurrido (útil para delivery)
 */
export const calcularTiempoTranscurrido = (horaInicio: string): number => {
  try {
    const ahora = new Date();
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const inicio = new Date();
    inicio.setHours(horas, minutos, 0, 0);

    return Math.floor((ahora.getTime() - inicio.getTime()) / (1000 * 60)); // Minutos
  } catch {
    return 0;
  }
};
