export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface Producto {
  id?:number;
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  costo:number;
  stock: number;
}
export interface ProductoCarrito extends ProductoValor {
  quantity: number;
}

export interface TicketProducto {
  id?: number;
  producto: ProductoValor;
  cantidad: number;
}

export interface Ticket {
  id?: number;
  ticketProductos: TicketProducto[];
  total: number;
  fecha: string;
}

export interface ProductoValor extends Producto {
  costo: number;
  ganancia: number;
  imagen?: string[];
  valor: {
    costo: number;
    precio: number;
  }
  categoria: Categoria;
}

export interface CategoriaVentas extends Categoria {
  ventas: number;
}