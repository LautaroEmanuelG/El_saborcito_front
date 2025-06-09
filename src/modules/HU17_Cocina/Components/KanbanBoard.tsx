import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Column } from './Column';
import { ESTADOS, EstadoNombre, Pedido, fetchPedidos } from '../Model';

// Función para actualizar el estado de un pedido en el backend
async function updatePedidoEstado(id: number, nuevoEstado: EstadoNombre) {
  const res = await fetch(
    `http://localhost:5252/api/cocina/pedidos/${id}/estado?nuevoEstado=${nuevoEstado}`,
    {
      method: 'PUT',
    }
  );
  if (!res.ok) throw new Error('Error al actualizar estado');
}

export const KanbanBoard: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Estado para manejar animaciones de pedidos
  const [animatingPedidos, setAnimatingPedidos] = useState<{
    [key: number]: 'en-proceso' | 'demorado';
  }>({});

  useEffect(() => {
    console.log('🔍 Iniciando fetch de pedidos...');
    fetchPedidos()
      .then((data) => {
        console.log('✅ Pedidos recibidos:', data);
        console.log('📊 Cantidad de pedidos:', data.length);
        setPedidos(data);
      })
      .catch((error) => {
        console.error('❌ Error al cargar pedidos:', error);
        setError('Error al cargar pedidos');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const pedidoId = Number(active.id);
    const nuevoEstado = over.id as EstadoNombre;

    // Buscar el estado anterior
    const pedidoAnterior = pedidos.find((p) => p.id === pedidoId);
    const estadoAnterior = pedidoAnterior?.estado.nombre ?? 'PENDIENTE';

    // Detectar transiciones específicas para animaciones
    if (estadoAnterior === 'PENDIENTE' && nuevoEstado === 'EN_PREPARACION') {
      // Animación suave amarilla para PENDIENTE → EN_PROCESO (2 segundos)
      setAnimatingPedidos((prev) => ({ ...prev, [pedidoId]: 'en-proceso' }));
      setTimeout(() => {
        setAnimatingPedidos((prev) => {
          const { [pedidoId]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);
    } else if (estadoAnterior === 'PENDIENTE' && nuevoEstado === 'DEMORADO') {
      // Animación intensa roja para PENDIENTE → DEMORADO (3 segundos)
      setAnimatingPedidos((prev) => ({ ...prev, [pedidoId]: 'demorado' }));
      setTimeout(() => {
        setAnimatingPedidos((prev) => {
          const { [pedidoId]: _, ...rest } = prev;
          return rest;
        });
      }, 3000);
    } else if (estadoAnterior === 'EN_PREPARACION' && nuevoEstado === 'DEMORADO') {
      // Animación intensa roja para EN_PROCESO → DEMORADO (3 segundos)
      setAnimatingPedidos((prev) => ({ ...prev, [pedidoId]: 'demorado' }));
      setTimeout(() => {
        setAnimatingPedidos((prev) => {
          const { [pedidoId]: _, ...rest } = prev;
          return rest;
        });
      }, 3000);
    }

    // Optimista: actualiza localmente
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoId ? { ...p, estado: { ...p.estado, nombre: nuevoEstado } } : p
      )
    );

    // Sincroniza con backend
    try {
      await updatePedidoEstado(pedidoId, nuevoEstado);
    } catch {
      // Si falla, revertir usando el estado anterior guardado
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId ? { ...p, estado: { ...p.estado, nombre: estadoAnterior } } : p
        )
      );
      setError('No se pudo actualizar el estado.');
    }
  };

  if (loading) return <div>Cargando pedidos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <DndContext onDragEnd={handleDragEnd}>
          {ESTADOS.map((estado) => {
            const pedidosFiltrados = pedidos.filter((p) => p.estado.nombre === estado.id);
            return (
              <Column
                key={estado.id}
                column={estado}
                tasks={pedidosFiltrados}
                animatingPedidos={animatingPedidos}
              />
            );
          })}
        </DndContext>
      </div>
    </div>
  );
};
