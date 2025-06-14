import axios from 'axios';
import {
  ClienteRanking,
  DetallePedidoDTO,
  PedidoResumenPorCliente,
} from '../../modules/HU26_28_informes/model';

export const exportarPedidosClienteExcel = async (
  clienteId: number,
  desde: string,
  hasta: string,
  nombreArchivo: string
): Promise<void> => {
  const url = `http://localhost:5252/api/sucursales/exportar-pedidos-cliente-excel`;
  const params = new URLSearchParams({ clienteId: String(clienteId), desde, hasta });
  const res = await fetch(`${url}?${params.toString()}`, { method: 'GET' });
  if (!res.ok) throw new Error('Error al exportar pedidos de cliente');
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  // usar el nombre del cliente
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
  const url = `http://localhost:5252/api/sucursales/pedidos-cliente?clienteId=${clienteId}&desde=${desde}&hasta=${hasta}`;

  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getRankingClientes = async (
  desde: string,
  hasta: string,
  ordenarPor: string
): Promise<ClienteRanking[]> => {
  const url = `http://localhost:5252/api/sucursales/ranking-clientes?desde=${desde}&hasta=${hasta}&ordenarPor=${ordenarPor}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Error al obtener ranking de clientes: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const exportarRankingClientesExcel = async (
  desde: string,
  hasta: string,
  ordenarPor: string
): Promise<void> => {
  const url = `http://localhost:5252/api/sucursales/exportar-ranking-clientes-excel?desde=${desde}&hasta=${hasta}&ordenarPor=${ordenarPor}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Error al exportar Excel de clientes: ${res.status} ${res.statusText}`);
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'ranking-clientes.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    throw error;
  }
};
