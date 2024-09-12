export interface Categoria {
  id: number;
  nombre: string;
  cantidad_productos: number;
  ventas: number;
  imagen: string;
}

export interface Producto {
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  ventas: number;
  imagen: string;
}