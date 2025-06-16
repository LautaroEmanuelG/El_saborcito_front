import React, { useState } from 'react';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5252';

interface FacturaAdminProps {
  pedidoId: number;
  facturaId?: number | null;
  className?: string;
  mostrarSiempre?: boolean; // Si true, siempre muestra los botones aunque no haya factura
}

interface FacturaInfo {
  id: number;
  fechaFacturacion: string;
  totalVenta: number;
  pedido: {
    id: number;
    cliente: {
      nombre: string;
      email: string;
    };
  };
}

/**
 * Componente para que el admin gestione facturas de pedidos
 * Permite ver, descargar y reenviar facturas
 */
const FacturaAdmin: React.FC<FacturaAdminProps> = ({
  pedidoId,
  facturaId,
  className = '',
  mostrarSiempre = false,
}) => {
  const [facturaInfo, setFacturaInfo] = useState<FacturaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Buscar factura por pedido ID
  const buscarFactura = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/facturas/pedido/${pedidoId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No se encontró factura para este pedido');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const factura = await response.json();
      setFacturaInfo(factura);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar factura');
    } finally {
      setLoading(false);
    }
  };

  // Descargar PDF de la factura
  const descargarPDF = async (idFactura: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/facturas/${idFactura}/pdf`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${idFactura}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('PDF descargado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar PDF');
    } finally {
      setLoading(false);
    }
  };

  // Reenviar factura por email
  const reenviarEmail = async (idFactura: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/facturas/${idFactura}/reenviar`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const message = await response.text();
      setSuccess(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reenviar email');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar mensajes después de unos segundos
  React.useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Si hay facturaId, cargar la info automáticamente
  React.useEffect(() => {
    if (facturaId && !facturaInfo) {
      buscarFactura();
    }
  }, [facturaId]);

  const tieneFactura = facturaId || facturaInfo;

  if (!mostrarSiempre && !tieneFactura) {
    return null;
  }

  return (
    <div className={`factura-admin bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
            <path d="M6 8h8v2H6V8zm0 4h8v2H6v-2z" />
          </svg>
          Gestión de Factura
        </h3>

        {!facturaInfo && (
          <button
            onClick={buscarFactura}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar Factura'}
          </button>
        )}
      </div>

      {/* Información de la factura */}
      {facturaInfo && (
        <div className="bg-gray-50 rounded p-3 mb-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-600">Factura ID:</span>
              <span className="ml-2 text-gray-800">#{facturaInfo.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Fecha:</span>
              <span className="ml-2 text-gray-800">{facturaInfo.fechaFacturacion}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Total:</span>
              <span className="ml-2 text-gray-800 font-semibold">${facturaInfo.totalVenta}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Cliente:</span>
              <span className="ml-2 text-gray-800">{facturaInfo.pedido.cliente.nombre}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-600">Email:</span>
              <span className="ml-2 text-gray-800">{facturaInfo.pedido.cliente.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      {(facturaInfo || facturaId) && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => descargarPDF(facturaInfo?.id || facturaId!)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
            </svg>
            {loading ? 'Descargando...' : 'Descargar PDF'}
          </button>

          <button
            onClick={() => reenviarEmail(facturaInfo?.id || facturaId!)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {loading ? 'Enviando...' : 'Reenviar Email'}
          </button>
        </div>
      )}

      {/* Mensajes de estado */}
      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Info para pedidos sin factura */}
      {!tieneFactura && mostrarSiempre && (
        <div className="text-center py-4 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
          </svg>
          <p>Este pedido no tiene factura asociada</p>
          <p className="text-xs mt-1">
            Las facturas se generan automáticamente al crear pedidos con forma de pago
          </p>
        </div>
      )}
    </div>
  );
};

export default FacturaAdmin;

/* 
EJEMPLO DE USO:

```tsx
import { FacturaAdmin } from '@/modules/HU18_Generacion_De_Factura';

// En la vista de pedidos del admin
const PedidoItem = ({ pedido }) => {
  return (
    <div className="pedido-card">
      <h3>Pedido #{pedido.id}</h3>
      <p>Cliente: {pedido.cliente.nombre}</p>
      <p>Total: ${pedido.total}</p>
      
      <FacturaAdmin 
        pedidoId={pedido.id}
        facturaId={pedido.facturaId}
        className="mt-4"
      />
    </div>
  );
};

// O en una vista dedicada de facturas
const FacturaDetalle = ({ pedidoId }) => {
  return (
    <div>
      <h2>Gestión de Factura</h2>
      <FacturaAdmin 
        pedidoId={pedidoId}
        mostrarSiempre={true}
      />
    </div>
  );
};
```
*/
