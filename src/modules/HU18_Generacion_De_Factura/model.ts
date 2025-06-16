// Interfaces para el módulo de generación de facturas

// DTO que se recibe del backend al consultar una factura
export interface FacturaDTO {
  id?: number;
  fechaFacturacion?: string;
  totalVenta: number;
  clienteEmail?: string;
  pedido?: {
    id: number;
    cliente?: {
      nombre: string;
      email: string;
    };
  };
  formaPago?: {
    id: number;
    nombre?: string;
  };
  // Datos opcionales de Mercado Pago si aplica
  mercadoPagoData?: {
    transactionId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
  };
}

// DTO que se envía al backend para crear una factura (DEPRECADO - ahora se crea automáticamente)
export interface FacturaCreateDTO {
  pedido: {
    id: number;
  };
  formaPago: {
    id: number;
  };
  totalVenta: number;
  clienteEmail?: string;
  mercadoPagoData?: {
    transactionId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
  };
}

// Respuesta del backend al generar factura
export interface FacturaResponse {
  success: boolean;
  message: string;
  facturaId?: number;
  numeroFactura?: string;
  emailEnviado?: boolean;
  error?: string;
}

// Request interno para manejar datos antes de enviar
export interface FacturaRequest {
  pedidoId: number;
  formaPagoId: number;
  totalVenta: number;
  clienteEmail?: string;
  mercadoPagoData?: {
    transactionId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
  };
}

// Estados posibles del proceso de facturación
export enum FacturaStatus {
  IDLE = 'idle',
  VALIDATING = 'validating',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Tipo para manejo de errores específicos
export interface FacturaError {
  type: 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'EMAIL_ERROR';
  message: string;
  details?: any;
}

// Datos mínimos del pedido necesarios para facturación
export interface PedidoFacturacion {
  id: number;
  clienteId: number;
  clienteEmail?: string;
  clienteNombre?: string;
  totalVenta: number;
  estado: string;
}

// Formas de pago disponibles
export interface FormaPago {
  id: number;
  nombre: string;
  activo: boolean;
}
