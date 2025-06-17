//RANKING DE PRODUCTOS
export interface ProductoRanking {
  id: number;
  denominacion: string;
  cantidadVendida: number;
  tipoProducto: 'MANUFACTURADO' | 'INSUMO';
}

export interface ProductoRankingResponse {
  productos: ProductoRanking[];
  totalManufacturados: number;
  totalInsumos: number;
}

//RANKING DE CLIENTES
export interface ClienteRanking {
  idCliente: number;
  nombreCompleto: string;
  cantidadPedidos: number;
  totalImporte: number;
}

export interface DetallePedidoDTO {
  id: number | null;
  cantidad: number;
  cantidadConPromocion: number;
  cantidadSinPromocion: number;
  subtotal: number;
  origen: 'INDIVIDUAL' | 'PROMOCION';
  promocionOrigenId: number | null;
  articulo: {
    id: number;
    denominacion: string;
    precioVenta: number | null;
  };
}

export interface PedidoResumenPorCliente {
  idPedido: number;
  fechaPedido: string;
  total: number;
  detalles: DetallePedidoDTO[];
}

//MOVIMIENTOS MONETARIOS
export interface PedidoGananciaDetalle {
  idPedido: number;
  fechaPedido: string;
  total: number;
}

export interface CompraCostoDetalle {
  idPedido: number;
  fechaPedido: string;
  totalCosto: number;
}
