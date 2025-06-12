import React from 'react';
import { PedidoFacturacion } from '../model';
import { useFacturacion } from '../logic';

// Props optimizadas para integración con carrito y Mercado Pago
interface FacturaIntegracionProps {
  // Datos del pedido (desde el carrito/checkout)
  pedidoId: number;
  clienteId: number;
  clienteNombre?: string;
  clienteEmail?: string;
  totalVenta: number;
  estadoPedido: string;

  // Datos de pago
  formaPagoId: number;
  formaPagoNombre?: string;

  // Datos de Mercado Pago (opcionales)
  mercadoPago?: {
    transactionId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentId?: string;
  };

  // Callbacks para el módulo padre
  onFacturaGenerada?: (datos: {
    numeroFactura: string;
    facturaId?: number;
    emailEnviado?: boolean;
  }) => void;
  onError?: (error: string) => void;
  onIntegracionCompleta?: () => void;

  // Configuración visual
  mostrarSiempre?: boolean; // Si false, solo muestra si el pedido puede facturarse
  textoBoton?: string;
  className?: string;
}

/**
 * Componente especializado para integración con carrito/pedidos y Mercado Pago
 * Simplifica el uso del módulo de facturación
 */
const FacturaIntegracion: React.FC<FacturaIntegracionProps> = ({
  pedidoId,
  clienteId,
  clienteNombre,
  clienteEmail,
  totalVenta,
  estadoPedido,
  formaPagoId,
  formaPagoNombre,
  mercadoPago,
  onFacturaGenerada,
  onError,
  onIntegracionCompleta,
  mostrarSiempre = false,
  textoBoton,
  className = '',
}) => {
  // Construir objeto pedido compatible
  const pedido: PedidoFacturacion = {
    id: pedidoId,
    clienteId,
    clienteNombre,
    clienteEmail,
    totalVenta,
    estado: estadoPedido,
  };

  // Preparar datos de Mercado Pago si existen
  const mercadoPagoData = mercadoPago
    ? {
        transactionId: mercadoPago.transactionId,
        paymentStatus: mercadoPago.paymentStatus,
        paymentMethod: mercadoPago.paymentMethod,
      }
    : undefined;

  // Hook de facturación
  const { status, error, response, generarFactura, isLoading, isSuccess, isError, resetear } =
    useFacturacion();

  // Handler para generar factura
  const handleGenerarFactura = async () => {
    await generarFactura({
      pedidoId,
      formaPagoId,
      totalVenta,
      clienteEmail,
      mercadoPagoData,
    });
  };

  // Efecto para callbacks
  React.useEffect(() => {
    if (isSuccess && response?.numeroFactura) {
      onFacturaGenerada?.({
        numeroFactura: response.numeroFactura,
        facturaId: response.facturaId,
        emailEnviado: response.emailEnviado,
      });
      onIntegracionCompleta?.();
    } else if (isError && error) {
      onError?.(error.message || 'Error al generar factura');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError, response, error]);

  return (
    <div className={`factura-integracion ${className}`}>
      {/* Información de contexto (opcional, para debugging) */}
      {import.meta.env.DEV && (
        <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-50 rounded">
          <strong>Debug:</strong> Pedido #{pedidoId} | {formaPagoNombre} | {estadoPedido}
          {mercadoPago && (
            <div>
              MP: {mercadoPago.paymentStatus} | {mercadoPago.transactionId}
            </div>
          )}
        </div>
      )}

      {/* Botón para generar factura */}
      <button
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
        onClick={handleGenerarFactura}
        disabled={isLoading || isSuccess}
      >
        {isLoading ? 'Generando factura...' : textoBoton || 'Generar Factura'}
      </button>

      {/* Estado de la facturación */}
      {isSuccess && response?.numeroFactura && (
        <div className="mt-2 text-green-600">Factura generada: {response.numeroFactura}</div>
      )}
      {isError && error && <div className="mt-2 text-red-600">{error.message}</div>}
      {isSuccess && (
        <button className="ml-2 text-xs underline" onClick={resetear}>
          Nueva factura
        </button>
      )}

      {/* Información adicional de la forma de pago */}
      {formaPagoNombre && (
        <div className="text-xs text-gray-600 mt-2 flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M20,11H4V6H20V11Z" />
          </svg>
          <span>Forma de pago: {formaPagoNombre}</span>
        </div>
      )}
    </div>
  );
};

export default FacturaIntegracion;

// Tipos auxiliares para exportar (para facilitar el tipado)
export type { FacturaIntegracionProps };

// Hook personalizado para facilitar el uso
export const useFacturaIntegracion = (pedidoId: number) => {
  const [facturaGenerada, setFacturaGenerada] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [procesando, setProcesando] = React.useState(false);

  const resetear = () => {
    setFacturaGenerada(null);
    setError(null);
    setProcesando(false);
  };

  const handleFacturaGenerada = (datos: { numeroFactura: string }) => {
    setFacturaGenerada(datos.numeroFactura);
    setProcesando(false);
    setError(null);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setProcesando(false);
  };

  const iniciarProceso = () => {
    setProcesando(true);
    setError(null);
  };

  return {
    facturaGenerada,
    error,
    procesando,
    resetear,
    handleFacturaGenerada,
    handleError,
    iniciarProceso,
  };
};

/* 
EJEMPLO DE USO PARA EL CARRITO:

```tsx
import { FacturaIntegracion } from '@/modules/HU18_Generacion_De_Factura';

// En el componente de finalización de pedido
const CheckoutFinalizado = ({ pedido, pagoMercadoPago }) => {
  return (
    <div className="checkout-success">
      <h2>¡Pedido confirmado!</h2>
      
      {pedido.estado === 'PAGADO' && (
        <FacturaIntegracion
          pedidoId={pedido.id}
          clienteId={pedido.clienteId}
          clienteNombre={pedido.cliente.nombre}
          clienteEmail={pedido.cliente.email}
          totalVenta={pedido.total}
          estadoPedido={pedido.estado}
          formaPagoId={pagoMercadoPago.formaPagoId}
          formaPagoNombre="Mercado Pago"
          mercadoPago={{
            transactionId: pagoMercadoPago.transactionId,
            paymentStatus: pagoMercadoPago.status,
            paymentMethod: pagoMercadoPago.paymentMethod
          }}
          onFacturaGenerada={(datos) => {
            alert(`Factura ${datos.numeroFactura} enviada al email!`);
          }}
          onError={(error) => {
            console.error('Error facturación:', error);
          }}
        />
      )}
    </div>
  );
};
```
*/
