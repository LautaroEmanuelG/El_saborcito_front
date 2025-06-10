import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { EstadoNombre, Pedido } from '../Model';
import IconoChevronDown from '../../../assets/svgs/icons/IconoChevronDown';
import IconoChevronsRight from '../../../assets/svgs/icons/IconoChevronsRight';

interface ColumnProps {
  column: { id: EstadoNombre; title: string; color: string };
  tasks: Pedido[];
  animatingPedidos: { [key: number]: 'en-proceso' | 'demorado' };
  onVerDetalle?: (id: number) => void;
  onCompletarPedido?: (id: number) => void;
}

export function Column({
  column,
  tasks,
  animatingPedidos,
  onVerDetalle,
  onCompletarPedido,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  // Estado para colapsar/expandir solo la columna LISTO
  const [isExpanded, setIsExpanded] = useState(true);
  const isListoColumn = column.id === 'LISTO';

  const toggleExpanded = () => {
    if (isListoColumn) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="flex w-96 flex-col rounded-lg bg-transparent">
      {/* Header de columna */}
      <div
        className="flex items-center justify-between px-4 py-2 rounded-t-lg cursor-pointer"
        style={{ background: column.color }}
        onClick={toggleExpanded}
      >
        <span className="font-bold text-white text-lg">{column.title}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-lg">{tasks.length}</span>
          {/* Icono de colapsar/expandir solo para columna LISTO */}
          {isListoColumn && (
            <div className="text-white">
              {isExpanded ? (
                <IconoChevronDown
                  width={20}
                  height={20}
                  className="transition-transform duration-200"
                />
              ) : (
                <IconoChevronsRight
                  width={20}
                  height={20}
                  className="transition-transform duration-200"
                />
              )}
            </div>
          )}
        </div>
      </div>
      {/* Contenedor de tarjetas */}
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-4 bg-white rounded-b-lg p-2 border border-t-0 border-gray-300 transition-all duration-300 ${
          isListoColumn && !isExpanded
            ? 'min-h-[40px] max-h-[40px] overflow-hidden'
            : 'min-h-[120px]'
        }`}
      >
        {/* Solo mostrar tarjetas si está expandida (o si no es columna LISTO) */}
        {(isExpanded || !isListoColumn) && (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isAnimating={animatingPedidos[task.id]}
                onVerDetalle={onVerDetalle}
                onCompletarPedido={onCompletarPedido}
              />
            ))}
          </div>
        )}
        {/* Mensaje cuando está colapsada */}
        {isListoColumn && !isExpanded && (
          <div className="text-center text-gray-500 text-sm py-1 ">
            {tasks.length} pedidos listos (click para expandir)
          </div>
        )}
      </div>
    </div>
  );
}
