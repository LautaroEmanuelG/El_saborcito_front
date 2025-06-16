// 🔌 Servicio para historial de pedidos del cliente

import axiosInstance from '../../../shared/services/axiosConfig';
import { HistorialPedido } from '../Model';

const API_BASE_URL = '/historial-pedidos';

export const obtenerHistorialPorCliente = async (clienteId: number): Promise<HistorialPedido[]> => {
  try {
    console.log(`🔗 Llamando a: ${API_BASE_URL}/cliente/${clienteId}`);
    const response = await axiosInstance.get(`${API_BASE_URL}/cliente/${clienteId}`);
    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener historial del cliente:', error);
    throw new Error('No se pudo cargar el historial de pedidos');
  }
};

export const obtenerPedidoPorId = async (pedidoId: number) => {
  try {
    const response = await axiosInstance.get(`/pedidos/${pedidoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalle del pedido:', error);
    throw new Error('No se pudo cargar el detalle del pedido');
  }
};

export const obtenerFacturaPorPedido = async (pedidoId: number) => {
  try {
    const response = await axiosInstance.get(`/facturas/pedido/${pedidoId}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener factura:', error);
    throw new Error('No se pudo cargar la factura');
  }
};

export const descargarFactura = async (pedidoId: number, nombreArchivo?: string) => {
  try {
    const facturaBlob = await obtenerFacturaPorPedido(pedidoId);

    // Crear URL temporal para el blob
    const url = window.URL.createObjectURL(facturaBlob);

    // Crear enlace temporal para descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo ?? `factura-pedido-${pedidoId}.pdf`;

    // Activar descarga
    document.body.appendChild(link);
    link.click();

    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error al descargar factura:', error);
    throw new Error('No se pudo descargar la factura');
  }
};
