import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';
import { getRankingProductos, exportarRankingExcel } from '../service/informesService';
import { ProductoRanking } from '../model';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export const RankingProductos = () => {
  const [desde, setDesde] = useState(() => format(new Date(), 'yyyy-01-01'));
  const [hasta, setHasta] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [productos, setProductos] = useState<ProductoRanking[]>([]);

  useEffect(() => {
    fetchData();
  }, [desde, hasta]);

  const fetchData = async () => {
    try {
      const data = await getRankingProductos(desde, hasta);
      if (Array.isArray(data)) setProductos(data);
      else setProductos([]);
    } catch (err) {
      console.error('Error cargando ranking:', err);
    }
  };

  const handleExportar = async () => {
    try {
      await exportarRankingExcel(desde, hasta);
    } catch (err) {
      alert('Error al exportar Excel');
      console.error(err);
    }
  };

  const barChartData = {
    labels: productos.map((p) => p.denominacion),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: productos.map((p) => p.cantidadVendida),
        backgroundColor: productos.map((p) => (p.tipo === 'MANUFACTURADO' ? '#FF0000' : '#0000FF')),
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
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Productos más vendidos</h2>

        <div className="flex gap-4">
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">Desde:</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">Hasta:</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <h3 className="text-center font-semibold mb-2">Ranking de Productos Más Vendidos</h3>
          <Bar data={barChartData} options={chartOptions} height={300} />
        </div>

        <div className="w-full lg:w-1/3 flex items-center justify-center">
          <div className="bg-white border border-gray-200 shadow p-6 rounded">
            <h4 className="text-center text-lg font-bold mb-4">
              Distribución de Ventas entre Cocina y Bebidas
            </h4>
            <div className="w-40 h-40">
              <Bar
                data={{
                  labels: ['Cocina', 'Bebidas'],
                  datasets: [
                    {
                      data: [
                        productos.filter((p) => p.tipo === 'MANUFACTURADO').length,
                        productos.filter((p) => p.tipo === 'INSUMO').length,
                      ],
                      backgroundColor: ['#FF0000', '#0000FF'],
                    },
                  ],
                }}
                options={{
                  indexAxis: 'y',
                  plugins: { legend: { display: false } },
                  scales: { x: { beginAtZero: true } },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleExportar}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow"
        >
          Exportar a Excel
        </button>
      </div>
    </div>
  );
};
