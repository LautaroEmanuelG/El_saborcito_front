import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Pedido, EstadoId, ESTADO_IDS, getNombreEstado } from '../Model';
import { getAccionesDisponibles, getMensajeAccion } from '../Logic';
import IconoVer from '../../../assets/svgs/icons/IconoVer';
import { IconoArrowRight } from '../../../assets/svgs/icons/IconoArrowRight';

interface TaskCardProps {
  task: Pedido;
  animatingClass?: 'en-proceso' | 'demorado';
  onVerDetalle: (id: number) => void;
  onAvanzarPedido: (id: number) => void;
  onMarcarDemorado: (id: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  animatingClass,
  onVerDetalle,
  onAvanzarPedido,
  onMarcarDemorado,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const estadoId = task.estado.id as EstadoId;
  const acciones = getAccionesDisponibles(estadoId);

  // Función para obtener el estilo completo según el estado
  const getEstiloEstado = () => {
    const base =
      'border border-gray-200 rounded-lg p-4 mb-3 shadow-sm cursor-grab transition-all duration-200';

    switch (estadoId) {
      case ESTADO_IDS.PENDIENTE:
        return `${base} border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100 hover:shadow-md`;
      case ESTADO_IDS.EN_PREPARACION:
        return `${base} border-l-4 border-l-orange-500 bg-orange-50 hover:bg-orange-100 hover:shadow-md`;
      case ESTADO_IDS.DEMORADO:
        return `${base} border-l-4 border-l-red-500 bg-red-50 hover:bg-red-100 hover:shadow-md`;
      case ESTADO_IDS.LISTO:
        return `${base} border-l-4 border-l-green-500 bg-green-50 hover:bg-green-100 hover:shadow-md`;
      default:
        return `${base} border-l-4 border-l-gray-500 bg-white hover:bg-gray-50`;
    }
  };

  // Función para obtener el color de fondo según animación usando solo Tailwind
  const getBackgroundClass = (): string => {
    if (animatingClass === 'en-proceso') {
      return 'bg-orange-200 border-orange-400 animate-pulse shadow-lg scale-105';
    }
    if (animatingClass === 'demorado') {
      return 'bg-red-200 border-red-400 animate-pulse shadow-lg scale-105';
    }
    return '';
  };

  // Función para obtener el texto del botón principal
  const getTextoBotonPrincipal = (): string => {
    switch (estadoId) {
      case ESTADO_IDS.PENDIENTE:
        return 'Iniciar';
      case ESTADO_IDS.EN_PREPARACION:
        return 'Completar';
      case ESTADO_IDS.DEMORADO:
        return 'Completar';
      default:
        return 'Avanzar';
    }
  };

  // Función para obtener el estilo del botón principal
  const getEstiloBotonPrincipal = (): string => {
    const base =
      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 flex-1 shadow-sm';

    switch (estadoId) {
      case ESTADO_IDS.PENDIENTE:
        return `${base} bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md`;
      case ESTADO_IDS.EN_PREPARACION:
        return `${base} bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md`;
      case ESTADO_IDS.DEMORADO:
        return `${base} bg-green-500 text-white hover:bg-green-600 hover:shadow-md`;
      default:
        return `${base} bg-primary text-white hover:bg-primarydark hover:shadow-md`;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        ${getEstiloEstado()}
        ${getBackgroundClass()}
        ${isDragging ? 'opacity-50 rotate-2 scale-105 shadow-xl' : ''}
      `}
    >
      {/* Header con ID y tiempo */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-xl text-gray-800">#{task.id}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <span>⏰</span>
            {task.horasEstimadaFinalizacion
              ? task.horasEstimadaFinalizacion.split(':').slice(0, 2).join(':')
              : 'Sin tiempo'}
          </p>
        </div>
        <span
          className={`
          px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
          ${estadoId === ESTADO_IDS.PENDIENTE ? 'bg-blue-200 text-blue-800' : ''}
          ${estadoId === ESTADO_IDS.EN_PREPARACION ? 'bg-orange-200 text-orange-800' : ''}
          ${estadoId === ESTADO_IDS.DEMORADO ? 'bg-red-200 text-red-800' : ''}
          ${estadoId === ESTADO_IDS.LISTO ? 'bg-green-200 text-green-800' : ''}
        `}
        >
          {getNombreEstado(estadoId).replace('_', ' ')}
        </span>
      </div>

      {/* Lista de artículos */}
      <div className="mb-4">
        <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <span>📋</span>
          Artículos ({task.detalles.length})
        </p>
        <div className="bg-white bg-opacity-60 rounded-lg p-3 max-h-24 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            {task.detalles.map((detalle, idx) => (
              <li key={idx} className="text-gray-700 text-sm flex justify-between items-center">
                <span className="truncate">• {detalle.articulo.denominacion}</span>
                {detalle.cantidad > 1 && (
                  <span className="font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full text-xs ml-2">
                    x{detalle.cantidad}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botones de acción mejorados */}
      <div className="flex gap-2">
        {/* Botón Ver Detalle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVerDetalle(task.id);
          }}
          className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          title="Ver detalle completo"
        >
          <IconoVer className="w-4 h-4" />
          <span className="hidden sm:inline">Ver</span>
        </button>

        {/* Botón de Acción Principal */}
        {(acciones.includes('avanzar_automatico') || acciones.includes('completar')) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAvanzarPedido(task.id);
            }}
            className={getEstiloBotonPrincipal()}
            title={getMensajeAccion(estadoId)}
          >
            <IconoArrowRight />
            <span>{getTextoBotonPrincipal()}</span>
          </button>
        )}

        {/* Botón Marcar Demorado */}
        {acciones.includes('marcar_demorado') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarcarDemorado(task.id);
            }}
            className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-all duration-200 flex items-center justify-center shadow-sm"
            title="Marcar como demorado"
          >
            <span className="text-base">⚠️</span>
          </button>
        )}
      </div>

      {/* Indicador de animación usando solo Tailwind */}
      {animatingClass && (
        <div className="mt-3 text-center">
          <div
            className={`
            inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${animatingClass === 'en-proceso' ? 'bg-orange-200 text-orange-800' : ''}
            ${animatingClass === 'demorado' ? 'bg-red-200 text-red-800' : ''}
          `}
          >
            <span className="animate-bounce">{animatingClass === 'en-proceso' ? '🔄' : '⚠️'}</span>
            <span>
              {animatingClass === 'en-proceso'
                ? 'Iniciando preparación...'
                : 'Marcado como demorado'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function para obtener colores según el estado (usando IDs)
const getColorForEstado = (estadoId: EstadoId): string => {
  const colores = {
    [ESTADO_IDS.PENDIENTE]: '#334FFF',
    [ESTADO_IDS.EN_PREPARACION]: '#EB9417',
    [ESTADO_IDS.DEMORADO]: '#EB1741',
    [ESTADO_IDS.LISTO]: '#60AF29',
    [ESTADO_IDS.DELIVERY]: '#8B5CF6',
    [ESTADO_IDS.ENTREGADO]: '#10B981',
  };
  return colores[estadoId] || '#6B7280';
};
