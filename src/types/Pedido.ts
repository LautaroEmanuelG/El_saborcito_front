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

// 🏢 **TIPOS DETALLADOS PARA RECEPCIÓN**

export interface Estado {
  id: number;
  nombre: string;
}

export interface TipoEnvio {
  id: number;
  nombre: string;
}

export interface FormaPagoDetallada {
  id: number;
  nombre: string;
}

export interface Localidad {
  id: number;
  nombre: string;
  provincia: {
    id: number;
    nombre: string;
    pais: {
      id: number;
      nombre: string;
    };
  };
}

export interface DomicilioCompleto {
  id: number;
  calle: string;
  numero: number;
  cp: string;
  localidad: Localidad;
  latitud?: number;
  longitud?: number;
}

export interface ClienteCompleto {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  fechaNacimiento: string;
  rol: string;
  estado: boolean;
  fechaRegistro: string;
  fechaUltimaModificacion: string;
  domicilios: DomicilioCompleto[];
  imagen: any;
}

export interface SucursalCompleta {
  id: number;
  nombre: string;
  domicilio: DomicilioCompleto;
  empresa: {
    id: number;
    nombre: string;
    razonSocial: string;
    cuil: string;
  };
  horarios: Array<{
    id: number;
    diaSemana: string;
    apertura: string;
    cierre: string;
  }>;
}

export interface DetallePedidoCompleto {
  id: number;
  cantidad: number;
  cantidadConPromocion: number;
  cantidadSinPromocion: number;
  subtotal: number;
  origen: 'INDIVIDUAL' | 'PROMOCION';
  promocionOrigenId?: number;
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
    fechaEliminacion?: string;
  };
}

export interface PedidoCompleto {
  id: number;
  horasEstimadaFinalizacion: string;
  total: number;
  totalCosto: number;
  fechaPedido: string;
  estado: Estado;
  tipoEnvio: TipoEnvio;
  formaPago: FormaPagoDetallada;
  cliente: ClienteCompleto;
  sucursal: SucursalCompleta;
  detalles: DetallePedidoCompleto[];
}

export interface UpdateEstadoPedidoRequest {
  pedidoId: number;
  nuevoEstado: string;
}
