// shared/services/movimientosInforme.ts

import axiosInstance from './axiosConfig';
import type {
  PedidoCostoDetalle,
  PedidoGananciaDetalle,
} from '../../modules/HU26_28_informes/model';

const API_BASE = '/sucursales';

export const getMovimientosMonetarios = async (
  desde: string,
  hasta: string
): Promise<{ ingresos: number; costos: number; ganancias: number }> => {
  const res = await axiosInstance.get(`${API_BASE}/movimientos`, {
    params: { desde, hasta },
  });
  return res.data;
};

export const exportarMovimientosExcel = async (desde: string, hasta: string): Promise<void> => {
  const res = await axiosInstance.get<Blob>(`${API_BASE}/exportar-movimientos-excel`, {
    params: { desde, hasta },
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: res.data.type });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'movimientos-monetarios.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
};

export const getDetalleGanancias = async (
  desde: string,
  hasta: string
): Promise<PedidoGananciaDetalle[]> => {
  const res = await axiosInstance.get<PedidoGananciaDetalle[]>(`${API_BASE}/detalle-ganancias`, {
    params: { desde, hasta },
  });
  return res.data;
};

export const getDetalleCostos = async (
  desde: string,
  hasta: string
): Promise<PedidoCostoDetalle[]> => {
  const res = await axiosInstance.get<PedidoCostoDetalle[]>(`${API_BASE}/detalle-costos`, {
    params: { desde, hasta },
  });
  return res.data;
};

export const exportarDetalleGananciasExcel = async (
  desde: string,
  hasta: string
): Promise<void> => {
  const res = await axiosInstance.get<Blob>(`${API_BASE}/exportar-detalle-ganancias-excel`, {
    params: { desde, hasta },
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: res.data.type });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `detalle-ganancias-${desde}-${hasta}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
};

export const exportarDetalleCostosExcel = async (desde: string, hasta: string): Promise<void> => {
  const res = await axiosInstance.get<Blob>(`${API_BASE}/exportar-detalle-costos-excel`, {
    params: { desde, hasta },
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: res.data.type });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `detalle-costos-${desde}-${hasta}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
};
