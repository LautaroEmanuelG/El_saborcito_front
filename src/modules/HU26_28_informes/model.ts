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
  fechaPedido: string | Date;
  total: number;
  detalles: DetallePedidoDTO[];
}
