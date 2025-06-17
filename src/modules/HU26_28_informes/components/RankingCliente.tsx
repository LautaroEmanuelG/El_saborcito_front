import { useEffect, useState } from 'react';
import {
  getRankingClientes,
  exportarRankingClientesExcel,
  getDetallePedidosCliente,
  exportarPedidosClienteExcel,
} from '../../../shared/services/clientesInformes';
import type { ClienteRanking, PedidoResumenPorCliente } from '../model';
import {
  formatearFecha,
  formatearMonto,
  validarRangoFechas,
  obtenerFechasPorDefecto,
  obtenerTextoOrdenamiento,
} from '../logic';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import IconoVer from '../../../assets/svgs/icons/IconoVer';

interface ClienteRankingExtended extends ClienteRanking {
  id: number;
  denominacion: string;
  eliminado?: boolean;
}

export const RankingCliente = () => {
  const fechasPorDefecto = obtenerFechasPorDefecto();
  const [clientes, setClientes] = useState<ClienteRankingExtended[]>([]);
  const [desde, setDesde] = useState(fechasPorDefecto.desde);
  const [hasta, setHasta] = useState(fechasPorDefecto.hasta);
  const [ordenarPor, setOrdenarPor] = useState<'cantidad' | 'importe'>('cantidad');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteRanking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidosCliente, setPedidosCliente] = useState<PedidoResumenPorCliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validación de rango
  const errorValidacion = validarRangoFechas(desde, hasta);
  const isInvalidRange = Boolean(errorValidacion);

  useEffect(() => {
    if (isInvalidRange) {
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
      const adaptados: ClienteRankingExtended[] = data.map((c) => ({
        ...c,
        id: c.idCliente,
        denominacion: c.nombreCompleto,
        eliminado: false,
      }));
      setClientes(adaptados);
    } catch {
      setError('Error al cargar el ranking de clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    if (isInvalidRange) {
      setError(errorValidacion);
      return;
    }
    try {
      setError(null);
      await exportarRankingClientesExcel(desde, hasta, ordenarPor);
    } catch {
      setError('Error al exportar Excel');
    }
  };

  const handleVerPedidos = async (c: ClienteRankingExtended) => {
    try {
      setLoading(true);
      setError(null);
      const pedidos = await getDetallePedidosCliente(c.idCliente, desde, hasta);
      setPedidosCliente(Array.isArray(pedidos) ? pedidos : []);
      setClienteSeleccionado(c);
      setModalVisible(true);
    } catch {
      setError('Error al cargar los pedidos del cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPedidos = async () => {
    if (!clienteSeleccionado || isInvalidRange) return;
    try {
      await exportarPedidosClienteExcel(
        clienteSeleccionado.idCliente,
        desde,
        hasta,
        clienteSeleccionado.nombreCompleto.replace(/\s+/g, '_')
      );
    } catch {
      alert('Error al exportar pedidos de cliente');
    }
  };

  const columns = [
    { label: 'Nombre Cliente', key: 'nombreCompleto' },
    {
      label: 'Cant. Pedidos',
      key: 'cantidadPedidos',
      render: (c: ClienteRankingExtended) => (
        <span className="text-primary font-semibold">{c.cantidadPedidos}</span>
      ),
    },
    {
      label: 'Total Gastado',
      key: 'totalImporte',
      render: (c: ClienteRankingExtended) => (
        <span className="font-semibold">{formatearMonto(c.totalImporte)}</span>
      ),
    },
    {
      label: 'Ordenado Por',
      key: 'ordenamiento',
      render: () => (
        <span className="text-xs text-gray-500">
          {ordenarPor === 'cantidad' ? 'Por cantidad' : 'Por importe'}
        </span>
      ),
    },
    {
      label: 'Ver Detalles',
      key: 'acciones',
      render: (c: ClienteRankingExtended) => (
        <button
          onClick={() => handleVerPedidos(c)}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary hover:text-white transition-colors"
          title={`Ver pedidos de ${c.nombreCompleto}`}
        >
          <IconoVer className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white p-8 rounded-xl w-full shadow-md max-w-full overflow-x-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-negro pb-4 mb-8 flex-wrap">
        <h2 className="text-2xl font-bold text-negro mr-6">Ranking de clientes</h2>
        <div className="flex gap-4 bg-gray-200 p-2 rounded-lg items-center">
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">Desde:</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">Hasta:</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">Ordenar por:</label>
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value as 'cantidad' | 'importe')}
              className="border border-gray-300 px-2 py-1 rounded"
            >
              <option value="cantidad">Cantidad de pedidos</option>
              <option value="importe">Importe total</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen */}
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

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabla o loader */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando ranking de clientes...</p>
        </div>
      ) : (
        <>
          <TableGeneric
            columns={columns}
            rows={clientes}
            handleDelete={() => {}}
            setOpenModal={() => {}}
            setSelectedItem={() => {}}
            showSearchBar
            showCategoryFilter={false}
            searchPlaceholder="Buscar cliente..."
            onToggleDeleted={undefined}
          />

          {/* Botones principales */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={fetchClientes}
              disabled={loading}
              className="bg-primary hover:bg-primarydark disabled:bg-gray-400 text-white px-6 py-2 rounded shadow font-bold transition-colors"
            >
              {loading ? 'Cargando...' : 'Ver Más'}
            </button>
            <button
              onClick={handleExportar}
              disabled={loading || isInvalidRange || clientes.length === 0}
              className={`px-6 py-2 rounded shadow font-bold transition-colors ${
                loading || isInvalidRange || clientes.length === 0
                  ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Exportar a Excel
            </button>
          </div>
        </>
      )}

      {modalVisible && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-4xl max-h-[80dvh] overflow-y-auto relative">
            {/* Header modal */}
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <div>
                <h2 className="text-xl font-bold text-negro">
                  {clienteSeleccionado.nombreCompleto}
                </h2>
                <p className="text-sm text-gray-600">
                  {clienteSeleccionado.cantidadPedidos} pedido
                  {clienteSeleccionado.cantidadPedidos > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setModalVisible(false)}
                className="text-negro hover:text-primary text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Detalles de pedidos */}
            {pedidosCliente.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                No hay pedidos en el período seleccionado
              </p>
            ) : (
              <div className="space-y-4">
                {pedidosCliente.map((pedido) => {
                  // Total ya incluye promociones si vienen en DTO
                  const totalCalc = pedido.total;

                  return (
                    <div key={pedido.idPedido} className="border border-gray-200 rounded-lg p-4">
                      {/* Cabecera de cada pedido */}
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg">Pedido #{pedido.idPedido}</h3>
                        <p className="text-sm text-gray-600">
                          {formatearFecha(pedido.fechaPedido)}
                        </p>
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
                          {pedido.detalles.map((det) => {
                            console.log('det :>> ', det);
                            return (
                              <tr
                                key={det.id ?? `promo-${det.promocionOrigenId}`}
                                className="border-t border-gray-100"
                              >
                                <td className="py-2 px-3">
                                  {det.origen === 'PROMOCION'
                                    ? `🎁 ${det.articulo.denominacion}`
                                    : det.articulo.denominacion}
                                </td>
                                <td className="py-2 px-3 text-center">{det.cantidad}</td>
                                <td className="py-2 px-3 text-right">
                                  {det.origen === 'PROMOCION'
                                    ? '–'
                                    : formatearMonto(det.articulo.precioVenta || 0)}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold">
                                  {formatearMonto(det.subtotal)}
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
                              {formatearMonto(totalCalc)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Botones modal */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                onClick={handleExportarPedidos}
                disabled={isInvalidRange}
                className={`px-5 py-2 rounded font-bold transition-colors ${
                  isInvalidRange
                    ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Exportar Pedidos
              </button>
              <button
                onClick={() => setModalVisible(false)}
                className="bg-primarydark hover:bg-primary text-white px-5 py-2 rounded font-bold"
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
