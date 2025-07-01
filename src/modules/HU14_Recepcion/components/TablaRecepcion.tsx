import { PedidoCompletoConDetalles } from '../../../types/Pedido';
import { formatearNombreFormaPago } from '../../../shared/utils/pedidoUtils';
import IconoVer from '../../../assets/svgs/icons/IconoVer';
import { IconoArrowRight } from '../../../assets/svgs/icons/IconoArrowRight';
import { getEstadoBadgeColor } from '../../HU13_MisPedidos/components/HistorialPedidosCliente';
import { IconoBasura } from '../../../assets/svgs/icons/IconoBasura';

interface TablaRecepcionProps {
  pedidos: PedidoCompletoConDetalles[];
  onVerDetalle: (pedido: PedidoCompletoConDetalles) => void;
  onAvanzarEstado: (pedidoId: number) => void;
  onCancelarPedido: (pedidoId: number) => void;
  puedeAvanzarEstado: (estadoActual: string) => boolean;
}

export const TablaRecepcion: React.FC<TablaRecepcionProps> = ({
  pedidos,
  onVerDetalle,
  onAvanzarEstado,
  onCancelarPedido,
  puedeAvanzarEstado,
}) => {
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
    onAvanzarEstado(pedido.id);
  };

  const puedeCancelarPedido = (estadoActual: string): boolean => {
    // Solo se pueden cancelar pedidos en estados específicos
    const estadosCancelables = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION'];
    return estadosCancelables.includes(estadoActual);
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
            {pedidos.reverse().map((pedido) => (
              <tr key={pedido.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{pedido.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {pedido.cliente.nombre} {pedido.cliente.apellido}
                  </div>
                  <div className="text-sm text-gray-500">{pedido.cliente.telefono}</div>
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
                  <div className="text-sm text-gray-500">
                    {formatearNombreFormaPago(pedido.formaPago.nombre)}
                  </div>
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
                      className="bg-gris text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      title="Ver detalle"
                    >
                      <IconoVer className="inline-block w-4 h-4" />
                    </button>

                    {/* Botón Avanzar Estado */}
                    {puedeAvanzarEstado(pedido.estado.nombre) && (
                      <button
                        onClick={() => manejarAvanzarEstado(pedido)}
                        className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                        title="Avanzar estado del pedido"
                      >
                        <IconoArrowRight />
                      </button>
                    )}

                    {/* Botón Cancelar Pedido */}
                    {puedeCancelarPedido(pedido.estado.nombre) && (
                      <button
                        onClick={() => onCancelarPedido(pedido.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                        title="Cancelar pedido"
                      >
                        <IconoBasura />
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
