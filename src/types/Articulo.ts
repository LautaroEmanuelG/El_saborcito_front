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
  stockMinimo: number;
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
  unidadMedida?: UnidadMedida | null; // Opcional para cuando viene poblado del backend
  descripcion: string;
  tiempoEstimadoMinutos: number;
  preparacion?: string | null; // Campo del backend que no usamos
  articuloManufacturadoDetalles: ArticuloManufacturadoDetalle[];
  eliminado?: boolean; // Indica si el artículo está dado de baja lógica
}

// 🔍 **TIPOS PARA ANÁLISIS DE PRODUCCIÓN**

export interface InsumoInsuficiente {
  id: number;
  denominacion: string;
  stockActual: number;
  stockRequerido: number;
  stockFaltante: number;
}

export interface ProductoConProblemas {
  articuloId: number;
  cantidadMaximaPosible: number;
  cantidadSolicitada?: number | null;
  denominacion: string;
  motivoProblema: string;
}

export interface AnalisisProduccionResponse {
  sePuedeProducirCompleto: boolean;
  mensaje: string;
  productos: any | null;
  productosConProblemas: ProductoConProblemas[];
  insumosInsuficientes: InsumoInsuficiente[];
}

export interface InsumoInsuficiente {
  insumoId: number;
  denominacion: string;
  cantidadNecesaria: number;
  stockDisponible: number;
  stockFaltante: number;
  unidadMedida: any | null;
}

export interface AnalisisProduccionRequest {
  articulos: Array<{
    articuloId: number;
    cantidad: number;
  }>;
}
