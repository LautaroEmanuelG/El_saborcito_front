import type { Categoria } from './Categoria';
import type { Imagen } from './Imagen';
import type { UnidadMedida } from './UnidadMedida';

// Artículo base reutilizable
export interface Articulo {
  id: number;
  denominacion: string;
  precioVenta: number;
  imagen?: Imagen | null;
}

export interface ArticuloInsumo extends Articulo {
  precioCompra: number;
  stockActual: number;
  stockMaximo: number;
  esParaElaborar: boolean;
  categoria: Categoria;
  unidadMedida: UnidadMedida;
}

export interface ArticuloManufacturadoDetalle {
  id?: number;
  cantidad: number;
  articuloInsumo: ArticuloInsumo;
}

export interface ArticuloManufacturado extends Articulo {
  categoriaId: number;
  categoria?: Categoria; // Opcional para cuando viene poblado del backend
  unidadMedidaId?: number | null; // Campo del backend que no usamos
  unidadMedida?: UnidadMedida | null; // Opcional para cuando viene poblado del backend
  descripcion: string;
  tiempoEstimadoMinutos: number;
  preparacion?: string | null; // Campo del backend que no usamos
  articuloManufacturadoDetalles: ArticuloManufacturadoDetalle[];
}
