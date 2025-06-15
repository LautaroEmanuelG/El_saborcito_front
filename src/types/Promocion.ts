// Tipos para Promociones basados en los DTOs del backend
import { Articulo } from './Articulo';
import type { Sucursal } from './Sucursal';
import { Imagen } from './Imagen';

export interface PromocionDetalle {
  id: number;
  promocionId: number;
  articulo: Articulo;
  cantidadRequerida: number;
}

export interface Promocion {
  id: number;
  denominacion: string;
  fechaDesde: string; // ISO date string
  fechaHasta: string; // ISO date string
  horaDesde: string | null; // HH:mm:ss o null
  horaHasta: string | null;
  descuento: number | null;
  precioPromocional: number | null;
  sucursal: Sucursal | null;
  imagen: Imagen | null;
  promocionDetalles: PromocionDetalle[];
  articulo?: Articulo | null; // Deprecado, pero puede venir del backend
  eliminado?: boolean; // Para manejar baja lógica
}

export interface PromocionSeleccionada {
  promocionId: number;
  cantidad: number;
}
