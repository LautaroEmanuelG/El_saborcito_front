// 📱 Componente principal para el historial de pedidos del cliente

import React, { useState, useEffect } from 'react';
import { PedidoCompletoConDetalles } from '../../../types/Pedido';
import { getPedidosByCliente } from '../../../shared/services/pedidoService';
import { ModalDetallePedidoCliente } from './ModalDetallePedidoCliente';
import IconoVer from '../../../assets/svgs/icons/IconoVer';

export const getEstadoBadgeColor = (estado: string): string => {
  // Colores basados en TablaRecepcion.tsx y adaptados si es necesario
  const colors: Record<string, string> = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    CONFIRMADO: 'bg-blue-100 text-blue-800',
    EN_PREPARACION: 'bg-orange-100 text-orange-800',
    LISTO: 'bg-green-100 text-green-800',
    EN_DELIVERY: 'bg-purple-100 text-purple-800',
    ENTREGADO: 'bg-gray-100 text-gray-800',
    CANCELADO: 'bg-red-100 text-red-800',
    DEMORADO: 'bg-red-200 text-red-900',
  };
  return colors[estado.toUpperCase()] || 'bg-gray-100 text-gray-800';
};

export const HistorialPedidosCliente: React.FC = () => {
  // 🚧 HARDCODEADO TEMPORALMENTE - Usuario ID 5 para pruebas
  const CLIENTE_ID = 5;
  const CLIENTE_NOMBRE = 'María González';

  const [pedidos, setPedidos] = useState<PedidoCompletoConDetalles[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoCompletoConDetalles | null>(
    null
  );
  const [mostrandoDetalle, setMostrandoDetalle] = useState(false);

  useEffect(() => {
    cargarPedidosCliente();
  }, []);

  const cargarPedidosCliente = async () => {
    try {
      setCargando(true);
      setError(null);
      console.log(`🔍 Cargando pedidos para cliente ID: ${CLIENTE_ID}`);
      const pedidosCliente = await getPedidosByCliente(CLIENTE_ID);
      console.log('📋 Pedidos cargados:', pedidosCliente);
      const pedidosOrdenados = pedidosCliente.sort(
        (a: PedidoCompletoConDetalles, b: PedidoCompletoConDetalles) =>
          new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()
      );
      setPedidos(pedidosOrdenados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los pedidos');
      console.error('❌ Error cargando pedidos:', err);
    } finally {
      setCargando(false);
    }
  };

  const manejarVerDetalle = (pedido: PedidoCompletoConDetalles) => {
    setPedidoSeleccionado(pedido);
    setMostrandoDetalle(true);
  };

  const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio);
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      // Añadimos hora y minutos para consistencia si se desea, o se puede quitar.
      // hour: '2-digit',
      // minute: '2-digit',
    });
  };

  const calcularTotalGastado = (): number => {
    return pedidos.reduce((total, pedido) => total + pedido.total, 0);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error al cargar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={cargarPedidosCliente}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 w-full">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mis Pedidos</h1>
              <p className="text-gray-600 mt-2">Bienvenido/a, {CLIENTE_NOMBRE}</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-sm text-gray-500">Total de pedidos</p>
              <p className="text-2xl font-bold text-red-600">{pedidos.length}</p>
              {pedidos.length > 0 && (
                <p className="text-sm text-gray-600">
                  Total gastado: {formatearPrecio(calcularTotalGastado())}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes pedidos aún</h3>
            <p className="text-gray-500">¡Realiza tu primer pedido y aparecerá aquí!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      {/* Estilo de TablaRecepcion.tsx */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{pedido.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearFecha(pedido.fechaPedido)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeColor(pedido.estado.nombre)}`}
                        >
                          {pedido.estado.nombre.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-negro">
                        {formatearPrecio(pedido.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => manejarVerDetalle(pedido)}
                          className="bg-primary text-white px-3 py-1 rounded text-xs transition-colors"
                          title="Ver detalle"
                        >
                          <IconoVer className="inline-block w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {pedidoSeleccionado && (
        <ModalDetallePedidoCliente
          pedido={pedidoSeleccionado}
          isOpen={mostrandoDetalle}
          onClose={() => {
            setMostrandoDetalle(false);
            setPedidoSeleccionado(null);
          }}
        />
      )}
    </div>
  );
};
