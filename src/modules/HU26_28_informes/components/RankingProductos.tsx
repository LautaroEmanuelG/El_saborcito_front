import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';
import {
  getRankingProductos,
  exportarRankingExcel,
} from '../../../shared/services/productoInformes';
import type { ProductoRankingResponse } from '../model';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export const RankingProductos = () => {
  const [desde, setDesde] = useState(() => format(new Date(), 'yyyy-01-01'));
  const [hasta, setHasta] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [rankingData, setRankingData] = useState<ProductoRankingResponse>({
    productos: [],
    totalManufacturados: 0,
    totalInsumos: 0,
  });

  // Validación de rango de fechas
  const isInvalidRange = new Date(desde) > new Date(hasta);
  const isEmptyData = rankingData.productos.length === 0;

  useEffect(() => {
    if (!isInvalidRange) {
      fetchData();
    }
  }, [desde, hasta]);

  const fetchData = async () => {
    try {
      const data = await getRankingProductos(desde, hasta);
      setRankingData(data);
    } catch (err) {
      console.error('Error cargando ranking:', err);
    }
  };

  const handleExportar = async () => {
    if (isInvalidRange) {
      alert('El rango de fechas no es válido.'); // 📌 validación antes de exportar
      return;
    }
    try {
      await exportarRankingExcel(desde, hasta);
    } catch (err) {
      alert('Error al exportar Excel');
      console.error(err);
    }
  };

  const barChartData = {
    labels: rankingData.productos.map((p) => p.denominacion),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: rankingData.productos.map((p) => p.cantidadVendida),
        backgroundColor: rankingData.productos.map((p) =>
          p.tipoProducto === 'MANUFACTURADO' ? '#FF0000' : '#0000FF'
        ),
      },
    ],
  };

  const pieChartData = {
    labels: ['Cocina', 'Bebidas'],
    datasets: [
      {
        data: [rankingData.totalManufacturados, rankingData.totalInsumos],
        backgroundColor: ['#FF0000', '#0000FF'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad vendida',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Productos',
        },
      },
    },
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-full w-full overflow-x-auto">
      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8 flex-wrap">
        <h2 className="text-2xl font-bold">Productos más vendidos</h2>
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
        </div>
      </div>

      {isInvalidRange && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          La fecha "Desde" no puede ser posterior a "Hasta".
        </div>
      )}

      <div className="flex flex-wrap gap-8 justify-evenly items-start">
        <div className="flex-1 min-w-[600px]">
          <h3 className="text-center font-semibold mb-2">Ranking de Productos Más Vendidos</h3>
          <Bar data={barChartData} options={chartOptions} height={300} />
        </div>

        <div className="flex-1 max-w-[350px]">
          <div className="bg-white border border-gray-200 shadow p-6 rounded">
            <h4 className="text-center text-lg font-bold mb-4">
              Distribución de Ventas entre Cocina y Bebidas
            </h4>
            <div className="w-40 h-40 mx-auto">
              <Pie data={pieChartData} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded bg-red-600 mr-2"></span>
          Cocina
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded bg-blue-600 mr-2"></span>
          Bebidas
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleExportar}
          disabled={isInvalidRange || isEmptyData}
          className={`px-6 py-2 rounded-lg shadow font-bold transition-colors
            ${
              isInvalidRange || isEmptyData
                ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
        >
          Exportar a Excel
        </button>
      </div>
    </div>
  );
};
