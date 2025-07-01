// 🔧 Constantes optimizadas para el módulo de cocina

import { EstadoId, ESTADO_IDS } from './Model';

/**
 * ⚡ Configuración de timeouts y reintentos
 */
export const CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 500,
  ANIMATION_DURATION: 2000,
  ALERT_TIMEOUT: 4000,
  DRAG_DISTANCE: 3,
} as const;

/**
 * 🎨 Configuración de estilos por estado
 */
export const ESTILOS_ESTADOS = {
  [ESTADO_IDS.PENDIENTE]: {
    color: '#334FFF',
    bgClass: 'bg-blue-50',
    borderClass: 'border-l-blue-500',
    badgeClass: 'bg-blue-200 text-blue-800',
    buttonClass: 'bg-blue-500 hover:bg-blue-600',
  },
  [ESTADO_IDS.EN_PREPARACION]: {
    color: '#EB9417',
    bgClass: 'bg-orange-50',
    borderClass: 'border-l-orange-500',
    badgeClass: 'bg-orange-200 text-orange-800',
    buttonClass: 'bg-orange-500 hover:bg-orange-600',
  },
  [ESTADO_IDS.DEMORADO]: {
    color: '#EB1741',
    bgClass: 'bg-red-50',
    borderClass: 'border-l-red-500',
    badgeClass: 'bg-red-200 text-red-800',
    buttonClass: 'bg-green-500 hover:bg-green-600',
  },
  [ESTADO_IDS.LISTO]: {
    color: '#60AF29',
    bgClass: 'bg-green-50',
    borderClass: 'border-l-green-500',
    badgeClass: 'bg-green-200 text-green-800',
    buttonClass: 'bg-primary hover:bg-primarydark',
  },
  [ESTADO_IDS.EN_COCINA]: {
    color: '#EB9417',
    bgClass: 'bg-orange-50',
    borderClass: 'border-l-orange-500',
    badgeClass: 'bg-orange-200 text-orange-800',
    buttonClass: 'bg-orange-500 hover:bg-orange-600',
  },
} as const;

/**
 * 🎯 Mensajes de estado optimizados
 */
export const MENSAJES_ESTADO: Record<EstadoId, string> = {
  [ESTADO_IDS.PENDIENTE]: 'Iniciar preparación',
  [ESTADO_IDS.EN_PREPARACION]: 'Completar pedido',
  [ESTADO_IDS.DEMORADO]: 'Completar pedido',
  [ESTADO_IDS.LISTO]: 'Pedido finalizado',
  [ESTADO_IDS.DELIVERY]: 'Marcar como entregado',
  [ESTADO_IDS.ENTREGADO]: 'Entregado',
  [ESTADO_IDS.EN_COCINA]: 'Completar pedido',
};

/**
 * 🚀 Transiciones automáticas que usan /avanzar
 */
export const TRANSICIONES_AVANZAR: ReadonlyArray<readonly [EstadoId, EstadoId]> = [
  [ESTADO_IDS.PENDIENTE, ESTADO_IDS.EN_PREPARACION],
  [ESTADO_IDS.EN_PREPARACION, ESTADO_IDS.LISTO],
  [ESTADO_IDS.DEMORADO, ESTADO_IDS.LISTO],
  [ESTADO_IDS.LISTO, ESTADO_IDS.DELIVERY],
  [ESTADO_IDS.LISTO, ESTADO_IDS.ENTREGADO],
] as const;

/**
 * ✅ Matriz de transiciones válidas
 */
export const TRANSICIONES_PERMITIDAS: Record<EstadoId, readonly EstadoId[]> = {
  [ESTADO_IDS.PENDIENTE]: [ESTADO_IDS.EN_PREPARACION, ESTADO_IDS.DEMORADO],
  [ESTADO_IDS.EN_PREPARACION]: [ESTADO_IDS.LISTO, ESTADO_IDS.DEMORADO],
  [ESTADO_IDS.DEMORADO]: [ESTADO_IDS.LISTO],
  [ESTADO_IDS.LISTO]: [ESTADO_IDS.DELIVERY, ESTADO_IDS.ENTREGADO],
  [ESTADO_IDS.DELIVERY]: [ESTADO_IDS.ENTREGADO],
  [ESTADO_IDS.ENTREGADO]: [], // Estado final
  [ESTADO_IDS.EN_COCINA]: [], // Estado final
} as const;

/**
 * 🎮 Acciones disponibles por estado
 */
export const ACCIONES_POR_ESTADO: Record<EstadoId, readonly string[]> = {
  [ESTADO_IDS.PENDIENTE]: ['avanzar_automatico', 'marcar_demorado'],
  [ESTADO_IDS.EN_PREPARACION]: ['completar', 'marcar_demorado', 'agregar_tiempo'],
  [ESTADO_IDS.DEMORADO]: ['completar', 'agregar_tiempo'],
  [ESTADO_IDS.LISTO]: [], // Ya no se puede modificar desde cocina
  [ESTADO_IDS.DELIVERY]: ['marcar_entregado'],
  [ESTADO_IDS.ENTREGADO]: [], // Estado final
  [ESTADO_IDS.EN_COCINA]: ['completar', 'marcar_demorado', 'agregar_tiempo'],
} as const;

/**
 * 📝 Nombres de estados para mostrar al usuario
 */
export const NOMBRES_ESTADOS: Record<EstadoId, string> = {
  [ESTADO_IDS.PENDIENTE]: 'Pendiente',
  [ESTADO_IDS.EN_PREPARACION]: 'En Preparación',
  [ESTADO_IDS.DEMORADO]: 'Demorado',
  [ESTADO_IDS.LISTO]: 'Listo',
  [ESTADO_IDS.DELIVERY]: 'Delivery',
  [ESTADO_IDS.ENTREGADO]: 'Entregado',
  [ESTADO_IDS.EN_COCINA]: 'En Cocina',
} as const;
