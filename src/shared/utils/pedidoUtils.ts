import {
  FORMA_PAGO_ICONS,
  FORMA_PAGO_LABELS,
} from '../../modules/HU11_12_Carrito_Confirmacion/constants/pedidoConstants';

/**
 * Obtener ícono según el nombre de la forma de pago
 */
export const getIconoFormaPago = (nombre: string): string => {
  const key = nombre.toUpperCase() as keyof typeof FORMA_PAGO_ICONS;
  return FORMA_PAGO_ICONS[key] || FORMA_PAGO_ICONS.DEFAULT;
};

/**
 * Formatear el nombre de la forma de pago para mostrar
 */
export const formatearNombreFormaPago = (nombre: string): string => {
  const key = nombre.toUpperCase() as keyof typeof FORMA_PAGO_LABELS;
  return FORMA_PAGO_LABELS[key] || nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
};

/**
 * Verificar si hay items en el carrito (productos o promociones)
 */
export const tieneItemsEnCarrito = (carrito: any[], promociones: any[]): boolean => {
  return carrito.length > 0 || promociones.length > 0;
};

/**
 * Calcular tiempo estimado máximo de productos manufacturados
 */
export const calcularTiempoEstimadoMaximo = (
  carrito: any[],
  tiempoDefault: number = 45
): number => {
  const productosManufacturados = carrito.filter(
    (item) => 'categoriaId' in item && 'descripcion' in item
  );

  if (productosManufacturados.length === 0) return tiempoDefault;

  const tiemposEstimados = productosManufacturados.map(
    (producto) => producto.tiempoEstimadoMinutos || tiempoDefault
  );

  return Math.max(...tiemposEstimados);
};

/**
 * Extraer dirección desde información de ubicación
 */
export const extraerDireccionDeUbicacion = (ubicacionInfo: any): string => {
  return ubicacionInfo?.direccion?.split(',')[0]?.trim() || 'Dirección seleccionada';
};

/**
 * Generar clases CSS combinadas
 */
export const combinarClases = (...clases: (string | undefined | false)[]): string => {
  return clases.filter(Boolean).join(' ');
};
