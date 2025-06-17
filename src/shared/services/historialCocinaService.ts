import axiosInstance from './axiosConfig';
import { PedidoDTO, PedidoConRecetasDTO } from '../../modules/HU17_Cocina/Model';

const BASE_URL = '/historial';

export const historialCocinaService = {
  // Obtener todos los pedidos finalizados
  obtenerPedidosFinalizados: async (): Promise<PedidoDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/pedidos`);
    return response.data;
  },

  // Obtener detalle completo de un pedido con recetas
  obtenerDetalleCompleto: async (id: number): Promise<PedidoConRecetasDTO> => {
    const response = await axiosInstance.get(`${BASE_URL}/pedidos/${id}/detalle-completo`);
    return response.data;
  },

  // Descargar PDF de un pedido
  descargarPDF: async (id: number): Promise<void> => {
    const response = await axiosInstance.get(`${BASE_URL}/pedidos/${id}/pdf`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedido-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
