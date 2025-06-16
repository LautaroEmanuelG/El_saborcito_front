import React, { useState, useEffect } from 'react';
import { useFacturaOperaciones } from '../../HU18_Generacion_De_Factura/logic';
import { FacturaDTO } from '../../HU18_Generacion_De_Factura/model';

interface GestionFacturaRecepcionProps {
  pedidoId: number;
  clienteNombre: string;
  clienteEmail: string;
  className?: string;
}

export const GestionFacturaRecepcion: React.FC<GestionFacturaRecepcionProps> = ({
  pedidoId,
  clienteNombre,
  clienteEmail,
  className = '',
}) => {
  const { loading, error, consultarFactura, descargarPDF, reenviarEmail, limpiarError } =
    useFacturaOperaciones();

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
        // No mostrar error si no hay factura, es normal
        console.log('No se encontró factura para este pedido');
      } finally {
        setCargandoFactura(false);
      }
    };

    buscarFacturaDelPedido();
  }, [pedidoId]);

  const manejarDescargarPDF = async () => {
    if (!facturaInfo?.id) return;

    const exito = await descargarPDF(facturaInfo.id, `factura-pedido-${pedidoId}.pdf`);
    if (exito) {
      setMensajeExito('✅ PDF descargado exitosamente');
      setTimeout(() => setMensajeExito(null), 3000);
    }
  };

  const manejarReenviarEmail = async () => {
    if (!facturaInfo?.id) return;

    const exito = await reenviarEmail(facturaInfo.id);
    if (exito) {
      setMensajeExito('✅ Email reenviado exitosamente');
      setTimeout(() => setMensajeExito(null), 3000);
    }
  };

  const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio);
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Limpiar mensajes de error después de unos segundos
  useEffect(() => {
    if (error || mensajeExito) {
      const timer = setTimeout(() => {
        limpiarError();
        setMensajeExito(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, mensajeExito, limpiarError]);

  if (cargandoFactura) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-700">Verificando factura...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
          <path d="M6 8h8v2H6V8zm0 4h8v2H6v-2z" />
        </svg>
        <h4 className="text-lg font-semibold text-blue-800">📄 Gestión de Factura</h4>
      </div>

      {/* Información de la factura si existe */}
      {facturaInfo && (
        <div className="bg-white rounded p-3 mb-3 border border-blue-100">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-600">Factura ID:</span>
              <span className="ml-2 text-gray-800">#{facturaInfo.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Fecha:</span>
              <span className="ml-2 text-gray-800">
                {facturaInfo.fechaFacturacion
                  ? formatearFecha(facturaInfo.fechaFacturacion)
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Total:</span>
              <span className="ml-2 text-gray-800 font-semibold">
                {formatearPrecio(facturaInfo.totalVenta)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Cliente:</span>
              <span className="ml-2 text-gray-800">{clienteNombre}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-600">Email:</span>
              <span className="ml-2 text-gray-800">{clienteEmail}</span>
            </div>
          </div>
        </div>
      )}

      {/* Información si no hay factura */}
      {!facturaInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-yellow-800 text-sm">
              Este pedido no tiene factura asociada aún
            </span>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={manejarDescargarPDF}
          disabled={loading || !facturaInfo}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors text-sm font-medium ${
            facturaInfo
              ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
          </svg>
          {loading ? 'Descargando...' : 'Descargar PDF'}
        </button>

        <button
          onClick={manejarReenviarEmail}
          disabled={loading || !facturaInfo}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors text-sm font-medium ${
            facturaInfo
              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          {loading ? 'Enviando...' : 'Reenviar Email'}
        </button>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
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

      {mensajeExito && (
        <div className="mt-3 p-3 bg-green-100 border border-green-300 text-green-700 rounded text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {mensajeExito}
          </div>
        </div>
      )}
    </div>
  );
};
