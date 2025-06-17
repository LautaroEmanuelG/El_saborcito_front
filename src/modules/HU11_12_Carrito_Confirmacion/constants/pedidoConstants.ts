// 🎯 Constantes para el sistema de pedidos y pagos

// IDs por defecto (pueden ser configurables desde variables de entorno)
export const DEFAULT_VALUES = {
  CLIENTE_ID: 5,
  SUCURSAL_ID: 1,
  LOCALIDAD_ID: 1,
  TIEMPO_ESTIMADO_DEFAULT: 45, // minutos
  DESCUENTO_RETIRO: 0.1, // 10%
} as const;

// Tipos de envío
export const TIPO_ENVIO = {
  RETIRO: 1,
  DOMICILIO: 2,
} as const;

// Constantes para domicilio por defecto
export const DOMICILIO_DEFAULT = {
  NUMERO: 123,
  CP: '5500',
} as const;

// Mapeo de iconos para formas de pago
export const FORMA_PAGO_ICONS = {
  EFECTIVO: '💵',
  MERCADO_PAGO: '💳',
  TARJETA: '💳',
  TRANSFERENCIA: '🏦',
  DEFAULT: '💰',
} as const;

// Mapeo de nombres amigables para formas de pago
export const FORMA_PAGO_LABELS = {
  EFECTIVO: 'Efectivo',
  MERCADO_PAGO: 'Mercado Pago',
  TARJETA: 'Tarjeta de Crédito/Débito',
  TRANSFERENCIA: 'Transferencia Bancaria',
} as const;

// Formas de pago por defecto (fallback)
export const FORMAS_PAGO_FALLBACK = [
  { id: 1, nombre: 'EFECTIVO' },
  { id: 2, nombre: 'MERCADO_PAGO' },
] as const;

// Estilos CSS reutilizables
export const BUTTON_STYLES = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-gray-400 text-white hover:bg-gray-500',
  disabled: 'bg-gray-400 text-gray-600 cursor-not-allowed',
  base: 'px-8 py-3 rounded-lg font-semibold text-lg transition-colors',
} as const;

export const ALERT_STYLES = {
  success: 'bg-green-50 border-green-200 text-green-700',
  warning: 'bg-orange-50 border-orange-200 text-orange-700',
  error: 'bg-red-50 border-red-200 text-red-700',
  base: 'mt-2 p-2 border rounded-lg',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
} as const;
