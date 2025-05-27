import type { Categoria } from './Categoria';
import type { Imagen } from './Imagen';
import type { UnidadMedida } from './UnidadMedida';

export interface Articulo {
  id?: number;
  categoriaId: number;
  denominacion: string;
  precioVenta: number;
  unidadMedidaId: UnidadMedida;
  imagen?: Imagen | null;
}

export interface ArticuloInsumo extends Articulo {
  precioCompra: number;
  stockActual: number;
  stockMaximo: number;
  esParaElaborar: boolean;
  categoria: Categoria;
  unidadMedidaId: UnidadMedida;
}

export interface ArticuloManufacturado extends Articulo {
  descripcion: string;
  tiempoEstimadoMinutos: number;
  preparacion: string;
  articuloManufacturadoDetalles: ArticuloManufacturadoDetalles[];
}

export interface ArticuloManufacturadoDetalles {
  id?: number;
  cantidad: number;
  articuloInsumo: ArticuloInsumo;
}
