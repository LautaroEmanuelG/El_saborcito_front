export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface Producto {
  id?:number;
  categoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  costo:number;
  stock: number;
}
export interface ProductoCarrito extends Producto {
  quantity: number;
}