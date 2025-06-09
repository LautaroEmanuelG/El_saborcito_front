import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  getRankingClientes,
  exportarRankingClientesExcel,
  getDetallePedidosCliente,
} from '../../../shared/services/clientesInformes';
import type { ClienteRanking, DetallePedidoDTO } from '../model';
import { IconEye } from '@tabler/icons-react';

export const RankingCliente = () => {
  const [clientes, setClientes] = useState<ClienteRanking[]>([]);
  const [desde, setDesde] = useState(() => format(new Date(), 'yyyy-01-01'));
  const [hasta, setHasta] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [ordenarPor, setOrdenarPor] = useState<'cantidad' | 'importe'>('cantidad');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteRanking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detallePedidos, setDetallePedidos] = useState<DetallePedidoDTO[]>([]);

  useEffect(() => {
    fetchClientes();
  }, [desde, hasta, ordenarPor]);

  const fetchClientes = async () => {
    try {
      const data = await getRankingClientes(desde, hasta, ordenarPor);
      setClientes(data);
    } catch (error) {
      console.error('Error al obtener ranking de clientes', error);
    }
  };

  const handleExportar = async () => {
    try {
      await exportarRankingClientesExcel(desde, hasta, ordenarPor);
    } catch (err) {
      alert('Error al exportar Excel');
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-full overflow-x-auto">
      <div className="flex justify-between items-center border-b-2 border-negro pb-4 mb-8 flex-wrap">
        <h2 className="text-2xl font-bold text-negro mr-6">Ranking de clientes</h2>

        <div className="flex gap-6 bg-secondary text-black p-2 rounded-lg items-center">
          <div>
            <label className="block text-sm text-negro font-medium mb-1">Desde:</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-negro font-medium mb-1">Hasta:</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            />
          </div>
        </div>
      </div>

      <table className="w-full text-sm text-left border-t border-b border-gray-300">
        <thead className="text-negro font-bold">
          <tr className="border-b border-gray-300">
            <th className="py-2">Nombre Cliente</th>
            <th className="py-2 text-primary">Cant Pedidos</th>
            <th className="py-2">Total Gastado</th>
            <th
              className="py-2 text-primary cursor-pointer"
              onClick={() => setOrdenarPor(ordenarPor === 'cantidad' ? 'importe' : 'cantidad')}
            >
              Ordenar Por: {ordenarPor === 'cantidad' ? 'Pedidos' : 'Importe'}
            </th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id} className="border-b border-gray-200 hover:bg-blanco transition">
              <td className="py-2">{c.nombreCompleto}</td>
              <td className="py-2 text-primary">{c.cantidadPedidos}</td>
              <td className="py-2">${c.totalImporte.toLocaleString()}</td>
              <td className="py-2">
                <IconEye
                  className="w-5 h-5 cursor-pointer text-negro hover:text-primary transition"
                  onClick={async () => {
                    try {
                      const detalles = await getDetallePedidosCliente(c.id, desde, hasta);
                      setDetallePedidos(Array.isArray(detalles) ? detalles : []);
                      setClienteSeleccionado(c);
                      setModalVisible(true);
                    } catch (error) {
                      console.error('Error al obtener detalle de pedidos', error);
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-6">
        <button className="bg-primary hover:bg-primarydark text-white px-6 py-2 rounded shadow font-bold">
          Ver Más
        </button>
        <button
          onClick={handleExportar}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow font-bold"
        >
          Exportar a Excel
        </button>
      </div>

      {/* MODAL */}
      {modalVisible && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-xl relative">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-xl font-bold text-negro">{clienteSeleccionado.nombreCompleto}</h2>
              <button
                onClick={() => setModalVisible(false)}
                className="text-negro hover:text-primary text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <table className="w-full text-sm text-left border-t border-b border-gray-300 mb-4">
              <thead className="text-primary font-bold">
                <tr>
                  <th className="py-2">Nombre Pedido</th>
                  <th className="py-2">Precio Venta</th>
                </tr>
              </thead>
              <tbody>
                {detallePedidos.map((detalle) => (
                  <tr key={detalle.id} className="border-b border-gray-200">
                    <td className="py-2">{detalle.articulo.denominacion}</td>
                    <td className="py-2">
                      ${detalle.articulo.precioVenta?.toLocaleString() ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-primary hover:bg-primarydark text-white px-5 py-2 rounded font-bold"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
