import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Pedido, EstadoNombre } from '../Model';
import IconoVer from '../../../assets/svgs/icons/IconoVer';
import IconoChecks from '../../../assets/svgs/icons/IconoChecks';
import IconoTimeDuration15 from '../../../assets/svgs/icons/IconoTimeDuration15';

interface TaskCardProps {
  task: Pedido;
  isAnimating?: 'en-proceso' | 'demorado';
  onVerDetalle?: (id: number) => void;
  onCompletarPedido?: (id: number) => void;
}

export function TaskCard({ task, isAnimating, onVerDetalle, onCompletarPedido }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  // Crear listeners personalizados que ignoren clicks en botones
  const customListeners = {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      // Si el click es en un botón, no iniciar drag
      if ((e.target as HTMLElement).closest('button')) {
        return;
      }
      listeners?.onPointerDown?.(e);
    },
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Clases de animación según el tipo
  const getAnimationClasses = () => {
    if (isAnimating === 'en-proceso') {
      return 'animate-pulse bg-yellow-200 scale-105';
    }
    if (isAnimating === 'demorado') {
      return 'animate-bounce bg-red-400 scale-110';
    }
    return '';
  };

  // Renderizar iconos según el estado del pedido
  const renderActionIcons = () => {
    switch (task.estado.nombre) {
      case 'EN_PREPARACION':
        return (
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-gray-200 rounded transition" title="Añadir más tiempo">
              <IconoTimeDuration15 width={16} height={16} className="text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCompletarPedido?.(task.id);
              }}
              className="p-1 hover:bg-gray-200 rounded transition"
              title="Completar pedido"
            >
              <IconoChecks width={16} height={16} className="text-green-600" />
            </button>
          </div>
        );
      case 'DEMORADO':
        return (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompletarPedido?.(task.id);
            }}
            className="p-1 hover:bg-gray-200 rounded transition"
            title="Completar pedido"
          >
            <IconoChecks width={16} height={16} className="text-green-600" />
          </button>
        );
      default:
        return (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onVerDetalle?.(task.id);
            }}
            className="text-xs text-gray-700 border border-gray-400 rounded px-2 py-0.5 hover:bg-gray-100 transition flex items-center gap-1 z-10 relative pointer-events-auto"
          >
            <IconoVer width={12} height={12} />
            Ver detalle
          </button>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...customListeners}
      {...attributes}
      className={`cursor-grab rounded-md border border-gray-300 bg-white p-3 shadow flex flex-col gap-2 min-h-[90px] hover:shadow-md transition-all duration-300 ${getAnimationClasses()}`}
      style={style}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-gray-800 text-base">pedido #000{task.id}</span>
      </div>
      <ul className="text-xs text-gray-700 ml-2 mb-1">
        {task.detalles.map((detalle, idx) => (
          <li key={idx} className="leading-tight">
            - {detalle.articulo.denominacion} {detalle.cantidad > 1 ? `x${detalle.cantidad}` : ''}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">{task.horasEstimadaFinalizacion}</span>
        {renderActionIcons()}
      </div>
    </div>
  );
}

// Helper function para obtener colores según el estado
const getColorForEstado = (estado: EstadoNombre): string => {
  const colores = {
    PENDIENTE: '#334FFF',
    EN_PREPARACION: '#EB9417',
    DEMORADO: '#EB1741',
    LISTO: '#60AF29',
  };
  return colores[estado] || '#6B7280';
};
