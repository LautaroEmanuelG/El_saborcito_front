import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Pedido, EstadoId, ESTADO_IDS, getNombreEstado } from '../Model';
import { getAccionesDisponibles, getMensajeAccion } from '../Logic';
import {
  formatearTiempoEstimado,
  calcularTiempoRestante,
  getEstadoTiempo,
} from '../utils/tiempoUtils';
import IconoVer from '../../../assets/svgs/icons/IconoVer';
import { IconoArrowRight } from '../../../assets/svgs/icons/IconoArrowRight';
import IconoTimeDuration15 from '../../../assets/svgs/icons/IconoTimeDuration15';
import { IconoTimeOut } from '../../../assets/svgs/icons/IconoTimeOut';

interface TaskCardProps {
  task: Pedido;
  animatingClass?: 'en-proceso' | 'demorado';
  onVerDetalle: (id: number) => void;
  onAvanzarPedido: (id: number) => void;
  onMarcarDemorado: (id: number) => void;
  onAgregarTiempo: (id: number) => void;
}

/**
 * 🎨 Configuración de estilos por estado
 */
const ESTILOS_ESTADO: Partial<
  Record<
    EstadoId,
    {
      card: string;
      badge: string;
      boton: string;
      texto: string;
    }
  >
> = {
  [ESTADO_IDS.PENDIENTE]: {
    card: 'border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100',
    badge: 'bg-blue-200 text-blue-800',
    boton: 'bg-blue-500 text-white hover:bg-blue-600',
    texto: 'Iniciar',
  },
  [ESTADO_IDS.EN_PREPARACION]: {
    card: 'border-l-4 border-l-orange-500 bg-orange-50 hover:bg-orange-100',
    badge: 'bg-orange-200 text-orange-800',
    boton: 'bg-orange-500 text-white hover:bg-orange-600',
    texto: 'Completar',
  },
  [ESTADO_IDS.EN_COCINA]: {
    card: 'border-l-4 border-l-orange-500 bg-orange-50 hover:bg-orange-100',
    badge: 'bg-orange-200 text-orange-800',
    boton: 'bg-orange-500 text-white hover:bg-orange-600',
    texto: 'Completar',
  },
  [ESTADO_IDS.DEMORADO]: {
    card: 'border-l-4 border-l-red-500 bg-red-50 hover:bg-red-100',
    badge: 'bg-red-200 text-red-800',
    boton: 'bg-green-500 text-white hover:bg-green-600',
    texto: 'Completar',
  },
  [ESTADO_IDS.LISTO]: {
    card: 'border-l-4 border-l-green-500 bg-green-50 hover:bg-green-100',
    badge: 'bg-green-200 text-green-800',
    boton: 'bg-primary text-white hover:bg-primarydark',
    texto: 'Avanzar',
  },
};

/**
 * 🃏 Componente TaskCard optimizado
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  animatingClass,
  onVerDetalle,
  onAvanzarPedido,
  onMarcarDemorado,
  onAgregarTiempo,
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
  const estilos = ESTILOS_ESTADO[estadoId];

  // Información de tiempo
  const tiempoFormateado = formatearTiempoEstimado(task.horasEstimadaFinalizacion);
  const tiempoRestante = calcularTiempoRestante(task.horasEstimadaFinalizacion);
  const estadoTiempo = getEstadoTiempo(tiempoRestante);

  // Clases CSS dinámicas
  const getCardClasses = (): string => {
    const baseClasses =
      'border border-gray-200 rounded-lg p-4 mb-3 shadow-sm cursor-grab transition-all duration-200 hover:shadow-md';

    let classes = `${baseClasses} ${estilos?.card || 'border-l-4 border-l-gray-500 bg-white hover:bg-gray-50'}`;

    // Animaciones
    if (animatingClass === 'en-proceso') {
      classes += ' bg-orange-200 border-orange-400 animate-pulse shadow-lg scale-105';
    } else if (animatingClass === 'demorado') {
      classes += ' bg-red-200 border-red-400 animate-pulse shadow-lg scale-105';
    }

    // Estado de dragging
    if (isDragging) {
      classes += ' opacity-50 rotate-2 scale-105 shadow-xl';
    }

    return classes;
  };

  const handleStopPropagation = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
  };

  const puedeAgregarTiempo =
    acciones.includes('agregar_tiempo') ||
    estadoId === ESTADO_IDS.EN_PREPARACION ||
    estadoId === ESTADO_IDS.EN_COCINA ||
    estadoId === ESTADO_IDS.DEMORADO;

  const puedeAvanzar = acciones.includes('avanzar_automatico') || acciones.includes('completar');
  const puedeMarcarDemorado = acciones.includes('marcar_demorado');

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={getCardClasses()}>
      {/* Header con ID y tiempo */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex gap-1 items-center">
            <h3 className="font-bold text-xs text-gray-800">#{task.id}</h3>
            <p className="text-md font-bold text-primary flex items-center gap-1">
              <span>{tiempoFormateado}</span>
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span
                className={`text-lg font-black ${
                  estadoTiempo.estado === 'demorado'
                    ? 'text-red-600'
                    : estadoTiempo.estado === 'proximo'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }`}
              >
                {estadoTiempo.mensaje}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${estilos?.badge || 'bg-gray-200 text-gray-800'}`}
        >
          {getNombreEstado(estadoId).replace('_', ' ')}
        </span>
      </div>

      {/* Lista de artículos */}
      <div className="mb-4">
        <p className="font-semibold text-sm text-gray-700 flex items-center gap-1">
          Artículos ({task.detalles.length})
        </p>
        <div className="bg-white bg-opacity-60 rounded-lg p-3 max-h-24 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            {task.detalles.map((detalle, idx) => (
              <li
                key={idx}
                className="text-negro text-md font-bold flex justify-between items-center"
              >
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

      {/* Botones de acción */}
      <div className="flex gap-2">
        {/* Botón Ver Detalle */}
        <button
          onClick={(e) => handleStopPropagation(e, () => onVerDetalle(task.id))}
          className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          title="Ver detalle completo"
        >
          <IconoVer className="w-4 h-4" />
        </button>

        {/* Botón Agregar Tiempo */}
        {puedeAgregarTiempo && (
          <button
            onClick={(e) => handleStopPropagation(e, () => onAgregarTiempo(task.id))}
            className="bg-violet-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            title="Agregar tiempo de preparación"
          >
            <IconoTimeDuration15 className="w-4 h-4" />
          </button>
        )}

        {/* Botón de Acción Principal */}
        {puedeAvanzar && (
          <button
            onClick={(e) => handleStopPropagation(e, () => onAvanzarPedido(task.id))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 flex-1 shadow-sm bg-primary text-white hover:bg-primarydark`}
            title={getMensajeAccion(estadoId)}
          >
            <IconoArrowRight />
          </button>
        )}

        {/* Botón Marcar Demorado */}
        {puedeMarcarDemorado && (
          <button
            onClick={(e) => handleStopPropagation(e, () => onMarcarDemorado(task.id))}
            className="bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-all duration-200 flex items-center justify-center shadow-sm"
            title="Marcar como demorado"
          >
            <IconoTimeOut />
          </button>
        )}
      </div>

      {/* Indicador de animación */}
      {animatingClass && (
        <div className="mt-3 text-center">
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              animatingClass === 'en-proceso'
                ? 'bg-orange-200 text-orange-800'
                : 'bg-red-200 text-red-800'
            }`}
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
