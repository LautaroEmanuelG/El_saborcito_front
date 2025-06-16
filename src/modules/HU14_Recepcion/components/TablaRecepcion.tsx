import React from 'react';
import { PedidoCompletoConDetalles } from '../../../types/Pedido';
import { formatearNombreFormaPago } from '../../../shared/utils/pedidoUtils';
import IconoVer from '../../../assets/svgs/icons/IconoVer';

interface TablaRecepcionProps {
  pedidos: PedidoCompletoConDetalles[];
  onVerDetalle: (pedido: PedidoCompletoConDetalles) => void;
  onCambiarEstado: (pedidoId: number, nuevoEstado: string) => void;
  puedeAvanzarEstado: (estadoActual: string, tipoEnvio: string) => boolean;
  obtenerProximoEstado: (estadoActual: string, tipoEnvio: string) => string | null;
}

export const TablaRecepcion: React.FC<TablaRecepcionProps> = ({
  pedidos,
  onVerDetalle,
  onCambiarEstado,
  puedeAvanzarEstado,
  obtenerProximoEstado,
}) => {
  const getEstadoBadgeColor = (estado: string): string => {
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
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getTipoEnvioBadgeColor = (tipo: string): string => {
    const colors: Record<string, string> = {
      DELIVERY: 'bg-blue-100 text-blue-800',
      TAKE_AWAY: 'bg-green-100 text-green-800',
      EN_LOCAL: 'bg-purple-100 text-purple-800',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio);
  };

  const manejarAvanzarEstado = (pedido: PedidoCompletoConDetalles) => {
    const proximoEstado = obtenerProximoEstado(pedido.estado.nombre, pedido.tipoEnvio.nombre);
    if (proximoEstado) {
      onCambiarEstado(pedido.id, proximoEstado);
    }
  };

  if (pedidos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay pedidos para mostrar</h3>
        <p className="text-gray-500">No se encontraron pedidos con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo Envío
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Forma Pago
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{pedido.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {pedido.cliente.nombre} {pedido.cliente.apellido}
                  </div>
                  <div className="text-sm text-gray-500">📞 {pedido.cliente.telefono}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeColor(pedido.estado.nombre)}`}
                  >
                    {pedido.estado.nombre.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoEnvioBadgeColor(pedido.tipoEnvio.nombre)}`}
                  >
                    {pedido.tipoEnvio.nombre.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatearNombreFormaPago(pedido.formaPago.nombre)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatearPrecio(pedido.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatearFecha(pedido.fechaPedido)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {/* Botón Ver Detalle */}
                    <button
                      onClick={() => onVerDetalle(pedido)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      title="Ver detalle"
                    >
                      <IconoVer className="inline-block w-4 h-4" />
                    </button>

                    {/* Botón Avanzar Estado */}
                    {puedeAvanzarEstado(pedido.estado.nombre, pedido.tipoEnvio.nombre) && (
                      <button
                        onClick={() => manejarAvanzarEstado(pedido)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                        title={`Cambiar a ${obtenerProximoEstado(pedido.estado.nombre, pedido.tipoEnvio.nombre)}`}
                      >
                        ➡️
                      </button>
                    )}
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
