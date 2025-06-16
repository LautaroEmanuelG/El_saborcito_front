import { useState, useCallback } from 'react';
import { Pedido, EstadoId, ESTADO_IDS, getNombreEstado } from '../Model';
import { debeSalirDelKanban, validarDragDrop, getAnimacionParaTransicion } from '../Logic';
import {
  fetchPedidosActivos,
  updatePedidoEstado,
  avanzarEstadoPedido,
  añadirTiempoAPedido,
} from '../service/cocinaService';

export type AlertaTipo = 'error' | 'warning' | 'success';

export interface Alerta {
  mensaje: string;
  tipo: AlertaTipo;
}

export interface AnimacionesPedidos {
  [key: number]: 'en-proceso' | 'demorado';
}

/**
 * 🎯 Hook personalizado para manejar toda la lógica del Kanban
 */
export const useKanbanLogic = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState<Alerta | null>(null);
  const [animatingPedidos, setAnimatingPedidos] = useState<AnimacionesPedidos>({});

  // 🔄 Función para mostrar alertas
  const mostrarAlerta = useCallback((mensaje: string, tipo: AlertaTipo = 'error') => {
    setAlerta({ mensaje, tipo });
  }, []);

  // 🔄 Función para cerrar alerta
  const cerrarAlerta = useCallback(() => {
    setAlerta(null);
  }, []);

  // 🎬 Función para manejar animaciones
  const aplicarAnimacion = useCallback(
    (pedidoId: number, tipoAnimacion: 'en-proceso' | 'demorado') => {
      setAnimatingPedidos((prev) => ({ ...prev, [pedidoId]: tipoAnimacion }));
      setTimeout(() => {
        setAnimatingPedidos((prev) => {
          const { [pedidoId]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);
    },
    []
  );

  // 📥 Función para cargar pedidos
  const cargarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPedidosActivos();
      setPedidos(data);
      setAlerta(null);
    } catch (error) {
      mostrarAlerta('Error al cargar pedidos activos', 'error');
    } finally {
      setLoading(false);
    }
  }, [mostrarAlerta]);

  // ⚡ Función para avanzar pedido automáticamente
  const avanzarPedido = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const pedidoActual = pedidos.find((p) => p.id === id);
        if (!pedidoActual) return false;

        // Aplicar animación si es transición específica
        const animacion = getAnimacionParaTransicion(
          pedidoActual.estado.id as EstadoId,
          ESTADO_IDS.EN_PREPARACION
        );
        if (animacion) aplicarAnimacion(id, animacion);

        const pedidoActualizado = await avanzarEstadoPedido(id);

        // Si el pedido debe salir del Kanban
        if (debeSalirDelKanban(pedidoActualizado.estado.id as EstadoId)) {
          setPedidos((prev) => prev.filter((p) => p.id !== id));
          mostrarAlerta(
            `Pedido #${id} enviado a ${getNombreEstado(pedidoActualizado.estado.id as EstadoId)}`,
            'success'
          );
        } else {
          setPedidos((prev) =>
            prev.map((p) => (p.id === id ? { ...p, estado: pedidoActualizado.estado } : p))
          );
          mostrarAlerta(
            `Pedido #${id} avanzado a ${getNombreEstado(pedidoActualizado.estado.id as EstadoId)}`,
            'success'
          );
        }
        return true;
      } catch (error) {
        mostrarAlerta(
          `Error al avanzar pedido: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          'error'
        );
        return false;
      }
    },
    [pedidos, mostrarAlerta, aplicarAnimacion]
  );

  // ⚠️ Función para marcar como demorado
  const marcarDemorado = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const pedidoActual = pedidos.find((p) => p.id === id);
        if (!pedidoActual) return false;

        const estadoActualId = pedidoActual.estado.id as EstadoId;

        // Validar transición
        const validacion = validarDragDrop(estadoActualId, ESTADO_IDS.DEMORADO);
        if (!validacion.valida) {
          mostrarAlerta(
            validacion.mensaje || 'No se puede marcar como demorado desde este estado',
            'warning'
          );
          return false;
        }

        const pedidoActualizado = await updatePedidoEstado(id, ESTADO_IDS.DEMORADO);

        // Aplicar animación
        aplicarAnimacion(id, 'demorado');

        // Actualizar estado local
        setPedidos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, estado: pedidoActualizado.estado } : p))
        );

        mostrarAlerta(`Pedido #${id} marcado como demorado`, 'warning');
        return true;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Error desconocido');

        if (errorObj.message.includes('Ya existe un registro en el historial')) {
          mostrarAlerta(
            `Error de historial en pedido #${id}. El pedido ya tiene un registro previo.`,
            'warning'
          );
          // Recargar pedidos para sincronizar
          cargarPedidos();
        } else {
          mostrarAlerta(`Error al marcar como demorado: ${errorObj.message}`, 'error');
        }
        return false;
      }
    },
    [pedidos, mostrarAlerta, aplicarAnimacion, cargarPedidos]
  );

  // ⏱️ Función para agregar tiempo
  const agregarTiempo = useCallback(
    async (pedidoId: number, minutosAdicionales: number): Promise<boolean> => {
      try {
        const pedidoActualizado = await añadirTiempoAPedido(pedidoId, minutosAdicionales);

        setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? pedidoActualizado : p)));

        mostrarAlerta(
          `Se agregaron ${minutosAdicionales} minutos al pedido #${pedidoId}`,
          'success'
        );
        return true;
      } catch (error) {
        mostrarAlerta(
          `Error al agregar tiempo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          'error'
        );
        return false;
      }
    },
    [mostrarAlerta]
  );

  // 🎯 Función para manejar drag & drop
  const manejarDragDrop = useCallback(
    async (pedidoId: number, nuevoEstadoId: EstadoId): Promise<boolean> => {
      const pedidoActual = pedidos.find((p) => p.id === pedidoId);
      if (!pedidoActual) return false;

      const estadoActualId = pedidoActual.estado.id as EstadoId;

      // Si es la misma columna, no hacer nada
      if (estadoActualId === nuevoEstadoId) return false;

      // Validar transición
      const validacion = validarDragDrop(estadoActualId, nuevoEstadoId);
      if (!validacion.valida) {
        mostrarAlerta(validacion.mensaje || 'Transición no válida', 'warning');
        return false;
      }

      try {
        // Lógica específica según el tipo de transición
        if (nuevoEstadoId === ESTADO_IDS.DEMORADO) {
          return await marcarDemorado(pedidoId);
        } else if (
          (estadoActualId === ESTADO_IDS.DEMORADO && nuevoEstadoId === ESTADO_IDS.LISTO) ||
          (estadoActualId === ESTADO_IDS.PENDIENTE &&
            nuevoEstadoId === ESTADO_IDS.EN_PREPARACION) ||
          (estadoActualId === ESTADO_IDS.EN_PREPARACION && nuevoEstadoId === ESTADO_IDS.LISTO)
        ) {
          return await avanzarPedido(pedidoId);
        } else {
          // Para cualquier otra transición, usar updatePedidoEstado
          const pedidoActualizado = await updatePedidoEstado(pedidoId, nuevoEstadoId);

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
          return true;
        }
      } catch (error) {
        mostrarAlerta(
          `Error al actualizar estado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          'error'
        );
        return false;
      }
    },
    [pedidos, mostrarAlerta, marcarDemorado, avanzarPedido]
  );

  return {
    // Estado
    pedidos,
    loading,
    alerta,
    animatingPedidos,

    // Acciones
    cargarPedidos,
    avanzarPedido,
    marcarDemorado,
    agregarTiempo,
    manejarDragDrop,
    mostrarAlerta,
    cerrarAlerta,
  };
};
