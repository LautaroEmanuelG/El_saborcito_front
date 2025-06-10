import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  getRankingClientes,
  exportarRankingClientesExcel,
  getDetallePedidosCliente,
} from '../../../shared/services/clientesInformes';
import type { ClienteRanking, PedidoResumenPorCliente } from '../model';
import {
  formatearFecha,
  formatearMonto,
  validarRangoFechas,
  obtenerFechasPorDefecto,
  calcularSubtotal,
  obtenerTextoOrdenamiento,
} from '../logic';
import IconoVer from '../../../assets/svgs/icons/IconoVer';

export const RankingCliente = () => {
  const [clientes, setClientes] = useState<ClienteRanking[]>([]);
  const fechasPorDefecto = obtenerFechasPorDefecto();
  const [desde, setDesde] = useState(fechasPorDefecto.desde);
  const [hasta, setHasta] = useState(fechasPorDefecto.hasta);
  const [ordenarPor, setOrdenarPor] = useState<'cantidad' | 'importe'>('cantidad');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteRanking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidosCliente, setPedidosCliente] = useState<PedidoResumenPorCliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorValidacion = validarRangoFechas(desde, hasta);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }
    fetchClientes();
  }, [desde, hasta, ordenarPor]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRankingClientes(desde, hasta, ordenarPor);
      setClientes(data);
    } catch (error) {
      console.error('Error al obtener ranking de clientes', error);
      setError('Error al cargar el ranking de clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    const errorValidacion = validarRangoFechas(desde, hasta);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    try {
      setError(null);
      await exportarRankingClientesExcel(desde, hasta, ordenarPor);
    } catch (err) {
      const errorMsg = 'Error al exportar Excel';
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleVerPedidos = async (cliente: ClienteRanking) => {
    try {
      setLoading(true);
      setError(null);
      const pedidos = await getDetallePedidosCliente(cliente.idCliente, desde, hasta);
      setPedidosCliente(Array.isArray(pedidos) ? pedidos : []);
      setClienteSeleccionado(cliente);
      setModalVisible(true);
    } catch (error) {
      console.error('Error al obtener detalle de pedidos', error);
      setError('Error al cargar los pedidos del cliente');
    } finally {
      setLoading(false);
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 text-sm text-gray-600">
        {obtenerTextoOrdenamiento(ordenarPor)} • Período: {formatearFecha(desde)} -{' '}
        {formatearFecha(hasta)}
        {clientes.length > 0 && (
          <span className="ml-4 font-semibold text-primary">
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} encontrado
            {clientes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando ranking de clientes...</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-2">No hay datos para mostrar</p>
          <p className="text-gray-500 text-sm">
            No se encontraron clientes con pedidos en el período seleccionado
          </p>
        </div>
      ) : (
        <table className="w-full text-sm text-left border-t border-b border-gray-300">
          <thead className="text-negro font-bold">
            <tr className="border-b border-gray-300">
              <th className="py-3 px-2">Nombre Cliente</th>
              <th className="py-3 px-2 text-primary">Cant. Pedidos</th>
              <th className="py-3 px-2">Total Gastado</th>
              <th
                className="py-3 px-2 text-primary cursor-pointer hover:underline select-none"
                onClick={() => setOrdenarPor(ordenarPor === 'cantidad' ? 'importe' : 'cantidad')}
                title="Haz clic para cambiar el orden"
              >
                Ordenar Por: {ordenarPor === 'cantidad' ? 'Pedidos ↓' : 'Importe ↓'}
              </th>
              <th className="py-3 px-2 text-center">Ver Detalles</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente, index) => (
              <tr
                key={cliente.idCliente ?? `cliente-${index}`}
                className="border-b border-gray-200 hover:bg-blanco transition-colors"
              >
                <td className="py-3 px-2 font-medium">{cliente.nombreCompleto}</td>
                <td className="py-3 px-2 text-primary font-semibold text-center">
                  {cliente.cantidadPedidos}
                </td>
                <td className="py-3 px-2 font-semibold">{formatearMonto(cliente.totalImporte)}</td>
                <td className="py-3 px-2 text-xs text-gray-500">
                  {ordenarPor === 'cantidad' ? 'Por cantidad' : 'Por importe'}
                </td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => handleVerPedidos(cliente)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary hover:text-white transition-colors"
                    title={`Ver pedidos de ${cliente.nombreCompleto}`}
                  >
                    <IconoVer className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={fetchClientes}
          disabled={loading}
          className="bg-primary hover:bg-primarydark disabled:bg-gray-400 text-white px-6 py-2 rounded shadow font-bold transition-colors"
        >
          {loading ? 'Cargando...' : 'Ver Mas'}
        </button>
        <button
          onClick={handleExportar}
          disabled={loading || clientes.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded shadow font-bold transition-colors"
        >
          Exportar a Excel
        </button>
      </div>

      {/* MODAL MEJORADO */}
      {modalVisible && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto relative">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <div>
                <h2 className="text-xl font-bold text-negro">
                  {clienteSeleccionado.nombreCompleto}
                </h2>
                <p className="text-sm text-gray-600">
                  {clienteSeleccionado.cantidadPedidos} pedidos - Total:{' '}
                  {formatearMonto(clienteSeleccionado.totalImporte)}
                </p>
              </div>
              <button
                onClick={() => setModalVisible(false)}
                className="text-negro hover:text-primary text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {pedidosCliente.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                No hay pedidos en el período seleccionado
              </p>
            ) : (
              <div className="space-y-4">
                {pedidosCliente.map((pedido) => {
                  // Calcular total real del pedido (por si llega como 0)
                  const totalCalculado =
                    pedido.total && pedido.total > 0
                      ? pedido.total
                      : pedido.detalles.reduce(
                          (sum, detalle) =>
                            sum +
                            calcularSubtotal(detalle.cantidad, detalle.articulo.precioVenta || 0),
                          0
                        );

                  return (
                    <div key={pedido.idPedido} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg">Pedido #{pedido.idPedido}</h3>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {formatearFecha(pedido.fechaPedido)}
                          </p>
                          <p className="font-bold text-primary text-lg">
                            {formatearMonto(totalCalculado)}
                          </p>
                        </div>
                      </div>

                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-2 px-3">Artículo</th>
                            <th className="text-center py-2 px-3">Cantidad</th>
                            <th className="text-right py-2 px-3">Precio Unit.</th>
                            <th className="text-right py-2 px-3">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedido.detalles.map((detalle) => {
                            const subtotal = calcularSubtotal(
                              detalle.cantidad,
                              detalle.articulo.precioVenta || 0
                            );
                            return (
                              <tr key={detalle.id} className="border-t border-gray-100">
                                <td className="py-2 px-3">{detalle.articulo.denominacion}</td>
                                <td className="py-2 px-3 text-center">{detalle.cantidad}</td>
                                <td className="py-2 px-3 text-right">
                                  {formatearMonto(detalle.articulo.precioVenta || 0)}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold">
                                  {formatearMonto(subtotal)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                          <tr>
                            <td colSpan={3} className="py-3 px-3 text-right font-bold">
                              Total del Pedido:
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-lg text-primary">
                              {formatearMonto(totalCalculado)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-primary hover:bg-primarydark text-white px-5 py-2 rounded font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
