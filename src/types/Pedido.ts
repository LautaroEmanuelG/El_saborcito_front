// 📦 **TIPOS PARA PEDIDOS CON PROMOCIONES**

export interface DetallePedido {
  cantidad: number;
  articuloId: number;
}

export interface PromocionSeleccionada {
  promocionId: number;
  cantidad: number;
}

export interface DomicilioPedido {
  calle: string;
  numero: number;
  cp: string;
  latitud: number;
  longitud: number;
  localidadId: number;
}

export interface PedidoRequest {
  clienteId: number;
  tipoEnvioId: number;
  formaPagoId: number;
  sucursalId: number;
  domicilio: DomicilioPedido;
  detalles: DetallePedido[];
  promocionesSeleccionadas: PromocionSeleccionada[];
}

// 📋 **TIPOS PARA RESPUESTA DE PEDIDO**

export interface PedidoResponse {
  id: number;
  horasEstimadaFinalizacion: string;
  total: number;
  totalCosto: number;
  fechaPedido: string;
  estado: {
    id: number;
    nombre: string;
  };
  tipoEnvio: {
    id: number;
    nombre: string;
  };
  formaPago: {
    id: number;
    nombre: string;
  };
  cliente: any; // Tipo completo del cliente si se necesita
  sucursal: any; // Tipo completo de la sucursal si se necesita
  detalles: Array<{
    id: number;
    cantidad: number;
    cantidadConPromocion: number;
    cantidadSinPromocion: number;
    subtotal: number;
    origen: 'INDIVIDUAL' | 'PROMOCION';
    promocionOrigenId: number | null;
    articulo: {
      id: number;
      denominacion: string;
      precioVenta: number;
      categoriaId: number;
      imagen: {
        id: number;
        url: string;
      };
      eliminado: boolean;
      fechaEliminacion: string | null;
    };
  }>;
}

// ⚙️ **CONFIGURACIÓN HARDCODEADA TEMPORAL**

export const HARDCODED_CONFIG = {
  clienteId: 5,
  sucursalId: 1,
  tipoEnvioId: 1,
  formaPagoId: 1,
  domicilio: {
    calle: 'Nueva Calle',
    numero: 45678,
    cp: '5500',
    latitud: -32.8895,
    longitud: -68.8458,
    localidadId: 1,
  },
} as const;
