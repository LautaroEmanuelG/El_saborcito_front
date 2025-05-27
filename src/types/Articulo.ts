import type { Categoria } from './Categoria';
import type { Imagen } from './Imagen';
import type { UnidadMedida } from './UnidadMedida';

export interface Articulo {
  id?: number;
  categoriaId: number;
  denominacion: string;
  precioVenta: number;
  unidadMedidaId: UnidadMedida;
}

export interface ArticuloInsumo extends Articulo {
  precioCompra: number;
  stockActual: number;
  stockMaximo: number;
  esParaElaborar: boolean;
  imagen?: string[]; // Assuming ImagenDTO is represented as string[] or adapt as needed
  categoria: Categoria;
  unidadMedidaId: UnidadMedida;
}

export interface ArticuloManufacturado extends Articulo {
  descripcion: string;
  tiempoEstimadoMinutos: number;
  preparacion: string;
  imagen?: Imagen | null;
  articuloManufacturadoDetalles: ArticuloManufacturadoDetalles[];
}

export interface ArticuloManufacturadoDetalles {
  id?: number;
  cantidad: number;
  articuloInsumo: ArticuloInsumo;
}
