// src/modules/HU26_28_informes/informes/components/RankingProductos.tsx

import { useEffect, useState } from 'react';
import { ProductoRanking } from '../model';
import { getRankingProductos } from '../service/informesService';
import { format } from 'date-fns';

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
      // Validamos que la respuesta sea un array antes de setearla
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando ranking:', err);
      setProductos([]); // fallback de seguridad
    }
  };

  const manufacturados = Array.isArray(productos)
    ? productos.filter((p) => p.tipo === 'MANUFACTURADO')
    : [];

  const insumos = Array.isArray(productos) ? productos.filter((p) => p.tipo === 'INSUMO') : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Ranking de Productos Más Vendidos</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Manufacturados</h3>
          <ul className="divide-y">
            {manufacturados.map((p, i) => (
              <li key={p.id} className="py-2 flex justify-between">
                <span>
                  {i + 1}. {p.denominacion}
                </span>
                <span>{p.cantidadVendida}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Insumos</h3>
          <ul className="divide-y">
            {insumos.map((p, i) => (
              <li key={p.id} className="py-2 flex justify-between">
                <span>
                  {i + 1}. {p.denominacion}
                </span>
                <span>{p.cantidadVendida}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
