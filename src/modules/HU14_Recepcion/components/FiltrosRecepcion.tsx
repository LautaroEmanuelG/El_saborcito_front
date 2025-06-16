import React from 'react';
import { Estado } from '../../../types/Pedido';

interface FiltrosRecepcionProps {
  estados: Estado[];
  filtroEstado: string;
  buscarId: string;
  onFiltroEstadoChange: (estado: string) => void;
  onBuscarIdChange: (id: string) => void;
  onLimpiarFiltros: () => void;
}

export const FiltrosRecepcion: React.FC<FiltrosRecepcionProps> = ({
  estados,
  filtroEstado,
  buscarId,
  onFiltroEstadoChange,
  onBuscarIdChange,
  onLimpiarFiltros,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtros</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro por Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Pedido</label>
          <select
            value={filtroEstado}
            onChange={(e) => onFiltroEstadoChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.nombre}>
                {estado.nombre.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Búsqueda por ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar por ID</label>
          <input
            type="text"
            value={buscarId}
            onChange={(e) => onBuscarIdChange(e.target.value)}
            placeholder="Ingrese el ID del pedido"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Botón limpiar */}
        <div className="flex items-end">
          <button
            onClick={onLimpiarFiltros}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
