// Lógica principal para el registro de compra de insumos
// Aquí se manejarán los estados, validaciones y flujos principales de la HU24
// HU24_CompraIngredientes/logic.ts

/** Valida el formulario de compra */
export function validarCompra(nueva: {
  denominacion: string;
  detalles: { cantidad: number; precioUnitario: number }[];
}): string | null {
  if (!nueva.denominacion?.trim()) return 'Debe ingresar denominación';
  if (!nueva.detalles.length) return 'Agrega al menos un insumo';
  for (const d of nueva.detalles) {
    if (d.cantidad <= 0) return 'Cantidad mayor a 0';
    if (d.precioUnitario <= 0) return 'Precio costo mayor a 0';
  }
  return null;
}

/** Formatea moneda ARS */
export const formatearMonto = (m: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(m);
