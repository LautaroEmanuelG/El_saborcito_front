import { PedidoDTO, PedidoConRecetasDTO } from '../../modules/HU17_Cocina/Model';

const BASE_URL = 'http://localhost:5252/api/historial';

export const historialCocinaService = {
  // Obtener todos los pedidos finalizados
  async obtenerPedidosFinalizados(): Promise<PedidoDTO[]> {
    const response = await fetch(`${BASE_URL}/pedidos`);
    if (!response.ok) {
      throw new Error('Error al obtener pedidos finalizados');
    }
    return response.json();
  },

  // Obtener detalle completo de un pedido con recetas
  async obtenerDetalleCompleto(id: number): Promise<PedidoConRecetasDTO> {
    const response = await fetch(`${BASE_URL}/pedidos/${id}/detalle-completo`);
    if (!response.ok) {
      throw new Error('Error al obtener detalle del pedido');
    }
    return response.json();
  },

  // Descargar PDF de un pedido
  async descargarPDF(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/pedidos/${id}/pdf`);
    if (!response.ok) {
      throw new Error('Error al generar PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedido_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
