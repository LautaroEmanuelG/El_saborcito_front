import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha para mostrar en la UI
 * Maneja tanto LocalDate de Java (string ISO) como objetos Date
 */
export const formatearFecha = (fecha: string | Date): string => {
  try {
    if (!fecha) return 'Sin fecha';

    let fechaObj: Date;

    if (typeof fecha === 'string') {
      // Manejo de LocalDate de Java (formato: "2025-01-01" o "2025-01-01T00:00:00")
      fechaObj = parseISO(fecha.split('T')[0]); // Toma solo la parte de fecha
    } else {
      fechaObj = fecha;
    }

    if (!isValid(fechaObj)) return 'Fecha inválida';
    return format(fechaObj, 'dd/MM/yyyy', { locale: es });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha con hora para mostrar en la UI
 */
export const formatearFechaHora = (fecha: string | Date): string => {
  try {
    if (!fecha) return 'Sin fecha';

    const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    if (!isValid(fechaObj)) return 'Fecha inválida';
    return format(fechaObj, 'dd/MM/yyyy HH:mm', { locale: es });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Formatea un monto monetario con separadores de miles
 */
export const formatearMonto = (monto: number): string => {
  if (typeof monto !== 'number' || isNaN(monto)) return '$0,00';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(monto);
};

/**
 * Valida que las fechas desde y hasta sean válidas
 */
export const validarRangoFechas = (desde: string, hasta: string): string | null => {
  if (!desde || !hasta) {
    return 'Debe seleccionar ambas fechas';
  }

  const fechaDesde = parseISO(desde);
  const fechaHasta = parseISO(hasta);

  if (!isValid(fechaDesde) || !isValid(fechaHasta)) {
    return 'Las fechas ingresadas no son válidas';
  }

  if (fechaDesde > fechaHasta) {
    return 'La fecha "desde" no puede ser mayor a la fecha "hasta"';
  }

  return null;
};

/**
 * Obtiene las fechas por defecto para el período actual
 */
export const obtenerFechasPorDefecto = () => {
  const hoy = new Date();
  const primerDiaAño = new Date(hoy.getFullYear(), 0, 1);

  return {
    desde: format(primerDiaAño, 'yyyy-MM-dd'),
    hasta: format(hoy, 'yyyy-MM-dd'),
  };
};

/**
 * Calcula el subtotal de un artículo en un pedido
 */
export const calcularSubtotal = (cantidad: number, precioUnitario: number): number => {
  return cantidad * precioUnitario;
};

/**
 * Obtiene el texto descriptivo para el tipo de ordenamiento
 */
export const obtenerTextoOrdenamiento = (ordenarPor: 'cantidad' | 'importe'): string => {
  return ordenarPor === 'cantidad'
    ? 'Ordenado por cantidad de pedidos'
    : 'Ordenado por importe total';
};

/**
 * Valida que un ID de cliente sea válido
 */
export const validarClienteId = (clienteId: number): boolean => {
  return Number.isInteger(clienteId) && clienteId > 0;
};
