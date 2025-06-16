/**
 * Utilidades para manejo de fechas
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para inputs de tipo date
 */
export const obtenerFechaHoy = (): string => {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
};

/**
 * Valida que una fecha de inicio no sea posterior a la fecha de fin
 */
export const validarRangoFechas = (desde: string, hasta: string): string | null => {
  if (!desde || !hasta) return null;

  const fechaDesde = new Date(desde);
  const fechaHasta = new Date(hasta);

  if (fechaDesde > fechaHasta) {
    return 'La fecha de inicio no puede ser posterior a la fecha de fin';
  }

  return null;
};
