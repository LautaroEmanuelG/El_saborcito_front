import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
} from '@dnd-kit/core';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import {
  ESTADOS,
  EstadoId,
  ESTADO_IDS,
  Pedido,
  fetchPedidosActivos,
  updatePedidoEstado,
  avanzarEstadoPedido,
  getNombreEstado,
} from '../Model';
import { ModalRecetaKanban } from './ModalRecetaKanban';
import { useDetalleCompleto } from '../../../shared/hooks/useHistorialCocina';
import { debeSalirDelKanban, debeUsarAvanzar, validarDragDrop } from '../Logic';

// Componente para alertas elegantes usando solo Tailwind
const AlertaElegante: React.FC<{
  mensaje: string;
  tipo: 'error' | 'warning' | 'success';
  onClose: () => void;
}> = ({ mensaje, tipo, onClose }) => {
  const estilos = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  const iconos = {
    error: '⚠️',
    warning: '⚡',
    success: '✅',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${estilos[tipo]} border rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 ease-out`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{iconos[tipo]}</span>
        <div className="flex-1">
          <p className="font-medium text-sm">{mensaje}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          ✕
        </button>
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState<{
    mensaje: string;
    tipo: 'error' | 'warning' | 'success';
  } | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Estado para manejar animaciones de pedidos
  const [animatingPedidos, setAnimatingPedidos] = useState<{
    [key: number]: 'en-proceso' | 'demorado';
  }>({});

  // Hook para manejar el modal de recetas
  const { detalle, loading: detalleLoading, obtenerDetalle, cerrarDetalle } = useDetalleCompleto();

  // Configuración de sensores para mejorar el drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Función para mostrar alertas elegantes
  const mostrarAlerta = (mensaje: string, tipo: 'error' | 'warning' | 'success' = 'error') => {
    setAlerta({ mensaje, tipo });
  };

  // Función para detectar si es un error de historial duplicado
  const esErrorHistorialDuplicado = (error: Error): boolean => {
    return error.message.includes('Ya existe un registro en el historial');
  };

  // Función para cargar pedidos
  const cargarPedidos = async () => {
    try {
      const data = await fetchPedidosActivos();
      setPedidos(data);
      setAlerta(null);
    } catch (error) {
      mostrarAlerta('Error al cargar pedidos activos', 'error');
    }
  };

  // Función para manejar el click en "Ver detalle"
  const handleVerDetalle = (id: number) => {
    obtenerDetalle(id);
  };

  // Función para avanzar pedido automáticamente
  const handleAvanzarPedido = async (id: number) => {
    try {
      const pedidoActual = pedidos.find((p) => p.id === id);
      if (!pedidoActual) return;

      const pedidoActualizado = await avanzarEstadoPedido(id);

      // Si el pedido debe salir del Kanban (pasó a DELIVERY/ENTREGADO), removerlo
      if (debeSalirDelKanban(pedidoActualizado.estado.id as EstadoId)) {
        setPedidos((prev) => prev.filter((p) => p.id !== id));
        mostrarAlerta(
          `Pedido #${id} enviado a ${getNombreEstado(pedidoActualizado.estado.id as EstadoId)}`,
          'success'
        );
      } else {
        // Actualizar estado local
        setPedidos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, estado: pedidoActualizado.estado } : p))
        );
        mostrarAlerta(
          `Pedido #${id} avanzado a ${getNombreEstado(pedidoActualizado.estado.id as EstadoId)}`,
          'success'
        );
      }
    } catch (error) {
      mostrarAlerta(
        `Error al avanzar pedido: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'error'
      );
    }
  };

  // Función para marcar como demorado con manejo de errores de historial
  const handleMarcarDemorado = async (id: number) => {
    try {
      const pedidoActual = pedidos.find((p) => p.id === id);
      if (!pedidoActual) return;

      const estadoActualId = pedidoActual.estado.id as EstadoId;

      // Validar si la transición a DEMORADO es válida ANTES de enviar al backend
      const validacion = validarDragDrop(estadoActualId, ESTADO_IDS.DEMORADO);
      if (!validacion.valida) {
        console.log(`🚫 Transición inválida: ${getNombreEstado(estadoActualId)} → DEMORADO`);
        console.log(
          `📋 Pedido #${id} - Estado actual: ${estadoActualId} (${getNombreEstado(estadoActualId)})`
        );
        mostrarAlerta(
          validacion.mensaje || 'No se puede marcar como demorado desde este estado',
          'warning'
        );
        return;
      }

      console.log(
        `✅ Transición válida: ${getNombreEstado(estadoActualId)} → DEMORADO para pedido #${id}`
      );

      const pedidoActualizado = await updatePedidoEstado(id, ESTADO_IDS.DEMORADO);

      // Animación simple para DEMORADO usando solo Tailwind
      setAnimatingPedidos((prev) => ({ ...prev, [id]: 'demorado' }));
      setTimeout(() => {
        setAnimatingPedidos((prev) => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);

      // Actualizar estado local con la respuesta del backend
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: pedidoActualizado.estado } : p))
      );

      mostrarAlerta(`Pedido #${id} marcado como demorado`, 'warning');
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Error desconocido');

      if (esErrorHistorialDuplicado(errorObj)) {
        mostrarAlerta(
          `Error de historial en pedido #${id}. El pedido ya tiene un registro previo.`,
          'warning'
        );
        // Recargar pedidos para sincronizar el estado
        cargarPedidos();
      } else {
        mostrarAlerta(`Error al marcar como demorado: ${errorObj.message}`, 'error');
      }
    }
  };

  useEffect(() => {
    cargarPedidos().finally(() => setLoading(false));
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const pedidoId = Number(active.id);
    const nuevoEstadoId = over.id as EstadoId;

    // Buscar el pedido actual
    const pedidoActual = pedidos.find((p) => p.id === pedidoId);
    if (!pedidoActual) return;

    const estadoActualId = pedidoActual.estado.id as EstadoId;

    // Si es la misma columna, no hacer nada
    if (estadoActualId === nuevoEstadoId) return;

    // Validar transición ANTES de enviar al backend
    const validacion = validarDragDrop(estadoActualId, nuevoEstadoId);
    if (!validacion.valida) {
      mostrarAlerta(validacion.mensaje || 'Transición no válida', 'warning');
      return;
    }

    // Lógica de drag & drop mejorada
    try {
      if (nuevoEstadoId === ESTADO_IDS.DEMORADO) {
        // SIEMPRE usar /estado-cocina para marcar como DEMORADO
        // La validación ya se hace dentro de handleMarcarDemorado
        await handleMarcarDemorado(pedidoId);
      } else if (estadoActualId === ESTADO_IDS.DEMORADO && nuevoEstadoId === ESTADO_IDS.LISTO) {
        // DEMORADO → LISTO: usar /avanzar
        await handleAvanzarPedido(pedidoId);
      } else if (
        estadoActualId === ESTADO_IDS.PENDIENTE &&
        nuevoEstadoId === ESTADO_IDS.EN_PREPARACION
      ) {
        // PENDIENTE → EN_PREPARACION: usar /avanzar

        // Animación simple para PENDIENTE → EN_PREPARACION
        setAnimatingPedidos((prev) => ({ ...prev, [pedidoId]: 'en-proceso' }));
        setTimeout(() => {
          setAnimatingPedidos((prev) => {
            const { [pedidoId]: _, ...rest } = prev;
            return rest;
          });
        }, 2000);

        await handleAvanzarPedido(pedidoId);
      } else if (
        estadoActualId === ESTADO_IDS.EN_PREPARACION &&
        nuevoEstadoId === ESTADO_IDS.LISTO
      ) {
        // EN_PREPARACION → LISTO: usar /avanzar
        await handleAvanzarPedido(pedidoId);
      } else {
        // Para cualquier otra transición, usar /estado-cocina
        const pedidoActualizado = await updatePedidoEstado(pedidoId, nuevoEstadoId);

        // Si el pedido debe salir del Kanban, removerlo
        if (debeSalirDelKanban(pedidoActualizado.estado.id as EstadoId)) {
          setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
          mostrarAlerta(
            `Pedido #${pedidoId} enviado a ${getNombreEstado(nuevoEstadoId)}`,
            'success'
          );
        } else {
          setPedidos((prev) =>
            prev.map((p) => (p.id === pedidoId ? { ...p, estado: pedidoActualizado.estado } : p))
          );
          mostrarAlerta(
            `Pedido #${pedidoId} actualizado a ${getNombreEstado(nuevoEstadoId)}`,
            'success'
          );
        }
      }
    } catch (error) {
      mostrarAlerta(
        `Error al actualizar estado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'error'
      );
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg text-gray-600">Cargando pedidos activos...</span>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header mejorado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🍳 Kanban de Cocina</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">{pedidos.length} pedidos activos</span>
              </div>
              <div className="text-sm text-gray-500">📊 Gestión en tiempo real</div>
            </div>
          </div>
          <button
            onClick={() => cargarPedidos()}
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primarydark disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            Actualizar
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {ESTADOS.map((estado) => {
            const pedidosFiltrados = pedidos.filter((p) => p.estado.id === estado.id);
            return (
              <Column
                key={estado.id}
                column={estado}
                tasks={pedidosFiltrados}
                animatingPedidos={animatingPedidos}
                onVerDetalle={handleVerDetalle}
                onAvanzarPedido={handleAvanzarPedido}
                onMarcarDemorado={handleMarcarDemorado}
              />
            );
          })}

          {/* DragOverlay para animación suave nativa de dnd-kit */}
          <DragOverlay>
            {activeId ? (
              <div className="transform rotate-3 scale-105 opacity-90">
                <TaskCard
                  task={pedidos.find((p) => p.id === activeId)!}
                  onVerDetalle={handleVerDetalle}
                  onAvanzarPedido={handleAvanzarPedido}
                  onMarcarDemorado={handleMarcarDemorado}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Alerta elegante */}
      {alerta && (
        <AlertaElegante
          mensaje={alerta.mensaje}
          tipo={alerta.tipo}
          onClose={() => setAlerta(null)}
        />
      )}

      {/* Modal de receta para Kanban */}
      {detalle && (
        <ModalRecetaKanban detalle={detalle} onClose={cerrarDetalle} loading={detalleLoading} />
      )}
    </div>
  );
};
