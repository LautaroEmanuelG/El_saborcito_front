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
