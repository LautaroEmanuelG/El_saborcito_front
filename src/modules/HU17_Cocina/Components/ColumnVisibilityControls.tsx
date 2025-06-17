import React from 'react';

interface ColumnVisibilityControlsProps {
  showPendiente: boolean;
  showListo: boolean;
  onTogglePendiente: () => void;
  onToggleListo: () => void;
  pendienteCount?: number;
  listoCount?: number;
}

/**
 * 👁️ Controles para mostrar/ocultar columnas del Kanban
 */
export const ColumnVisibilityControls: React.FC<ColumnVisibilityControlsProps> = ({
  showPendiente,
  showListo,
  onTogglePendiente,
  onToggleListo,
  pendienteCount = 0,
  listoCount = 0,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">Columnas:</span>

      {/* Botón para mostrar/ocultar Pendiente */}
      <button
        onClick={onTogglePendiente}
        className={`
          px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
          flex items-center gap-1.5 shadow-sm border min-w-[80px]
          ${
            showPendiente
              ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }
        `}
        title={
          showPendiente
            ? 'Ocultar columna Pendiente'
            : `Mostrar columna Pendiente (${pendienteCount} pedidos)`
        }
      >
        <span className={`w-2 h-2 rounded-full ${showPendiente ? 'bg-white' : 'bg-gray-400'}`} />
        <span>Pendiente</span>
        {!showPendiente && pendienteCount > 0 && (
          <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
            {pendienteCount}
          </span>
        )}
      </button>

      {/* Botón para mostrar/ocultar Listo */}
      <button
        onClick={onToggleListo}
        className={`
          px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
          flex items-center gap-1.5 shadow-sm border min-w-[70px]
          ${
            showListo
              ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }
        `}
        title={
          showListo ? 'Ocultar columna Listo' : `Mostrar columna Listo (${listoCount} pedidos)`
        }
      >
        <span className={`w-2 h-2 rounded-full ${showListo ? 'bg-white' : 'bg-gray-400'}`} />
        <span>Listo</span>
        {!showListo && listoCount > 0 && (
          <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
            {listoCount}
          </span>
        )}
      </button>
    </div>
  );
};
