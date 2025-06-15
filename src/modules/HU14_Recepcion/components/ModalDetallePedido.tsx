import React from 'react';
import { PedidoCompleto } from '../../../types/Pedido';
import { formatearNombreFormaPago } from '../../../shared/utils/pedidoUtils';

interface ModalDetallePedidoProps {
  pedido: PedidoCompleto;
  isOpen: boolean;
  onClose: () => void;
  onCambiarEstado: (pedidoId: number, nuevoEstado: string) => void;
  puedeAvanzarEstado: (estadoActual: string, tipoEnvio: string) => boolean;
  obtenerProximoEstado: (estadoActual: string, tipoEnvio: string) => string | null;
}

export const ModalDetallePedido: React.FC<ModalDetallePedidoProps> = ({
  pedido,
  isOpen,
  onClose,
  onCambiarEstado,
  puedeAvanzarEstado,
  obtenerProximoEstado,
}) => {
  if (!isOpen) return null;

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const manejarAvanzarEstado = () => {
    const proximoEstado = obtenerProximoEstado(pedido.estado.nombre, pedido.tipoEnvio.nombre);
    if (proximoEstado) {
      onCambiarEstado(pedido.id, proximoEstado);
      onClose();
    }
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={handleClickOutside}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-primary text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Detalle del Pedido #{pedido.id}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Información del Pedido */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Información del Pedido</h3>
              <div className="space-y-2">
                <p>
                  <strong>ID:</strong> #{pedido.id}
                </p>
                <p>
                  <strong>Fecha:</strong> {formatearFecha(pedido.fechaPedido)}
                </p>
                <p>
                  <strong>Estado:</strong>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {pedido.estado.nombre.replace(/_/g, ' ')}
                  </span>
                </p>
                <p>
                  <strong>Tipo de Envío:</strong>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {pedido.tipoEnvio.nombre.replace(/_/g, ' ')}
                  </span>
                </p>
                <p>
                  <strong>Forma de Pago:</strong>{' '}
                  {formatearNombreFormaPago(pedido.formaPago.nombre)}
                </p>
                <p>
                  <strong>Total:</strong>{' '}
                  <span className="text-xl font-bold text-green-600">
                    {formatearPrecio(pedido.total)}
                  </span>
                </p>
                {pedido.horasEstimadaFinalizacion && (
                  <p>
                    <strong>Hora Estimada:</strong> {pedido.horasEstimadaFinalizacion}
                  </p>
                )}
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">👤 Cliente</h3>
              <div className="space-y-2">
                <p>
                  <strong>Nombre:</strong> {pedido.cliente.nombre} {pedido.cliente.apellido}
                </p>
                <p>
                  <strong>Email:</strong> {pedido.cliente.email}
                </p>
                <p>
                  <strong>Teléfono:</strong> {pedido.cliente.telefono}
                </p>

                {/* Domicilios para delivery */}
                {pedido.tipoEnvio.nombre === 'DELIVERY' && pedido.cliente.domicilios.length > 0 && (
                  <div className="mt-3">
                    <strong>Domicilios:</strong>
                    <div className="mt-2 space-y-1">
                      {pedido.cliente.domicilios.map((domicilio) => (
                        <div key={domicilio.id} className="bg-white p-2 rounded border">
                          <p className="text-sm">
                            📍 {domicilio.calle} {domicilio.numero}, {domicilio.localidad.nombre}
                          </p>
                          {domicilio.latitud && domicilio.longitud && (
                            <p className="text-xs text-gray-500">
                              Coordenadas: {domicilio.latitud}, {domicilio.longitud}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detalles del Pedido */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Detalles del Pedido</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-gray-700">Artículo</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-700">Cantidad</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-700">
                      Precio Unit.
                    </th>
                    <th className="text-center p-3 text-sm font-medium text-gray-700">Origen</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.detalles.map((detalle) => (
                    <tr key={detalle.id} className="border-t border-gray-200">
                      <td className="p-3">
                        <div className="flex items-center">
                          {detalle.articulo.imagen?.url && (
                            <img
                              src={detalle.articulo.imagen.url}
                              alt={detalle.articulo.denominacion}
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                          )}
                          <div>
                            <p className="font-medium">{detalle.articulo.denominacion}</p>
                            {detalle.promocionOrigenId && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                🎉 Promoción
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-3">{detalle.cantidad}</td>
                      <td className="text-center p-3">
                        {formatearPrecio(detalle.articulo.precioVenta)}
                      </td>
                      <td className="text-center p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            detalle.origen === 'PROMOCION'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {detalle.origen === 'PROMOCION' ? '🎉 Promo' : '🛍️ Individual'}
                        </span>
                      </td>
                      <td className="text-right p-3 font-medium">
                        {detalle.subtotal > 0 ? formatearPrecio(detalle.subtotal) : 'Incluido'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>

            {puedeAvanzarEstado(pedido.estado.nombre, pedido.tipoEnvio.nombre) && (
              <button
                onClick={manejarAvanzarEstado}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
              >
                ➡️ Avanzar a{' '}
                {obtenerProximoEstado(pedido.estado.nombre, pedido.tipoEnvio.nombre)?.replace(
                  /_/g,
                  ' '
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
