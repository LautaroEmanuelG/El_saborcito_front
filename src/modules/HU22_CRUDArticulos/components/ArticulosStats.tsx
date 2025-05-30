import { useEffect, useState } from 'react';
import * as articuloManufacturadoService from '../../../shared/services/articuloManufacturadoService';
import * as articuloInsumoService from '../../../shared/services/articuloInsumoService';
import * as articuloService from '../../../shared/services/articuloService';

interface ArticulosStatsData {
  manufacturados: {
    activos: number;
    eliminados: number;
    total: number;
  };
  insumos: {
    activos: number;
    eliminados: number;
    total: number;
  };
  generales: {
    activos: number;
    eliminados: number;
    total: number;
  };
}

const INITIAL_STATS: ArticulosStatsData = {
  manufacturados: { activos: 0, eliminados: 0, total: 0 },
  insumos: { activos: 0, eliminados: 0, total: 0 },
  generales: { activos: 0, eliminados: 0, total: 0 },
};

export const ArticulosStats = () => {
  const [stats, setStats] = useState<ArticulosStatsData>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener datos de artículos manufacturados
      const [activosManufacturados, eliminadosManufacturados] = await Promise.all([
        articuloManufacturadoService.getAllArticuloManufacturados(),
        articuloManufacturadoService.getDeletedArticuloManufacturados(),
      ]);

      // Obtener datos de artículos insumo
      const [activosInsumos, eliminadosInsumos] = await Promise.all([
        articuloInsumoService.getAllArticuloInsumos(),
        articuloInsumoService.getDeletedArticuloInsumos(),
      ]);

      // Obtener datos de artículos generales
      const [activosGenerales, eliminadosGenerales] = await Promise.all([
        articuloService.getAllArticulos(),
        articuloService.getDeletedArticulos(),
      ]);

      const newStats: ArticulosStatsData = {
        manufacturados: {
          activos: activosManufacturados?.length ?? 0,
          eliminados: eliminadosManufacturados?.length ?? 0,
          total: (activosManufacturados?.length ?? 0) + (eliminadosManufacturados?.length ?? 0),
        },
        insumos: {
          activos: activosInsumos?.length ?? 0,
          eliminados: eliminadosInsumos?.length ?? 0,
          total: (activosInsumos?.length ?? 0) + (eliminadosInsumos?.length ?? 0),
        },
        generales: {
          activos: activosGenerales?.length ?? 0,
          eliminados: eliminadosGenerales?.length ?? 0,
          total: (activosGenerales?.length ?? 0) + (eliminadosGenerales?.length ?? 0),
        },
      };

      setStats(newStats);
    } catch (err) {
      setError((err as Error)?.message ?? 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0';
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Estadísticas de Artículos</h3>
        <p className="text-gray-500">🔄 Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Estadísticas de Artículos</h3>
        <p className="text-red-500">❌ {error}</p>
        <button
          onClick={fetchStats}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          🔄 Reintentar
        </button>
      </div>
    );
  }

  const StatCard = ({
    title,
    icon,
    data,
  }: {
    title: string;
    icon: string;
    data: { activos: number; eliminados: number; total: number };
  }) => (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <h4 className="font-medium text-gray-800 mb-2">
        {icon} {title}
      </h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-green-600">✅ Activos:</span>
          <span className="font-medium">
            {data.activos} ({calculatePercentage(data.activos, data.total)}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-red-600">🗑️ Eliminados:</span>
          <span className="font-medium">
            {data.eliminados} ({calculatePercentage(data.eliminados, data.total)}%)
          </span>
        </div>
        <div className="flex justify-between border-t pt-1">
          <span className="text-gray-700">📊 Total:</span>
          <span className="font-bold">{data.total}</span>
        </div>
      </div>
    </div>
  );

  const totalActivos =
    stats.manufacturados.activos + stats.insumos.activos + stats.generales.activos;
  const totalEliminados =
    stats.manufacturados.eliminados + stats.insumos.eliminados + stats.generales.eliminados;
  const totalGeneral = totalActivos + totalEliminados;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">📊 Estadísticas de Artículos</h3>
        <button
          onClick={fetchStats}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
          title="Actualizar estadísticas"
        >
          🔄
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard title="Manufacturados" icon="🏭" data={stats.manufacturados} />
        <StatCard title="Insumos" icon="🛠️" data={stats.insumos} />
        <StatCard title="Generales" icon="📦" data={stats.generales} />
      </div>

      {/* Resumen general */}
      <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">🌐 Resumen General</h4>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-green-600 font-bold text-lg">{totalActivos}</div>
            <div className="text-gray-600">Activos</div>
          </div>
          <div>
            <div className="text-red-600 font-bold text-lg">{totalEliminados}</div>
            <div className="text-gray-600">Eliminados</div>
          </div>
          <div>
            <div className="text-blue-600 font-bold text-lg">{totalGeneral}</div>
            <div className="text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticulosStats;
