import React, { useState } from 'react';
import IconoVer from '../../../assets/svgs/icons/IconoVer';
import IconoFileTypePdf from '../../../assets/svgs/icons/IconoFileTypePdf';

// Tipo para pedidos del historial (solo estético)
interface PedidoHistorial {
  id: number;
  numeroItems: number;
  fecha: string;
}

export const HistorialCocina: React.FC = () => {
  // Datos de ejemplo estáticos (reemplazar por datos reales después)
  const [pedidosHistorial] = useState<PedidoHistorial[]>([
    { id: 1, numeroItems: 5, fecha: '2025-01-15' },
    { id: 2, numeroItems: 3, fecha: '2025-01-15' },
    { id: 3, numeroItems: 7, fecha: '2025-01-14' },
    { id: 4, numeroItems: 2, fecha: '2025-01-14' },
    { id: 5, numeroItems: 4, fecha: '2025-01-13' },
  ]);

  return (
    <div className="bg-gray-100 w-full min-h-full p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header con título y filtro de fechas */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Historial de Pedidos</h1>

          {/* Filtro de fechas (estético) */}
          <div className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-sm text-gray-600">
            <span>📅</span>
            <span>25 feb 2025 - 26 mar 2025</span>
          </div>
        </div>

        {/* Tabla de pedidos */}
        <div className="space-y-3">
          {pedidosHistorial.map((pedido) => (
            <div
              key={pedido.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
            >
              {/* Información del pedido */}
              <div className="flex items-center gap-8">
                <span className="font-semibold text-gray-800">Pedido #00{pedido.id}</span>

                <span className="text-red-500 font-medium">{pedido.numeroItems} items</span>

                <span className="text-red-500 font-medium cursor-pointer hover:underline">PDF</span>
              </div>

              {/* Iconos de acciones */}
              <div className="flex items-center gap-3">
                {/* Icono PDF */}
                <button className="p-2 hover:bg-gray-200 rounded transition" title="Descargar PDF">
                  <IconoFileTypePdf width={20} height={20} className="text-red-500" />
                </button>

                {/* Icono Ver */}
                <button className="p-2 hover:bg-gray-200 rounded transition" title="Ver detalles">
                  <IconoVer width={20} height={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Botón Ver Más */}
        <div className="flex justify-center mt-8">
          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Ver Más
          </button>
        </div>
      </div>
    </div>
  );
};
