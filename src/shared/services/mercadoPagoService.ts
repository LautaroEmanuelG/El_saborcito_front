import axiosInstance from './axiosConfig';

interface CrearPreferenciaResponse {
  preferenceId: string;
  initPoint: string;
}

/**
 * Crear preferencia de pago en Mercado Pago
 * @param pedidoId ID del pedido para el cual crear la preferencia
 * @returns Respuesta con preferenceId e initPoint
 */
export const crearPreferencia = async (pedidoId: number): Promise<CrearPreferenciaResponse> => {
  try {
    const response = await axiosInstance.post(`/pagos/crear-preferencia/${pedidoId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data || 'Error al crear preferencia de pago');
  }
};

/**
 * Inicializar Mercado Pago con la clave pública
 */
export const initMercadoPago = () => {
  const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error('VITE_MP_PUBLIC_KEY no está definida en las variables de entorno');
  }

  // Verificar si MercadoPago está disponible globalmente
  if (typeof window !== 'undefined' && (window as any).MercadoPago) {
    (window as any).MercadoPago.initialize(publicKey);
    return (window as any).MercadoPago;
  } else {
    throw new Error('MercadoPago SDK no está cargado');
  }
};

/**
 * Crear botón de pago de Mercado Pago
 * @param preferenceId ID de la preferencia creada
 * @param containerId ID del contenedor donde renderizar el botón
 */
export const crearBotonPago = (preferenceId: string, containerId: string) => {
  try {
    const mp = initMercadoPago();

    // Crear el botón de pago
    mp.checkout({
      preference: {
        id: preferenceId,
      },
      render: {
        container: `#${containerId}`,
        label: 'Pagar con Mercado Pago',
      },
    });
  } catch (error) {
    console.error('Error al crear botón de pago:', error);
    throw error;
  }
};

/**
 * Abrir checkout de Mercado Pago usando init_point
 * @param initPoint URL del checkout de Mercado Pago
 */
export const abrirCheckoutMP = (initPoint: string): void => {
  window.open(initPoint, '_blank');
};
