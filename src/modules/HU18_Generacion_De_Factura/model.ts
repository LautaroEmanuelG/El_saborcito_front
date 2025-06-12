// Interfaces para el módulo de generación de facturas

// DTO que se envía al backend para generar la factura
export interface FacturaDTO {
  pedido: {
    id: number;
  };
  formaPago: {
    id: number;
  };
  totalVenta: number;
  clienteEmail?: string;
  // Datos opcionales de Mercado Pago si aplica
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
