import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';
import {
  exportarMovimientosExcel,
  getMovimientosMonetarios,
  getDetalleGanancias,
  getDetalleCostos,
  exportarDetalleGananciasExcel,
  exportarDetalleCostosExcel,
} from '../../../shared/services/movimientosInforme';
import { PedidoGananciaDetalle, PedidoCostoDetalle } from '../model';
// Removemos los imports del TableGeneric ya que usaremos una tabla personalizada

ChartJS.register(ArcElement, Tooltip, Legend);

export const MovimientosMonetarios = () => {
  const [desde, setDesde] = useState(() => format(new Date(), 'yyyy-01-01'));
  const [hasta, setHasta] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [datos, setDatos] = useState({ ingresos: 0, costos: 0, ganancias: 0 });

  // Estados para modales
  const [showGananciasModal, setShowGananciasModal] = useState(false);
  const [showCostosModal, setShowCostosModal] = useState(false);
  const [gananciasData, setGananciasData] = useState<PedidoGananciaDetalle[]>([]);
  const [costosData, setCostosData] = useState<PedidoCostoDetalle[]>([]);
  const [loadingGanancias, setLoadingGanancias] = useState(false);
  const [loadingCostos, setLoadingCostos] = useState(false);

  useEffect(() => {
    fetchMovimientos();
  }, [desde, hasta]);

  const fetchMovimientos = async () => {
    try {
      const data = await getMovimientosMonetarios(desde, hasta);
      setDatos(data);
    } catch (err) {
      console.error('Error al obtener movimientos:', err);
    }
  };

  const handleExportar = async () => {
    try {
      await exportarMovimientosExcel(desde, hasta);
    } catch (err) {
      alert('Error al exportar Excel');
      console.error(err);
    }
  };

  const handleVerGanancias = async () => {
    setLoadingGanancias(true);
    try {
      const data = await getDetalleGanancias(desde, hasta);
      setGananciasData(data);
      setShowGananciasModal(true);
    } catch (err) {
      alert('Error al obtener detalle de ganancias');
      console.error(err);
    } finally {
      setLoadingGanancias(false);
    }
  };

  const handleVerCostos = async () => {
    setLoadingCostos(true);
    try {
      const data = await getDetalleCostos(desde, hasta);
      setCostosData(data);
      setShowCostosModal(true);
    } catch (err) {
      alert('Error al obtener detalle de costos');
      console.error(err);
    } finally {
      setLoadingCostos(false);
    }
  };

  const handleExportarGanancias = async () => {
    try {
      await exportarDetalleGananciasExcel(desde, hasta);
    } catch (err) {
      alert('Error al exportar Excel de ganancias');
      console.error(err);
    }
  };

  const handleExportarCostos = async () => {
    try {
      await exportarDetalleCostosExcel(desde, hasta);
    } catch (err) {
      alert('Error al exportar Excel de costos');
      console.error(err);
    }
  };

  // Estados para búsqueda en las tablas
  const [searchGanancias, setSearchGanancias] = useState('');
  const [searchCostos, setSearchCostos] = useState('');

  const pieDataIngresos = {
    labels: ['Ingresos', 'Costos', 'Ganancias'],
    datasets: [
      {
        data: [datos.ingresos, datos.costos, datos.ganancias],
        backgroundColor: ['#16a34a', '#dc2626', '#2563eb'], // verde, rojo, azul
      },
    ],
  };

  const totalGanancias = gananciasData.reduce((sum, item) => sum + item.total, 0);
  const totalCostos = costosData.reduce((sum, item) => sum + item.totalCosto, 0);

  // Filtrar datos para búsqueda
  const filteredGanancias = gananciasData.filter(
    (item) =>
      item.idPedido.toString().includes(searchGanancias) ||
      new Date(item.fechaPedido).toLocaleDateString().includes(searchGanancias)
  );

  const filteredCostos = costosData.filter(
    (item) =>
      item.idPedido.toString().includes(searchCostos) ||
      new Date(item.fechaPedido).toLocaleDateString().includes(searchCostos)
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-full overflow-x-auto">
      <div className="flex items-center justify-between border-b-2 border-negro pb-4 mb-8 flex-wrap">
        <h2 className="text-2xl font-bold text-negro mr-6">Movimientos monetarios</h2>{' '}
        {/* 📌 Se agregó mr-6 para separarlo del grupo de fechas */}
        <div className="flex gap-6 bg-secondary text-black p-2 rounded-lg items-center">
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
        </div>
      </div>

      <div className="grid grid-cols-3 text-center font-semibold border-b-2 border-negro pb-2 mb-4">
        <div>
          <p className="text-gray-600">Ingresos</p>
          <p className="text-lg font-bold text-negro">${datos.ingresos.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Costos</p>
          <p className="text-lg font-bold text-negro">${datos.costos.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Total Ganancias</p>
          <p className="text-lg font-bold text-green-600">${datos.ganancias.toLocaleString()}</p>
        </div>
      </div>

      <div className="w-full max-w-[450px] mx-auto">
        <h4 className="text-center font-semibold mb-2">
          Distribución de Ingresos, Costos y Ganancias
        </h4>
        <Pie data={pieDataIngresos} />
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleExportar}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow font-bold"
        >
          Exportar a Excel
        </button>
      </div>

      {/* Botones Ver más en color rojo */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handleVerGanancias}
          disabled={loadingGanancias}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow font-bold disabled:opacity-50"
        >
          {loadingGanancias ? 'Cargando...' : 'Ver ganancias'}
        </button>
        <button
          onClick={handleVerCostos}
          disabled={loadingCostos}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow font-bold disabled:opacity-50"
        >
          {loadingCostos ? 'Cargando...' : 'Ver costos'}
        </button>
      </div>

      {/* Modal de Ganancias */}
      {showGananciasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Detalle de Ganancias</h3>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-green-600">
                  Total: ${totalGanancias.toLocaleString()}
                </span>
                <button
                  onClick={handleExportarGanancias}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Exportar Excel
                </button>
                <button
                  onClick={() => setShowGananciasModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por ID o fecha..."
                value={searchGanancias}
                onChange={(e) => setSearchGanancias(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGanancias.map((item) => (
                    <tr key={item.idPedido} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.idPedido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.fechaPedido).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Costos */}
      {showCostosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Detalle de Costos</h3>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-red-600">
                  Total: ${totalCostos.toLocaleString()}
                </span>
                <button
                  onClick={handleExportarCostos}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Exportar Excel
                </button>
                <button
                  onClick={() => setShowCostosModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por ID o fecha..."
                value={searchCostos}
                onChange={(e) => setSearchCostos(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Costo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCostos.map((item) => (
                    <tr key={item.idPedido} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.idPedido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.fechaPedido).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.totalCosto.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
