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
import { validarRangoFechas } from '../logic';

ChartJS.register(ArcElement, Tooltip, Legend);

export const MovimientosMonetarios = () => {
  const [desde, setDesde] = useState(() => format(new Date(), 'yyyy-01-01'));
  const [hasta, setHasta] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [datos, setDatos] = useState({ ingresos: 0, costos: 0, ganancias: 0 });
  const [error, setError] = useState<string | null>(null);

  const errorValidacion = validarRangoFechas(desde, hasta);
  const isInvalidRange = Boolean(errorValidacion);

  const isEmptyData = datos.ingresos === 0 && datos.costos === 0 && datos.ganancias === 0;

  const [showGananciasModal, setShowGananciasModal] = useState(false);
  const [showCostosModal, setShowCostosModal] = useState(false);
  const [gananciasData, setGananciasData] = useState<PedidoGananciaDetalle[]>([]);
  const [costosData, setCostosData] = useState<PedidoCostoDetalle[]>([]);
  const [loadingGanancias, setLoadingGanancias] = useState(false);
  const [loadingCostos, setLoadingCostos] = useState(false);

  useEffect(() => {
    if (errorValidacion) {
      setError(errorValidacion);
      setDatos({ ingresos: 0, costos: 0, ganancias: 0 });
    } else {
      setError(null);
      fetchMovimientos();
    }
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
    if (isInvalidRange) return;
    try {
      await exportarMovimientosExcel(desde, hasta);
    } catch {
      alert('Error al exportar Excel');
    }
  };

  const handleVerGanancias = async () => {
    if (isInvalidRange) return;
    setLoadingGanancias(true);
    try {
      const data = await getDetalleGanancias(desde, hasta);
      setGananciasData(data);
      setShowGananciasModal(true);
    } catch {
      alert('Error al obtener detalle de ganancias');
    } finally {
      setLoadingGanancias(false);
    }
  };

  const handleVerCostos = async () => {
    if (isInvalidRange) return;
    setLoadingCostos(true);
    try {
      const data = await getDetalleCostos(desde, hasta);
      setCostosData(data);
      setShowCostosModal(true);
    } catch {
      alert('Error al obtener detalle de costos');
    } finally {
      setLoadingCostos(false);
    }
  };

  const handleExportarGanancias = async () => {
    if (isInvalidRange) return;
    try {
      await exportarDetalleGananciasExcel(desde, hasta);
    } catch {
      alert('Error al exportar Excel de ganancias');
    }
  };

  const handleExportarCostos = async () => {
    if (isInvalidRange) return;
    try {
      await exportarDetalleCostosExcel(desde, hasta);
    } catch {
      alert('Error al exportar Excel de costos');
    }
  };

  //const totalGanancias = gananciasData.reduce((acc, i) => acc + i.total, 0);
  //const totalCostos    = costosData.reduce((acc, i) => acc + i.totalCosto, 0);

  const pieData = {
    labels: ['Ingresos', 'Costos', 'Ganancias'],
    datasets: [
      {
        data: [datos.ingresos, datos.costos, datos.ganancias],
        backgroundColor: ['#16a34a', '#dc2626', '#2563eb'],
      },
    ],
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-full overflow-x-auto">
      {/* Fechas */}
      <div className="flex items-center justify-between border-b-2 border-negro pb-4 mb-8 flex-wrap">
        <h2 className="text-2xl font-bold text-negro mr-6">Movimientos monetarios</h2>
        <div className="flex gap-4 bg-gray-200 p-2 rounded-lg items-center">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Desde:</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hasta:</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            />
          </div>
        </div>
      </div>

      {/* Error rango */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Resumen */}
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
          <p className="text-gray-600">Ganancias</p>
          <p className="text-lg font-bold text-green-600">${datos.ganancias.toLocaleString()}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full max-w-[450px] mx-auto mb-8">
        <h4 className="text-center font-semibold mb-2">Distribución</h4>
        <Pie data={pieData} />
      </div>

      {/* Exportar principal */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleExportar}
          disabled={isInvalidRange || isEmptyData}
          className={`px-6 py-2 rounded-lg shadow font-bold transition-colors ${
            isInvalidRange || isEmptyData
              ? 'bg-gray-400 cursor-not-allowed text-gray-700'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          Exportar a Excel
        </button>
      </div>

      {/* Ver más */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleVerGanancias}
          disabled={loadingGanancias || isInvalidRange}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow font-bold disabled:opacity-50"
        >
          {loadingGanancias ? 'Cargando...' : 'Ver ganancias'}
        </button>
        <button
          onClick={handleVerCostos}
          disabled={loadingCostos || isInvalidRange}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow font-bold disabled:opacity-50"
        >
          {loadingCostos ? 'Cargando...' : 'Ver costos'}
        </button>
      </div>

      {/* Modal Ganancias */}
      {showGananciasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header modal con título, total y botón de cerrar */}
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h3 className="text-xl font-bold">Detalle de Ganancias</h3>
              <button
                onClick={() => setShowGananciasModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Cerrar"
              >
                &times;
              </button>
            </div>
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs text-gray-500 uppercase">ID Pedido</th>
                  <th className="px-6 py-3 text-xs text-gray-500 uppercase">Fecha Pedido</th>
                  <th className="px-6 py-3 text-xs text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {gananciasData.map((i) => (
                  <tr key={i.idPedido}>
                    <td className="px-6 py-4 text-sm text-gray-900">{i.idPedido}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(i.fechaPedido).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">${i.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                onClick={handleExportarGanancias}
                disabled={isInvalidRange || isEmptyData}
                className={`px-5 py-2 rounded font-bold transition-colors ${
                  isInvalidRange || isEmptyData
                    ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Exportar a Excel
              </button>
              <button
                onClick={() => setShowGananciasModal(false)}
                className="bg-primary hover:bg-primarydark text-white px-5 py-2 rounded font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Costos */}
      {showCostosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h3 className="text-xl font-bold">Detalle de Costos</h3>
              <button
                onClick={() => setShowCostosModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Cerrar"
              >
                &times;
              </button>
            </div>
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs text-gray-500 uppercase">ID Pedido</th>
                  <th className="px-6 py-3 text-xs text-gray-500 uppercase">Fecha Pedido</th>
                  <th className="px-6 py-3 text-xs text-gray-500 uppercase">Total Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {costosData.map((i) => (
                  <tr key={i.idPedido}>
                    <td className="px-6 py-4 text-sm text-gray-900">{i.idPedido}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(i.fechaPedido).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${i.totalCosto.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                onClick={handleExportarCostos}
                disabled={isInvalidRange || isEmptyData}
                className={`px-5 py-2 rounded font-bold transition-colors ${
                  isInvalidRange || isEmptyData
                    ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Exportar a Excel
              </button>
              <button
                onClick={() => setShowCostosModal(false)}
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
