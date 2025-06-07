import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';
import './MovimientosMonetarios.css';
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
        backgroundColor: ['green', 'red', 'blue'],
      },
    ],
  };

  const pieDataCostos = {
    labels: ['Materia Prima', 'Salarios', 'Servicios', 'Otros'],
    datasets: [
      {
        data: [42, 34, 7, 17], // Mockeado
        backgroundColor: ['#e6194b', '#f58231', '#911eb4', '#ffe119'],
      },
    ],
  };

  return (
    <div className="movimientos-container">
      <div className="movimientos-header">
        <h2>Movimientos monetarios</h2>
      </div>

      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Desde:</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hasta:</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 shadow-sm"
          />
        </div>
      </div>

      <div className="movimientos-tabla">
        <div>
          <strong>Ingresos</strong>
          <p>$ {datos.ingresos.toLocaleString()}</p>
        </div>
        <div>
          <strong>Costos</strong>
          <p>$ {datos.costos.toLocaleString()}</p>
        </div>
        <div>
          <strong>Total Ganancias</strong>
          <p className="ganancia">$ {datos.ganancias.toLocaleString()}</p>
        </div>
      </div>

      <div className="movimientos-graficos">
        <div>
          <h4>Distribución de Ingresos, Costos y Ganancias</h4>
          <Pie data={pieDataIngresos} />
        </div>
        <div>
          <h4>Distribución de Costos</h4>
          <Pie data={pieDataCostos} />
        </div>
      </div>

      <div className="movimientos-exportar">
        <button onClick={handleExportar}>Exportada Excel</button>
      </div>
    </div>
  );
};
