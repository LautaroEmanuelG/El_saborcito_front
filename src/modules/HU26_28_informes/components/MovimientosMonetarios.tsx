import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';
import {
  exportarMovimientosExcel,
  getMovimientosMonetarios,
} from '../../../shared/services/movimientosInforme';

ChartJS.register(ArcElement, Tooltip, Legend);

export const MovimientosMonetarios = () => {
  const [desde, setDesde] = useState(() => format(new Date(), 'yyyy-01-01'));
  const [hasta, setHasta] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [datos, setDatos] = useState({ ingresos: 0, costos: 0, ganancias: 0 });

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

  const pieDataIngresos = {
    labels: ['Ingresos', 'Costos', 'Ganancias'],
    datasets: [
      {
        data: [datos.ingresos, datos.costos, datos.ganancias],
        backgroundColor: ['#16a34a', '#dc2626', '#2563eb'], // verde, rojo, azul
      },
    ],
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-full overflow-x-auto">
      <div className="flex items-center justify-between border-b-2 border-negro pb-4 mb-8 flex-wrap">
        <h2 className="text-2xl font-bold text-negro mr-6">Movimientos monetarios</h2>{' '}
        {/* 📌 Se agregó mr-6 para separarlo del grupo de fechas */}
        <div className="flex gap-6 bg-gray-200 text-black p-2 rounded-lg items-center">
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
          <p className="text-negro">Ingresos</p>
          <p className="text-lg font-bold text-negro">${datos.ingresos.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-negro">Costos</p>
          <p className="text-lg font-bold text-negro">${datos.costos.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-negro">Total Ganancias</p>
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
    </div>
  );
};
