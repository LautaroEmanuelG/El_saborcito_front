import React from 'react';
import { validarRangoFechas } from '../../../shared/utils/fechaUtils';

interface FiltrosFechaProps {
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (fecha: string) => void;
  onFechaHastaChange: (fecha: string) => void;
}

export const FiltrosFecha: React.FC<FiltrosFechaProps> = ({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
}) => {
  const errorValidacion = validarRangoFechas(fechaDesde, fechaHasta);

  return (
    <div className="mb-6">
      <div className="flex gap-4 bg-gray-200 p-2 rounded-lg items-center flex-wrap">
        <div>
          <label className="block text-sm text-gray-600 font-medium mb-1">📅 Desde:</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            className={`border px-2 py-1 rounded ${
              errorValidacion ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 font-medium mb-1">📅 Hasta:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            className={`border px-2 py-1 rounded ${
              errorValidacion ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </div>
      </div>
      {errorValidacion && (
        <div className="mt-2 text-sm text-red-600 bg-red-100 border border-red-300 rounded px-3 py-2">
          ⚠️ {errorValidacion}
        </div>
      )}
    </div>
  );
};
