// shared/services/clientesInformes.ts

import axiosInstance from './axiosConfig'; // tu instancia de Axios preconfigurada
import type {
  ClienteRanking,
  DetallePedidoDTO,
  PedidoResumenPorCliente,
} from '../../modules/HU26_28_informes/model';

const API_BASE = '/sucursales';

export const exportarPedidosClienteExcel = async (
  clienteId: number,
  desde: string,
  hasta: string,
  nombreArchivo: string
): Promise<void> => {
  const url = `${API_BASE}/exportar-pedidos-cliente-excel`;
  const params = { clienteId, desde, hasta };
  const res = await axiosInstance.get<Blob>(url, {
    params,
    responseType: 'blob',
  });
  // construyo el link para descargar
  const blob = new Blob([res.data], { type: res.data.type });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${nombreArchivo}-pedidos.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
};

export const getDetallePedidosCliente = async (
  clienteId: number,
  desde: string,
  hasta: string
): Promise<PedidoResumenPorCliente[]> => {
  const url = `${API_BASE}/pedidos-cliente`;
  const res = await axiosInstance.get<PedidoResumenPorCliente[]>(url, {
    params: { clienteId, desde, hasta },
  });
  return res.data;
};

export const getRankingClientes = async (
  desde: string,
  hasta: string,
  ordenarPor: string
): Promise<ClienteRanking[]> => {
  const url = `${API_BASE}/ranking-clientes`;
  const res = await axiosInstance.get<ClienteRanking[]>(url, {
    params: { desde, hasta, ordenarPor },
  });
  return res.data;
};

export const exportarRankingClientesExcel = async (
  desde: string,
  hasta: string,
  ordenarPor: string
): Promise<void> => {
  const url = `${API_BASE}/exportar-ranking-clientes-excel`;
  const res = await axiosInstance.get<Blob>(url, {
    params: { desde, hasta, ordenarPor },
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: res.data.type });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'ranking-clientes.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
};
