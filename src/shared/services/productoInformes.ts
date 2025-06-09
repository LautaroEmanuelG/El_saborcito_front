import { ProductoRankingResponse } from '../../modules/HU26_28_informes/model';

export const getRankingProductos = async (
  desde: string,
  hasta: string
): Promise<ProductoRankingResponse> => {
  const res = await fetch(
    `http://localhost:5252/api/sucursales/ranking-productos?desde=${desde}&hasta=${hasta}`
  );
  if (!res.ok) throw new Error('Error al obtener ranking');
  return await res.json();
};

export const exportarRankingExcel = async (desde: string, hasta: string): Promise<void> => {
  const res = await fetch(
    `http://localhost:5252/api/sucursales/exportar-excel?desde=${desde}&hasta=${hasta}`,
    { method: 'GET' }
  );

  if (!res.ok) throw new Error('Error al exportar Excel');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ranking-productos.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
