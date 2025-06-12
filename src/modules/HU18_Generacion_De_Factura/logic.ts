// Importar React hooks
import { useState } from 'react';

import {
  FacturaDTO,
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
const puedeFacturarseFromAPI = (pedido: any): boolean => {
  const estadoNombre = pedido.estado?.nombre || pedido.estado;
  const estadosFacturables = ['LISTO', 'ENTREGADO', 'PAGADO'];
  return estadosFacturables.includes(estadoNombre?.toUpperCase());
};

/**
 * Genera una factura enviando los datos al backend
 */
export const generarFactura = async (facturaRequest: FacturaRequest): Promise<FacturaResponse> => {
  try {
    // Validar datos antes de enviar
    const validationError = validarDatosFactura(facturaRequest);
    if (validationError) {
      throw validationError;
    }

    // Preparar DTO para enviar al backend
    const facturaDTO: FacturaDTO = {
      pedido: { id: facturaRequest.pedidoId },
      formaPago: { id: facturaRequest.formaPagoId },
      totalVenta: facturaRequest.totalVenta,
      clienteEmail: facturaRequest.clienteEmail, // Enviar email desde frontend
      ...(facturaRequest.mercadoPagoData && {
        mercadoPagoData: facturaRequest.mercadoPagoData,
      }),
    };

    // Realizar POST al endpoint de facturas
    const response = await fetch(`${API_BASE_URL}/api/facturas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Agregar headers de autenticación si son necesarios
        // 'Authorization': `Bearer ${getAuthToken()}`
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

    // Convertir la respuesta del backend al formato esperado
    const facturaResponse: FacturaResponse = {
      success: true,
      message: 'Factura generada exitosamente',
      facturaId: responseData.id,
      numeroFactura: `FACT-${responseData.id}`,
      emailEnviado: true,
    };

    return facturaResponse;
  } catch (error) {
    // Manejar diferentes tipos de errores
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
 * Hook personalizado para manejar el estado de facturación
 */
export const useFacturacion = () => {
  const [status, setStatus] = useState<FacturaStatus>(FacturaStatus.IDLE);
  const [error, setError] = useState<FacturaError | null>(null);
  const [response, setResponse] = useState<FacturaResponse | null>(null);

  const generarFacturaConEstado = async (facturaRequest: FacturaRequest) => {
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
