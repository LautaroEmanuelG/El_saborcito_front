import { useState, useEffect } from 'react';
import {
  updateEstadoPedido,
  getPedidosDetalladosCompletos,
} from '../../shared/services/pedidoService';
import { getAllEstados, avanzarEstadoPedidoGenerico } from '../../shared/services/estadoService';
import { PedidoCompletoConDetalles, Estado } from '../../types/Pedido';
import { obtenerFechaHoy } from '../../shared/utils/fechaUtils';

export const useRecepcionLogic = () => {
  const [pedidos, setPedidos] = useState<PedidoCompletoConDetalles[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<PedidoCompletoConDetalles[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [buscarId, setBuscarId] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>(obtenerFechaHoy());
  const [fechaHasta, setFechaHasta] = useState<string>(obtenerFechaHoy());

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar pedidos cuando cambian los filtros
  useEffect(() => {
    aplicarFiltros();
  }, [pedidos, filtroEstado, buscarId, fechaDesde, fechaHasta]);
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [pedidosData, estadosData] = await Promise.all([
        getPedidosDetalladosCompletos(),
        getAllEstados(),
      ]);
      setPedidos(pedidosData);
      setEstados(estadosData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let pedidosFiltrados = [...pedidos];

    // Filtrar por estado
    if (filtroEstado && filtroEstado !== '') {
      pedidosFiltrados = pedidosFiltrados.filter((pedido) => pedido.estado.nombre === filtroEstado);
    }

    // Filtrar por ID
    if (buscarId && buscarId.trim() !== '') {
      pedidosFiltrados = pedidosFiltrados.filter((pedido) =>
        pedido.id.toString().includes(buscarId.trim())
      );
    }

    // Filtrar por rango de fechas
    if (fechaDesde && fechaHasta) {
      pedidosFiltrados = pedidosFiltrados.filter((pedido) => {
        const fechaPedido = new Date(pedido.fechaPedido).toISOString().split('T')[0];
        return fechaPedido >= fechaDesde && fechaPedido <= fechaHasta;
      });
    }

    setPedidosFiltrados(pedidosFiltrados);
  };
  const cambiarEstadoPedido = async (pedidoId: number, nuevoEstado: string) => {
    try {
      setLoading(true);
      await updateEstadoPedido(pedidoId, nuevoEstado);

      // Actualizar el pedido en el estado local
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          pedido.id === pedidoId ? { ...pedido, estado: { id: 0, nombre: nuevoEstado } } : pedido
        )
      );
    } catch (err) {
      setError(`Error al actualizar el estado: ${err}`);
      console.error('Error updating estado:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Avanza automáticamente el estado de un pedido usando la lógica del backend
   */
  const avanzarEstadoPedido = async (pedidoId: number) => {
    try {
      setLoading(true);
      const pedidoActualizado = await avanzarEstadoPedidoGenerico(pedidoId);

      // Actualizar el pedido en el estado local
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          pedido.id === pedidoId ? { ...pedido, estado: pedidoActualizado.estado } : pedido
        )
      );

      return true;
    } catch (err) {
      setError(
        `Error al avanzar estado: ${err instanceof Error ? err.message : 'Error desconocido'}`
      );
      console.error('Error avanzando estado:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getEstadoSiguiente = (estadoActual: string): string | null => {
    const flujoEstados: Record<string, string> = {
      PENDIENTE: 'CONFIRMADO',
      CONFIRMADO: 'EN_PREPARACION',
      EN_PREPARACION: 'LISTO',
      LISTO: 'EN_DELIVERY',
      EN_DELIVERY: 'ENTREGADO',
    };

    return flujoEstados[estadoActual] || null;
  };

  const puedeAvanzarEstado = (estadoActual: string, tipoEnvio: string): boolean => {
    // Si es LISTO y el tipo de envío no es DELIVERY, puede ir directo a ENTREGADO
    if (estadoActual === 'LISTO' && tipoEnvio !== 'DELIVERY') {
      return true;
    }

    return getEstadoSiguiente(estadoActual) !== null;
  };

  const obtenerProximoEstado = (estadoActual: string, tipoEnvio: string): string | null => {
    if (estadoActual === 'LISTO' && tipoEnvio !== 'DELIVERY') {
      return 'ENTREGADO';
    }

    return getEstadoSiguiente(estadoActual);
  };

  const limpiarFiltros = () => {
    setFiltroEstado('');
    setBuscarId('');
    setFechaDesde(obtenerFechaHoy());
    setFechaHasta(obtenerFechaHoy());
  };
  return {
    // Estados
    pedidosFiltrados,
    estados,
    loading,
    error,
    filtroEstado,
    buscarId,
    fechaDesde,
    fechaHasta,

    // Funciones
    setFiltroEstado,
    setBuscarId,
    setFechaDesde,
    setFechaHasta,
    cambiarEstadoPedido,
    avanzarEstadoPedido,
    cargarDatos,
    limpiarFiltros,
    puedeAvanzarEstado,
    obtenerProximoEstado,
  };
};
