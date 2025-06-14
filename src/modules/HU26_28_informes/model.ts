// src/modules/HU26_28_informes/informes/model.ts

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

// src/modules/HU26_28_informes/informes/model.ts

export interface ClienteRanking {
  idCliente: number;
  nombreCompleto: string;
  cantidadPedidos: number;
  totalImporte: number;
}

export interface DetallePedidoDTO {
  id: number;
  cantidad: number;
  articulo: {
    id: number;
    denominacion: string;
    precioVenta: number;
  };
}

export interface PedidoResumenPorCliente {
  idPedido: number;
  fechaPedido: string;
  total: number;
  detalles: DetallePedidoDTO[];
}

// Nuevos DTOs para detalles de ganancias y costos
export interface PedidoGananciaDetalle {
  idPedido: number;
  fechaPedido: string;
  total: number;
}

export interface PedidoCostoDetalle {
  idPedido: number;
  fechaPedido: string;
  totalCosto: number;
}
