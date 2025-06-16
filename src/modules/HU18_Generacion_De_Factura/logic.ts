// Importar React hooks
import { useState } from 'react';

import {
  FacturaDTO,
  FacturaCreateDTO,
  FacturaResponse,
  FacturaRequest,
  FacturaError,
  FacturaStatus,
  PedidoFacturacion,
} from './model';

// URL base de la API (ajustar según configuración del proyecto)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5252';

/**
 * Verifica si un pedido de la API puede ser facturado
 */
export const puedeFacturarseFromAPI = (pedido: any): boolean => {
  const estadoNombre = pedido.estado?.nombre || pedido.estado;
  const estadosFacturables = ['LISTO', 'ENTREGADO', 'PAGADO'];
  return estadosFacturables.includes(estadoNombre?.toUpperCase());
};

/**
 * NUEVO FLUJO: Consulta la factura de un pedido
 */
export const consultarFacturaPorPedido = async (pedidoId: number): Promise<FacturaDTO> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/facturas/pedido/${pedidoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Error al consultar factura');
  }
};

/**
 * NUEVO FLUJO: Descarga el PDF de una factura
 */
export const descargarFacturaPDF = async (facturaId: number): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/facturas/${facturaId}/pdf`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    return await response.blob();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Error al descargar PDF');
  }
};

/**
 * NUEVO FLUJO: Reenvía la factura por email
 */
export const reenviarFacturaPorEmail = async (facturaId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/facturas/${facturaId}/reenviar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('Error al reenviar email');
  }
};

/**
 * DEPRECADO: Esta función ya no se usa porque la factura se genera automáticamente al crear el pedido
 * Se mantiene por compatibilidad pero debería usarse el nuevo flujo
 */
export const generarFactura = async (facturaRequest: FacturaRequest): Promise<FacturaResponse> => {
  console.warn(
    '⚠️ generarFactura está deprecado. La factura se genera automáticamente al crear el pedido.'
  );

  try {
    // Validar datos antes de enviar
    const validationError = validarDatosFactura(facturaRequest);
    if (validationError) {
      throw validationError;
    }

    // Preparar DTO para enviar al backend
    const facturaDTO: FacturaCreateDTO = {
      pedido: { id: facturaRequest.pedidoId },
      formaPago: { id: facturaRequest.formaPagoId },
      totalVenta: facturaRequest.totalVenta,
      clienteEmail: facturaRequest.clienteEmail,
      ...(facturaRequest.mercadoPagoData && {
        mercadoPagoData: facturaRequest.mercadoPagoData,
      }),
    };

    // Realizar POST al endpoint de facturas
    const response = await fetch(`${API_BASE_URL}/api/facturas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facturaDTO),
    });

    if (!response.ok) {
      let errorData = {};
      try {
        const textResponse = await response.text();
        if (textResponse) {
          try {
            errorData = JSON.parse(textResponse);
          } catch {
            console.error('No se pudo parsear como JSON');
          }
        }
      } catch (err) {
        console.error('Error al leer respuesta:', err);
      }

      throw new Error(
        (errorData as any).message || `Error HTTP: ${response.status} - ${response.statusText}`
      );
    }

    const responseData = await response.json();

    const facturaResponse: FacturaResponse = {
      success: true,
      message: 'Factura generada exitosamente',
      facturaId: responseData.id,
      numeroFactura: `FACT-${responseData.id}`,
      emailEnviado: true,
    };

    return facturaResponse;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: 'Error al generar la factura',
        error: error.message,
      };
    }

    return {
      success: false,
      message: 'Error desconocido al generar la factura',
      error: 'Error inesperado',
    };
  }
};

/**
 * Valida los datos necesarios para generar una factura
 */
