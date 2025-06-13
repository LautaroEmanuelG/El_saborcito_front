import { PedidoCostoDetalle, PedidoGananciaDetalle } from '../../modules/HU26_28_informes/model';

export const getMovimientosMonetarios = async (desde: string, hasta: string) => {
  const res = await fetch(
    `http://localhost:5252/api/sucursales/movimientos?desde=${desde}&hasta=${hasta}`
  );
  if (!res.ok) throw new Error('Error al obtener movimientos monetarios');
  return await res.json();
};

export const exportarMovimientosExcel = async (desde: string, hasta: string): Promise<void> => {
  const res = await fetch(
    `http://localhost:5252/api/sucursales/exportar-movimientos-excel?desde=${desde}&hasta=${hasta}`,
    { method: 'GET' }
  );

  if (!res.ok) throw new Error('Error al exportar movimientos');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'movimientos-monetarios.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Nuevos servicios para detalles de ganancias y costos
export const getDetalleGanancias = async (
  desde: string,
  hasta: string
): Promise<PedidoGananciaDetalle[]> => {
  const response = await fetch(
    `http://localhost:5252/api/sucursales/detalle-ganancias?desde=${desde}&hasta=${hasta}`
  );
  if (!response.ok) {
    throw new Error('Error al obtener detalle de ganancias');
  }
  return response.json();
};

export const getDetalleCostos = async (
  desde: string,
  hasta: string
): Promise<PedidoCostoDetalle[]> => {
  const response = await fetch(
    `http://localhost:5252/api/sucursales/detalle-costos?desde=${desde}&hasta=${hasta}`
  );
  if (!response.ok) {
    throw new Error('Error al obtener detalle de costos');
  }
  return response.json();
};

export const exportarDetalleGananciasExcel = async (
  desde: string,
  hasta: string
): Promise<void> => {
  const response = await fetch(
    `http://localhost:5252/api/sucursales/exportar-detalle-ganancias-excel?desde=${desde}&hasta=${hasta}`
  );
  if (!response.ok) {
    throw new Error('Error al exportar detalle de ganancias');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `detalle-ganancias-${desde}-${hasta}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const exportarDetalleCostosExcel = async (desde: string, hasta: string): Promise<void> => {
  const response = await fetch(
    `http://localhost:5252/api/sucursales/exportar-detalle-costos-excel?desde=${desde}&hasta=${hasta}`
  );
  if (!response.ok) {
    throw new Error('Error al exportar detalle de costos');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `detalle-costos-${desde}-${hasta}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
