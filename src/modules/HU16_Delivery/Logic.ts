import { useState, useEffect } from 'react';
import { getAllPedidos, updateEstadoPedido } from '../../shared/services/pedidoService';
import { PedidoCompleto } from '../../types/Pedido';

export const useDeliveryLogic = () => {
  const [pedidosDelivery, setPedidosDelivery] = useState<PedidoCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Cargar pedidos de delivery
  useEffect(() => {
    cargarPedidosDelivery();
  }, []);
  const cargarPedidosDelivery = async () => {
    setLoading(true);
    try {
      const todosPedidos = await getAllPedidos();

      // Filtrar solo pedidos EN_DELIVERY
      const pedidosEnDelivery = todosPedidos.filter(
        (pedido: PedidoCompleto) => pedido.estado.nombre === 'EN_DELIVERY'
      );

      setPedidosDelivery(pedidosEnDelivery);
    } catch (err) {
      setError('Error al cargar los pedidos de delivery');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoEntregado = async (pedidoId: number) => {
    try {
      setLoading(true);
      await updateEstadoPedido(pedidoId, 'ENTREGADO');

      // Remover el pedido de la lista de delivery
      setPedidosDelivery((prevPedidos) => prevPedidos.filter((pedido) => pedido.id !== pedidoId));
    } catch (err) {
      setError(`Error al marcar como entregado: ${err}`);
      console.error('Error updating estado:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estados
    pedidosDelivery,
    loading,
    error,

    // Funciones
    marcarComoEntregado,
    cargarPedidosDelivery,
  };
};