export const validarDatosFactura = (facturaRequest: FacturaRequest): FacturaError | null => {
  // Validar ID del pedido
  if (!facturaRequest.pedidoId || facturaRequest.pedidoId <= 0) {
    return {
      type: 'VALIDATION_ERROR',
      message: 'ID del pedido es requerido y debe ser válido',
      details: { field: 'pedidoId', value: facturaRequest.pedidoId },
    };
  }

  // Validar ID de forma de pago
  if (!facturaRequest.formaPagoId || facturaRequest.formaPagoId <= 0) {
    return {
      type: 'VALIDATION_ERROR',
      message: 'Forma de pago es requerida',
      details: { field: 'formaPagoId', value: facturaRequest.formaPagoId },
    };
  }

  // Validar total de venta
  if (!facturaRequest.totalVenta || facturaRequest.totalVenta <= 0) {
    return {
      type: 'VALIDATION_ERROR',
      message: 'Total de venta debe ser mayor a cero',
      details: { field: 'totalVenta', value: facturaRequest.totalVenta },
    };
  }

  return null; // Sin errores
};

/**
 * Verifica si un pedido puede ser facturado
 */
export const puedeFacturarse = (pedido: PedidoFacturacion): boolean => {
  // El pedido debe estar pagado, confirmado o listo para entregar
  const estadosFacturables = ['PAGADO', 'CONFIRMADO', 'PAID', 'LISTO', 'ENTREGADO'];
  return estadosFacturables.includes(pedido.estado.toUpperCase());
};

/**
 * Formatea el mensaje de error para mostrar al usuario
 */
export const formatearMensajeError = (error: FacturaError | string): string => {
  if (typeof error === 'string') {
    return error;
  }

  switch (error.type) {
    case 'VALIDATION_ERROR':
      return `Error de validación: ${error.message}`;
    case 'NETWORK_ERROR':
      return 'Error de conexión. Por favor, verifique su conexión a internet.';
    case 'SERVER_ERROR':
      return 'Error del servidor. Por favor, intente nuevamente más tarde.';
    case 'EMAIL_ERROR':
      return 'La factura se generó correctamente, pero no se pudo enviar por email. Verifique que el cliente tenga un email registrado.';
    default:
      return error.message || 'Error desconocido';
  }
};

/**
 * NUEVO: Hook para manejar operaciones de factura (consultar, descargar PDF, reenviar email)
 */
export const useFacturaOperaciones = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consultarFactura = async (pedidoId: number): Promise<FacturaDTO | null> => {
    setLoading(true);
    setError(null);

    try {
      const factura = await consultarFacturaPorPedido(pedidoId);
      return factura;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al consultar factura';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = async (facturaId: number, nombreArchivo?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const blob = await descargarFacturaPDF(facturaId);

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo || `factura_${facturaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al descargar PDF';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reenviarEmail = async (facturaId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await reenviarFacturaPorEmail(facturaId);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al reenviar email';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const limpiarError = () => setError(null);

  return {
    loading,
    error,
    consultarFactura,
    descargarPDF,
    reenviarEmail,
    limpiarError,
  };
};

/**
 * Hook personalizado para manejar el estado de facturación (DEPRECADO)
 */
export const useFacturacion = () => {
  const [status, setStatus] = useState<FacturaStatus>(FacturaStatus.IDLE);
  const [error, setError] = useState<FacturaError | null>(null);
  const [response, setResponse] = useState<FacturaResponse | null>(null);

  const generarFacturaConEstado = async (facturaRequest: FacturaRequest) => {
    console.warn(
      '⚠️ useFacturacion está deprecado. Usa useFacturaOperaciones para el nuevo flujo.'
    );

    setStatus(FacturaStatus.VALIDATING);
    setError(null);
    setResponse(null);

    try {
      setStatus(FacturaStatus.GENERATING);
      const resultado = await generarFactura(facturaRequest);

      if (resultado.success) {
        setStatus(FacturaStatus.SUCCESS);
        setResponse(resultado);
      } else {
        setStatus(FacturaStatus.ERROR);
        setError({
          type: 'SERVER_ERROR',
          message: resultado.error || 'Error al generar factura',
        });
      }
    } catch (err) {
      setStatus(FacturaStatus.ERROR);
      setError({
        type: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Error de conexión',
      });
    }
  };

  const resetearEstado = () => {
    setStatus(FacturaStatus.IDLE);
    setError(null);
    setResponse(null);
  };

  return {
    status,
    error,
    response,
    generarFactura: generarFacturaConEstado,
    resetear: resetearEstado,
    isLoading: status === FacturaStatus.VALIDATING || status === FacturaStatus.GENERATING,
    isSuccess: status === FacturaStatus.SUCCESS,
    isError: status === FacturaStatus.ERROR,
  };
};
