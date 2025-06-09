import axios from 'axios';
import { ClienteRanking, DetallePedidoDTO } from '../../modules/HU26_28_informes/model';

export const getDetallePedidosCliente = async (
  clienteId: number,
  desde: string,
  hasta: string
): Promise<DetallePedidoDTO[]> => {
  const url = `/api/sucursales/pedidos-cliente?clienteId=${clienteId}&desde=${desde}&hasta=${hasta}`;
  const res = await axios.get(url);
  return res.data;
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
