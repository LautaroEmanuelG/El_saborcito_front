// productoInformes.ts
import axiosInstance from './axiosConfig';
import { ProductoRankingResponse } from '../../modules/HU26_28_informes/model';

const API_BASE = '/sucursales';

/**
 * Obtiene el ranking de productos entre dos fechas
 */
export const getRankingProductos = async (
  desde: string,
  hasta: string
): Promise<ProductoRankingResponse> => {
  const response = await axiosInstance.get<ProductoRankingResponse>(
    `${API_BASE}/ranking-productos`,
    { params: { desde, hasta } }
  );
  return response.data;
};

/**
 * Exporta el ranking de productos a Excel
 */
export const exportarRankingExcel = async (desde: string, hasta: string): Promise<void> => {
  // Hacemos la petición pidiendo un blob
  const response = await axiosInstance.get<Blob>(`${API_BASE}/exportar-excel`, {
    params: { desde, hasta },
    responseType: 'blob',
  });

  // Creamos el enlace de descarga
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ranking-productos.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
