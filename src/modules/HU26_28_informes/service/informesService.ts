// src/modules/HU26_28_informes/informes/services/informesService.ts

import { ClienteRanking, ProductoRanking, DetallePedidoDTO } from '../model';
import axios from 'axios';

const API_URL = 'http://localhost:5252/api/sucursales';

export const getDetallePedidosCliente = async (
  clienteId: number,
  desde: string,
  hasta: string
): Promise<DetallePedidoDTO[]> => {
  const response = await axios.get(`${API_URL}/pedidos-cliente`, {
    params: { clienteId, desde, hasta },
  });
  return response.data;
};

export const getRankingProductos = async (
  desde: string,
  hasta: string
): Promise<ProductoRanking[]> => {
  const res = await fetch(
    `http://localhost:5252/api/sucursales/ranking-productos?desde=${desde}&hasta=${hasta}`
  );
  if (!res.ok) throw new Error('Error al obtener ranking');
  return await res.json();
};

export const exportarRankingExcel = async (desde: string, hasta: string): Promise<void> => {
  const res = await fetch(
    `http://localhost:5252/api/sucursales/exportar-excel?desde=${desde}&hasta=${hasta}`,
    {
      method: 'GET',
    }
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

export const getRankingClientes = async (
  desde: string,
  hasta: string,
  ordenarPor: string
): Promise<ClienteRanking[]> => {
  const res = await fetch(
    `http://localhost:5252/api/sucursales/ranking-clientes?desde=${desde}&hasta=${hasta}&ordenarPor=${ordenarPor}`
  );
  if (!res.ok) throw new Error('Error al obtener ranking de clientes');
  return await res.json();
};

export const exportarRankingClientesExcel = async (
  desde: string,
  hasta: string,
  ordenarPor: string
): Promise<void> => {
  const res = await fetch(
    `http://localhost:5252/api/sucursales/exportar-ranking-clientes-excel?desde=${desde}&hasta=${hasta}&ordenarPor=${ordenarPor}`,
    {
      method: 'GET',
    }
  );

  if (!res.ok) throw new Error('Error al exportar Excel de clientes');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ranking-clientes.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
