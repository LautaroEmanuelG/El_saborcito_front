import React from 'react';
import { PedidoCompletoConDetalles } from '../../../types/Pedido';
import { formatearNombreFormaPago } from '../../../shared/utils/pedidoUtils';

interface TablaDeliveryProps {
  pedidos: PedidoCompletoConDetalles[];
  onVerDetalle: (pedido: PedidoCompletoConDetalles) => void;
  onMarcarEntregado: (pedidoId: number) => void;
}

export const TablaDelivery: React.FC<TablaDeliveryProps> = ({
  pedidos,
  onVerDetalle,
  onMarcarEntregado,
}) => {
  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio);
  };

  const obtenerDireccionPrincipal = (pedido: PedidoCompletoConDetalles): string => {
    if (pedido.cliente.domicilios && pedido.cliente.domicilios.length > 0) {
      const domicilio = pedido.cliente.domicilios[0];
      return `${domicilio.calle} ${domicilio.numero}, ${domicilio.localidad.nombre}`;
    }
    return 'Dirección no disponible';
  };

  if (pedidos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">🚚</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay pedidos para entregar</h3>
        <p className="text-gray-500">
          Todos los pedidos han sido entregados o no hay pedidos en estado "En Delivery"
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dirección
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Forma Pago
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-purple-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-purple-900">#{pedido.id}</div>
                  {pedido.horasEstimadaFinalizacion && (
                    <div className="text-xs text-gray-500">
                      Est: {pedido.horasEstimadaFinalizacion}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {pedido.cliente.nombre} {pedido.cliente.apellido}
                  </div>
                  <div className="text-sm text-gray-500">{pedido.cliente.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs">
                    📍 {obtenerDireccionPrincipal(pedido)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    📞 {pedido.cliente.telefono}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-green-600">
                    {formatearPrecio(pedido.total)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatearNombreFormaPago(pedido.formaPago.nombre)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatearFecha(pedido.fechaPedido)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {/* Botón Ver Detalle */}
                    <button
                      onClick={() => onVerDetalle(pedido)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      title="Ver detalle completo"
                    >
                      👁️ Detalle
                    </button>

                    {/* Botón Marcar Entregado */}
                    <button
                      onClick={() => onMarcarEntregado(pedido.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                      title="Marcar como entregado"
                    >
                      ✅ Entregado
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
