// Lógica principal para el registro de compra de insumos
// Aquí se manejarán los estados, validaciones y flujos principales de la HU24
// HU24_CompraIngredientes/logic.ts

/** Valida el formulario de compra */
export const validarCompra = (nueva: {
  denominacion: string;
  detalles: { cantidad: number; precioUnitario: number }[];
}): string | null => {
  if (!nueva.denominacion?.trim()) return 'Debe ingresar denominación';
  if (!nueva.detalles.length) return 'Agrega al menos un insumo';

  for (const d of nueva.detalles) {
    // Permitir cantidades negativas para ajustes de stock
    if (d.cantidad === 0) return 'La cantidad no puede ser cero';
    if (d.precioUnitario <= 0) return 'El precio de costo debe ser mayor a 0';
  }
  return null;
};

/** Formatea moneda ARS */
export const formatearMonto = (m: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(m);
