import { useState, useEffect } from 'react';
import { PedidoDTO, PedidoConRecetasDTO } from '../../modules/HU17_Cocina/Model';
import { historialCocinaService } from '../services/historialCocinaService';

export const useHistorialCocina = () => {
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await historialCocinaService.obtenerPedidosFinalizados();
      // Ordenar por fecha: más nuevos arriba
      const pedidosOrdenados = data.sort(
        (a, b) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()
      );
      setPedidos(pedidosOrdenados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  return {
    pedidos,
    loading,
    error,
    refetch: cargarPedidos,
  };
};

export const useDetalleCompleto = () => {
  const [detalle, setDetalle] = useState<PedidoConRecetasDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerDetalle = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await historialCocinaService.obtenerDetalleCompleto(id);
      setDetalle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const cerrarDetalle = () => {
    setDetalle(null);
    setError(null);
  };

  return {
    detalle,
    loading,
    error,
    obtenerDetalle,
    cerrarDetalle,
  };
};
