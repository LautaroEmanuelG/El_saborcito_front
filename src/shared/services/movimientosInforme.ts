// shared/services/movimientosInforme.ts

import axiosInstance from './axiosConfig';
import type {
  CompraCostoDetalle,
  PedidoGananciaDetalle,
} from '../../modules/HU26_28_informes/model';
import type { AxiosResponse } from 'axios';

// la instancia ya apunta a "...:5252/api"
const API_BASE = '/sucursales';

/** Obtiene el resumen de movimientos */
export const getMovimientosMonetarios = async (
  desde: string,
  hasta: string
): Promise<{ ingresos: number; costos: number; ganancias: number }> => {
  const res: AxiosResponse<{ ingresos: number; costos: number; ganancias: number }> =
    await axiosInstance.get(`${API_BASE}/movimientos`, {
      params: { desde, hasta },
    });
  return res.data;
};

/** Exporta el resumen de movimientos */
export const exportarMovimientosExcel = async (desde: string, hasta: string): Promise<void> => {
  const res: AxiosResponse<Blob> = await axiosInstance.get<Blob>(
    `${API_BASE}/exportar-movimientos-excel`,
    {
      params: { desde, hasta },
      responseType: 'blob',
    }
  );
  const blob = new Blob([res.data], { type: res.data.type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `movimientos-monetarios-${desde}-${hasta}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/** Detalle de ganancias */
export const getDetalleGanancias = async (
  desde: string,
  hasta: string
): Promise<PedidoGananciaDetalle[]> => {
  const res: AxiosResponse<PedidoGananciaDetalle[]> = await axiosInstance.get<
    PedidoGananciaDetalle[]
  >(`${API_BASE}/detalle-ganancias`, { params: { desde, hasta } });
  return res.data;
};

/**
 * Obtiene el detalle de costos a partir de las compras de insumo
 */
export const getDetalleCostos = async (
  desde: string,
  hasta: string
): Promise<CompraCostoDetalle[]> => {
  const res = await axiosInstance.get<CompraCostoDetalle[]>(
    `${API_BASE}/detalle-costos`, // <-- quitar "/movimientos"
    { params: { desde, hasta } }
  );
  return res.data;
};

/** Exporta detalle de ganancias */
export const exportarDetalleGananciasExcel = async (
  desde: string,
  hasta: string
): Promise<void> => {
  const res: AxiosResponse<Blob> = await axiosInstance.get<Blob>(
    `${API_BASE}/exportar-detalle-ganancias-excel`,
    { params: { desde, hasta }, responseType: 'blob' }
  );
  const blob = new Blob([res.data], { type: res.data.type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `detalle-ganancias-${desde}-${hasta}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/** Exporta detalle de costos */
export const exportarDetalleCostosExcel = async (desde: string, hasta: string): Promise<void> => {
  const res: AxiosResponse<Blob> = await axiosInstance.get<Blob>(
    `${API_BASE}/exportar-detalle-costos-excel`,
    { params: { desde, hasta }, responseType: 'blob' }
  );
  const blob = new Blob([res.data], { type: res.data.type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `detalle-costos-${desde}-${hasta}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
