// src/modules/HU26_28_informes/informes/model.ts

export interface ProductoRanking {
  id: number;
  denominacion: string;
  cantidadVendida: number;
  tipo: 'MANUFACTURADO' | 'INSUMO';
}

// src/modules/HU26_28_informes/informes/model.ts

export interface ClienteRanking {
  id: number;
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
