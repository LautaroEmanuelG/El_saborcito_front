import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';

import {
  getMovimientosMonetarios,
  exportarMovimientosExcel,
  getDetalleGanancias,
  getDetalleCostos,
  exportarDetalleGananciasExcel,
  exportarDetalleCostosExcel,
} from '../../../shared/services/movimientosInforme';
import type { PedidoGananciaDetalle, CompraCostoDetalle } from '../model';
import { validarRangoFechas, formatearMonto, formatearFecha } from '../logic';

ChartJS.register(ArcElement, Tooltip, Legend);

const MovimientosMonetarios: React.FC = () => {
  // Fechas
  const [desde, setDesde] = useState<string>(() => format(new Date(), 'yyyy-01-01'));
  const [hasta, setHasta] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));

  // Resumen global
  const [datos, setDatos] = useState({ ingresos: 0, costos: 0, ganancias: 0 });
  const [error, setError] = useState<string | null>(null);

  // Validación
  const errorValidacion = validarRangoFechas(desde, hasta);
  const isInvalidRange = Boolean(errorValidacion);
  const isEmptyData = datos.ingresos === 0 && datos.costos === 0 && datos.ganancias === 0;

  // Modales detalle
  const [showGananciasModal, setShowGananciasModal] = useState<boolean>(false);
  const [showCostosModal, setShowCostosModal] = useState<boolean>(false);
  const [gananciasData, setGananciasData] = useState<PedidoGananciaDetalle[]>([]);
  const [costosData, setCostosData] = useState<CompraCostoDetalle[]>([]);
  const [loadingGanancias, setLoadingGanancias] = useState<boolean>(false);
  const [loadingCostos, setLoadingCostos] = useState<boolean>(false);

  // 1) Defino al inicio del componente:
  const handleCloseCostos = () => {
    setShowCostosModal(false);
    setCostosData([]);
  };

  // Refrescar resumen cuando cambian fechas
  useEffect(() => {
    if (errorValidacion) {
      setError(errorValidacion);
      setDatos({ ingresos: 0, costos: 0, ganancias: 0 });
    } else {
      setError(null);
      fetchMovimientos();
    }
  }, [desde, hasta]);

  // Fetch del resumen
  const fetchMovimientos = async (): Promise<void> => {
    try {
      const response = await getMovimientosMonetarios(desde, hasta);
      setDatos(response);
    } catch (e) {
      console.error(e);
      alert('Error al obtener resumen de movimientos');
    }
  };

  // Exportar resumen
  const handleExportar = async (): Promise<void> => {
    if (isInvalidRange || isEmptyData) return;
    try {
      await exportarMovimientosExcel(desde, hasta);
    } catch {
      alert('Error al exportar Excel de movimientos');
    }
  };

  // Mostrar detalle Ganancias
  const handleVerGanancias = async (): Promise<void> => {
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

  // Mostrar detalle Costos
  const handleVerCostos = async (): Promise<void> => {
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

  // Exportar detalle Ganancias
  const handleExportarGanancias = async (): Promise<void> => {
    if (isInvalidRange || gananciasData.length === 0) return;
    try {
      await exportarDetalleGananciasExcel(desde, hasta);
    } catch {
      alert('Error al exportar Excel de ganancias');
    }
  };

  // Exportar detalle Costos
  const handleExportarCostos = async (): Promise<void> => {
    if (isInvalidRange || costosData.length === 0) return;
    try {
      await exportarDetalleCostosExcel(desde, hasta);
    } catch {
      alert('Error al exportar Excel de costos');
    }
  };

  // Datos para gráfico
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
    <div className="bg-white p-8 rounded-xl shadow max-w-full overflow-x-auto w-full">
      {/* Cabecera y fechas */}
      <div className="flex flex-wrap justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold mr-20">Movimientos monetarios</h2>
        <div className="flex gap-4 bg-gray-200 p-2 rounded-lg">
          <div>
            <label className="block text-sm">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-3 text-center font-semibold border-b pb-2 mb-6">
        <div>
          <p className="text-gray-600">Ingresos</p>
          <p className="text-lg font-bold">{formatearMonto(datos.ingresos)}</p>
        </div>
        <div>
          <p className="text-gray-600">Costos</p>
          <p className="text-lg font-bold">{formatearMonto(datos.costos)}</p>
        </div>
        <div>
          <p className="text-gray-600">Ganancias</p>
          <p className="text-lg font-bold text-green-600">{formatearMonto(datos.ganancias)}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full max-w-[450px] mx-auto mb-8">
        <h4 className="text-center font-semibold mb-2">Distribución</h4>
        <Pie data={pieData} />
      </div>

      {/* Botones exportar */}
      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={handleVerGanancias}
          disabled={loadingGanancias || isInvalidRange}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold disabled:opacity-50"
        >
          {loadingGanancias ? 'Cargando...' : 'Ver Ganancias'}
        </button>
        <button
          onClick={handleVerCostos}
          disabled={loadingCostos || isInvalidRange}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold disabled:opacity-50"
        >
          {loadingCostos ? 'Cargando...' : 'Ver Costos'}
        </button>
        <button
          onClick={handleExportar}
          disabled={isInvalidRange || isEmptyData}
          className={`px-6 py-2 rounded font-bold transition-colors ${
            isInvalidRange || isEmptyData
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          Exportar Resumen
        </button>
      </div>

      {/* Ganancias Modal */}
      {showGananciasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xl font-bold">Detalle de Ganancias</h3>
              <button
                onClick={() => setShowGananciasModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <table className="min-w-full border-collapse border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left text-xs uppercase text-gray-500">ID Pedido</th>
                  <th className="p-2 text-left text-xs uppercase text-gray-500">Fecha Pedido</th>
                  <th className="p-2 text-left text-xs uppercase text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {gananciasData.map((g) => (
                  <tr key={g.idPedido}>
                    <td className="p-2 text-sm">{g.idPedido}</td>
                    <td className="p-2 text-sm">{formatearFecha(g.fechaPedido)}</td>
                    <td className="p-2 text-sm">{formatearMonto(g.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                onClick={handleExportarGanancias}
                disabled={isInvalidRange || gananciasData.length === 0}
                className={`px-5 py-2 rounded font-bold transition-colors ${
                  isInvalidRange || gananciasData.length === 0
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
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

      {/* Costos Modal */}
      {showCostosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* header */}
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xl font-bold">Detalle de Costos</h3>
              <button
                onClick={handleCloseCostos}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* si no hay datos, muestro mensaje */}
            {costosData.length === 0 ? (
              <p className="text-center text-gray-500 py-6">
                No se encontraron compras de insumos en este rango.
              </p>
            ) : (
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs text-gray-500 uppercase">ID Compra</th>
                    <th className="px-6 py-3 text-xs text-gray-500 uppercase">Fecha Compra</th>
                    <th className="px-6 py-3 text-xs text-gray-500 uppercase">Total Compra</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {costosData.map((c) => (
                    <tr key={c.idPedido}>
                      <td className="px-6 py-4 text-sm text-gray-900">{c.idPedido}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatearFecha(c.fechaPedido)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatearMonto(c.totalCosto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* footer con botones */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                onClick={handleExportarCostos}
                disabled={isInvalidRange || costosData.length === 0}
                className={`px-5 py-2 rounded font-bold transition-colors ${
                  isInvalidRange || costosData.length === 0
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Exportar a Excel
              </button>
              <button
                onClick={handleCloseCostos}
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

export default MovimientosMonetarios;
