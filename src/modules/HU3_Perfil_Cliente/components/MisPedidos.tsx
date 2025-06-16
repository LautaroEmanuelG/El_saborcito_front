import { useState, useEffect } from 'react';

import { useUser } from '../../../shared/providers/UserProvider';
import axiosInstance from '../../../shared/services/axiosConfig';

interface Pedido {
  id: number;
  fechaPedido: string;
  estado: {
    nombre: string;
  };
  detalles: Array<{
    cantidad: number;
    articuloManufacturado: {
      denominacion: string;
    };
  }>;
  total: number;
}

export const MisPedidos = () => {
  const { user } = useUser();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/historial-pedidos/cliente/${user?.id}`);
      setPedidos(response.data);
    } catch (err) {
      setError('Error al cargar los pedidos');
      console.error('Error al cargar los pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPedidos();
    }
  }, [user?.id]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTotalItems = (pedido: Pedido) => {
    return pedido.detalles.reduce((total, item) => total + item.cantidad, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header con título */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mis Pedidos</h1>
        <button
          onClick={fetchPedidos}
          className="bg-primary hover:bg-primarydark text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg text-gray-600">Cargando pedidos...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-primary text-lg">{error}</p>
          <button
            onClick={fetchPedidos}
            className="mt-4 bg-primary hover:bg-primarydark text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de pedidos */}
      <div className="space-y-4">
        {pedidos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tienes pedidos realizados</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-800">
                      Pedido #{String(pedido.id).padStart(3, '0')}
                    </span>
                    <span className="text-primary font-medium">
                      {calcularTotalItems(pedido)} items
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {formatearFecha(pedido.fechaPedido)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">
                    Total: ${pedido.total}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      pedido.estado.nombre === 'ENTREGADO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {pedido.estado.nombre}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 