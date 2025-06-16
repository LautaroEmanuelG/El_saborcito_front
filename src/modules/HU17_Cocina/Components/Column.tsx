import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { EstadoId, Pedido } from '../Model';

interface ColumnProps {
  column: { id: EstadoId; nombre: string; title: string; color: string };
  tasks: Pedido[];
  animatingPedidos: { [key: number]: 'en-proceso' | 'demorado' };
  onVerDetalle: (id: number) => void;
  onAvanzarPedido: (id: number) => void;
  onMarcarDemorado: (id: number) => void;
  onAgregarTiempo: (id: number) => void;
}

export function Column({
  column,
  tasks,
  animatingPedidos,
  onVerDetalle,
  onAvanzarPedido,
  onMarcarDemorado,
  onAgregarTiempo,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex w-80 flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header de columna mejorado */}
      <div
        className="flex items-center justify-between px-4 py-4"
        style={{
          background: `linear-gradient(135deg, ${column.color} 0%, ${column.color}dd 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-bold text-white text-lg">{column.title}</h3>
            <p className="text-white text-sm opacity-90">
              {tasks.length} {tasks.length === 1 ? 'pedido' : 'pedidos'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
            <span className="font-bold text-white text-lg">{tasks.length}</span>
          </div>
        </div>
      </div>

      {/* Contenedor de tarjetas mejorado */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-3 transition-all duration-300 custom-scrollbar min-h-[400px] max-h-[600px] overflow-y-auto
          ${isOver ? 'bg-blue-50 ring-2 ring-blue-300 ring-opacity-50' : 'bg-gray-50'}
        `}
      >
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                No hay pedidos en {column.title.toLowerCase()}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                animatingClass={animatingPedidos[task.id]}
                onVerDetalle={onVerDetalle}
                onAvanzarPedido={onAvanzarPedido}
                onMarcarDemorado={onMarcarDemorado}
                onAgregarTiempo={onAgregarTiempo}
              />
            ))
          )}
        </div>

        {/* Indicador de drop zone activo */}
        {isOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg">
              Soltar aquí
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
