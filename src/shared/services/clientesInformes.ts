import axios from 'axios';
import {
  ClienteRanking,
  DetallePedidoDTO,
  PedidoResumenPorCliente,
} from '../../modules/HU26_28_informes/model';

export const getDetallePedidosCliente = async (
  clienteId: number,
  desde: string,
  hasta: string
): Promise<PedidoResumenPorCliente[]> => {
  const url = `http://localhost:5252/api/sucursales/pedidos-cliente?clienteId=${clienteId}&desde=${desde}&hasta=${hasta}`;
  console.log('🔍 Llamando a pedidos-cliente:', url);

  try {
    const res = await axios.get(url);
    console.log('✅ Respuesta pedidos-cliente:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error en pedidos-cliente:', error);
    throw error;
  }
};

export const getRankingClientes = async (
  desde: string,
  hasta: string,
  ordenarPor: string
): Promise<ClienteRanking[]> => {
  const url = `http://localhost:5252/api/sucursales/ranking-clientes?desde=${desde}&hasta=${hasta}&ordenarPor=${ordenarPor}`;
  console.log('🔍 Llamando a ranking-clientes:', url);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('❌ Error en respuesta ranking-clientes:', res.status, res.statusText);
      throw new Error(`Error al obtener ranking de clientes: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('✅ Respuesta ranking-clientes:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en ranking-clientes:', error);
    throw error;
  }
};

export const exportarRankingClientesExcel = async (
  desde: string,
  hasta: string,
  ordenarPor: string
): Promise<void> => {
  const url = `http://localhost:5252/api/sucursales/exportar-ranking-clientes-excel?desde=${desde}&hasta=${hasta}&ordenarPor=${ordenarPor}`;
  console.log('🔍 Llamando a exportar-excel:', url);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('❌ Error en respuesta exportar-excel:', res.status, res.statusText);
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

    console.log('✅ Excel descargado exitosamente');
  } catch (error) {
    console.error('❌ Error en exportar-excel:', error);
    throw error;
  }
};
