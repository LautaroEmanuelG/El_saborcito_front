// 🧾 Componente de gestión de facturas para clientes

import React, { useState, useEffect } from 'react';
import { useFacturaOperaciones } from '../../HU18_Generacion_De_Factura/logic';
import { FacturaDTO } from '../../HU18_Generacion_De_Factura/model';

interface GestionFacturaClienteProps {
  pedidoId: number;
  clienteNombre: string;
  clienteEmail: string;
  className?: string;
  compacto?: boolean; // Para mostrar versión reducida en modal
}

export const GestionFacturaCliente: React.FC<GestionFacturaClienteProps> = ({
  pedidoId,
  clienteNombre,
  clienteEmail,
  className = '',
  compacto = false,
}) => {
  const { loading, error, consultarFactura, descargarPDF, limpiarError } = useFacturaOperaciones();

  const [facturaInfo, setFacturaInfo] = useState<FacturaDTO | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargandoFactura, setCargandoFactura] = useState(false);

  // Buscar factura automáticamente al montar el componente
  useEffect(() => {
    const buscarFacturaDelPedido = async () => {
      setCargandoFactura(true);
      try {
        const factura = await consultarFactura(pedidoId);
        setFacturaInfo(factura);
      } catch (err) {
      } finally {
        setCargandoFactura(false);
      }
    };

    buscarFacturaDelPedido();
  }, [pedidoId, consultarFactura]);

  const manejarDescargarPDF = async () => {
    if (!facturaInfo?.id) return;

    const exito = await descargarPDF(facturaInfo.id, `factura-pedido-${pedidoId}.pdf`);
    if (exito) {
      setMensajeExito('✅ Factura descargada exitosamente');
      setTimeout(() => setMensajeExito(null), 3000);
    }
  };

  const limpiarMensajes = () => {
    setMensajeExito(null);
    limpiarError();
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (cargandoFactura) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-800">Verificando factura...</span>
        </div>
      </div>
    );
  }

  if (!facturaInfo) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <span className="text-yellow-600 mr-2">⚠️</span>
          <span className="text-yellow-800">Factura no disponible para este pedido</span>
        </div>
      </div>
    );
  }

  if (compacto) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">📄</span>
            <div>
              {' '}
              <p className="text-sm font-medium text-green-800">Factura #{facturaInfo.id}</p>
              <p className="text-xs text-green-600">
                {facturaInfo.fechaFacturacion
                  ? formatearFecha(facturaInfo.fechaFacturacion)
                  : 'Fecha no disponible'}
              </p>
            </div>
          </div>
          <button
            onClick={manejarDescargarPDF}
            disabled={loading}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? '⏳' : '⬇️'} Descargar
          </button>
        </div>

        {mensajeExito && (
          <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
            {mensajeExito}
          </div>
        )}

        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
            ❌ {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      <div className="bg-green-50 border-b border-green-200 p-4">
        <h3 className="text-lg font-semibold text-green-800 flex items-center">
          🧾 Información de Factura
        </h3>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {' '}
          <div>
            <p className="text-sm text-gray-600">Número de Factura</p>
            <p className="font-medium text-gray-900">#{facturaInfo.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha de Emisión</p>
            <p className="font-medium text-gray-900">
              {facturaInfo.fechaFacturacion
                ? formatearFecha(facturaInfo.fechaFacturacion)
                : 'No disponible'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cliente</p>
            <p className="font-medium text-gray-900">{clienteNombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-gray-900">{clienteEmail}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={manejarDescargarPDF}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Descargando...
              </>
            ) : (
              <>📥 Descargar PDF</>
            )}
          </button>
        </div>

        {/* Mensajes de estado */}
        {mensajeExito && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded flex items-center justify-between">
            <span className="text-green-800">{mensajeExito}</span>
            <button onClick={limpiarMensajes} className="text-green-600 hover:text-green-800">
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded flex items-center justify-between">
            <span className="text-red-800">❌ {error}</span>
            <button onClick={limpiarMensajes} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
