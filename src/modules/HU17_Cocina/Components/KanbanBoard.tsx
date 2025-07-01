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
import { ESTADOS, EstadoId, ESTADO_IDS } from '../Model';
import { ModalRecetaKanban } from './ModalRecetaKanban';
import { ModalAgregarTiempo } from './ModalAgregarTiempo';
import { AlertaElegante } from './AlertaElegante';
import { ColumnVisibilityControls } from './ColumnVisibilityControls';
import { useDetalleCompleto } from '../../../shared/hooks/useHistorialCocina';
import { useKanbanLogic } from '../hooks/useKanbanLogic';
import { useModalTiempo } from '../hooks/useModalTiempo';
import { useColumnVisibility } from '../hooks/useColumnVisibility';

/**
 * 🏗️ Componente principal del Kanban de Cocina - Completamente optimizado
 */
export const KanbanBoard: React.FC = () => {
  const [activeId, setActiveId] = useState<number | null>(null);

  // 👁️ Hook para visibilidad de columnas
  const { showPendiente, showListo, togglePendienteVisibility, toggleListoVisibility } =
    useColumnVisibility();

  // 🎯 Hooks personalizados para separar responsabilidades
  const {
    pedidos,
    loading,
    alerta,
    animatingPedidos,
    cargarPedidos,
    avanzarPedido,
    marcarDemorado,
    agregarTiempo,
    manejarDragDrop,
    cerrarAlerta,
  } = useKanbanLogic();

  const { modalState, abrirModal, cerrarModal } = useModalTiempo();
  const { detalle, loading: detalleLoading, obtenerDetalle, cerrarDetalle } = useDetalleCompleto();

  // 🎮 Configuración de sensores para mejorar el drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // 🔄 Cargar pedidos al montar
  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  // 🎯 Handlers de acciones
  const handleVerDetalle = (id: number) => {
    obtenerDetalle(id);
  };

  const handleAgregarTiempo = (id: number) => {
    const pedido = pedidos.find((p) => p.id === id);
    if (pedido) {
      abrirModal(id, pedido);
    }
  };

  const handleConfirmarTiempo = async (pedidoId: number, minutosAdicionales: number) => {
    const exito = await agregarTiempo(pedidoId, minutosAdicionales);
    if (exito) {
      cerrarModal();
    }
  };

  // 🎪 Handlers de Drag & Drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const pedidoId = Number(active.id);
    const nuevoEstadoId = over.id as EstadoId;

    await manejarDragDrop(pedidoId, nuevoEstadoId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg text-gray-600">Cargando pedidos activos...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-full w-full overflow-auto">
      {/* Header mejorado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Cocina</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">{pedidos.length} pedidos activos</span>
              </div>
              <div className="text-sm text-gray-500">Gestión en tiempo real</div>

              {/* Resumen de columnas ocultas */}
              {(!showPendiente || !showListo) && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Ocultas:</span>
                  {!showPendiente && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      {pedidos.filter((p) => p.estado.id === ESTADO_IDS.PENDIENTE).length}{' '}
                      Pendientes
                    </span>
                  )}
                  {!showListo && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      {pedidos.filter((p) => p.estado.id === ESTADO_IDS.LISTO).length} Listos
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Controles de visibilidad de columnas */}
            <ColumnVisibilityControls
              showPendiente={showPendiente}
              showListo={showListo}
              onTogglePendiente={togglePendienteVisibility}
              onToggleListo={toggleListoVisibility}
              pendienteCount={pedidos.filter((p) => p.estado.id === ESTADO_IDS.PENDIENTE).length}
              listoCount={pedidos.filter((p) => p.estado.id === ESTADO_IDS.LISTO).length}
            />

            <button
              onClick={cargarPedidos}
              disabled={loading}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primarydark disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {ESTADOS.map((estado) => {
            // 👁️ Filtrar columnas según visibilidad configurada
            if (estado.id === ESTADO_IDS.PENDIENTE && !showPendiente) return null;
            if (estado.id === ESTADO_IDS.LISTO && !showListo) return null;

            let pedidosFiltrados = pedidos.filter((p) => p.estado.id === estado.id);
            // Si es la columna EN_PREPARACION, incluir también los de id 2 y 3
            if (estado.id === ESTADO_IDS.EN_PREPARACION) {
              pedidosFiltrados = pedidos.filter(
                (p) => p.estado.id === ESTADO_IDS.EN_PREPARACION || p.estado.id === 3
              );
            }
            return (
              <Column
                key={estado.id}
                column={estado}
                tasks={pedidosFiltrados}
                animatingPedidos={animatingPedidos}
                onVerDetalle={handleVerDetalle}
                onAvanzarPedido={avanzarPedido}
                onMarcarDemorado={marcarDemorado}
                onAgregarTiempo={handleAgregarTiempo}
              />
            );
          })}

          {/* DragOverlay para animación suave */}
          <DragOverlay>
            {activeId ? (
              <div className="transform rotate-3 scale-105 opacity-90">
                <TaskCard
                  task={pedidos.find((p) => p.id === activeId)!}
                  onVerDetalle={handleVerDetalle}
                  onAvanzarPedido={avanzarPedido}
                  onMarcarDemorado={marcarDemorado}
                  onAgregarTiempo={handleAgregarTiempo}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Componentes de overlay */}
      {alerta && (
        <AlertaElegante mensaje={alerta.mensaje} tipo={alerta.tipo} onClose={cerrarAlerta} />
      )}

      {detalle && (
        <ModalRecetaKanban detalle={detalle} onClose={cerrarDetalle} loading={detalleLoading} />
      )}

      {modalState.isOpen && modalState.pedidoData && (
        <ModalAgregarTiempo
          isOpen={modalState.isOpen}
          onClose={cerrarModal}
          pedidoId={modalState.pedidoId!}
          tiempoActual={modalState.pedidoData.horasEstimadaFinalizacion}
          onConfirm={handleConfirmarTiempo}
          loading={loading}
        />
      )}
    </div>
  );
};
