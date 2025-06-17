import React, { useState, useEffect } from 'react';
import { PedidoCompletoConDetalles } from '../../../types/Pedido';
import { formatearNombreFormaPago } from '../../../shared/utils/pedidoUtils';
import { getPromocionById } from '../../../shared/services/promocionService';
import { IconoArrowRight } from '../../../assets/svgs/icons/IconoArrowRight';
import { GestionFacturaRecepcion } from './GestionFacturaRecepcion';
import { IconoBasura } from '../../../assets/svgs/icons/IconoBasura';

interface ModalDetallePedidoProps {
  pedido: PedidoCompletoConDetalles;
  isOpen: boolean;
  onClose: () => void;
  onCambiarEstado: (pedidoId: number, nuevoEstado: string) => void;
  onAvanzarEstado: (pedidoId: number) => void;
  onCancelarPedido: (pedidoId: number) => void;
  puedeAvanzarEstado: (estadoActual: string, tipoEnvio: string) => boolean;
  obtenerProximoEstado: (estadoActual: string, tipoEnvio: string) => string | null;
}

interface PromocionConArticulos {
  promocionId: number;
  denominacion?: string;
  articulos: any[]; // Usar any[] para compatibilidad con ambos tipos
  precioPromocional: number;
}

interface ArticulosAgrupados {
  promociones: PromocionConArticulos[];
  individuales: any[]; // Usar any[] para compatibilidad con ambos tipos
}

export const ModalDetallePedido: React.FC<ModalDetallePedidoProps> = ({
  pedido,
  isOpen,
  onClose,
  onCambiarEstado,
  onAvanzarEstado,
  onCancelarPedido,
  puedeAvanzarEstado,
  obtenerProximoEstado,
}) => {
  const [promocionesDetalle, setPromocionesDetalle] = useState<Record<number, any>>({});

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
    onAvanzarEstado(pedido.id);
    onClose();
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Cargar detalles de promociones cuando se abre el modal
  useEffect(() => {
    if (isOpen && pedido.detallesCompletos) {
      cargarDetallesPromociones();
    }
  }, [isOpen, pedido.detallesCompletos]);
  const cargarDetallesPromociones = async () => {
    try {
      const promocionesUnicas = Array.from(
        new Set(
          pedido.detallesCompletos
            ?.filter((detalle) => detalle.promocionOrigenId)
            .map((detalle) => detalle.promocionOrigenId!)
        )
      );

      const detallesPromociones: Record<number, any> = {};
      for (const promocionId of promocionesUnicas) {
        try {
          const promocion = await getPromocionById(promocionId);
          detallesPromociones[promocionId] = promocion;
        } catch (error) {
          console.warn(`Error cargando promoción ${promocionId}:`, error);
        }
      }
      setPromocionesDetalle(detallesPromociones);
    } catch (error) {
      console.error('Error cargando detalles de promociones:', error);
    }
  };
  const agruparArticulos = (): ArticulosAgrupados => {
    // Usar siempre pedido.detalles que contiene los artículos reales
    const detallesReales = pedido.detalles || [];

    const promocionesMap = new Map<number, any[]>();
    const individuales: any[] = [];

    // Agrupar artículos reales por promocionOrigenId
    detallesReales.forEach((detalle) => {
      if (detalle.promocionOrigenId) {
        if (!promocionesMap.has(detalle.promocionOrigenId)) {
          promocionesMap.set(detalle.promocionOrigenId, []);
        }
        promocionesMap.get(detalle.promocionOrigenId)?.push(detalle);
      } else {
        individuales.push(detalle);
      }
    });

    // Crear array de promociones con información de detallesCompletos si está disponible
    const promociones: PromocionConArticulos[] = Array.from(promocionesMap.entries()).map(
      ([promocionId, articulos]) => {
        // Buscar el nombre de la promoción en detallesCompletos
        const promocionInfo = pedido.detallesCompletos?.find(
          (detalle) => detalle.promocionOrigenId === promocionId
        );
        // Tomar el precio promocional fijo desde detallesPromociones
        const precioPromocional = promocionesDetalle?.[promocionId]?.precioPromocional ?? 0;
        return {
          promocionId,
          denominacion:
            promocionInfo?.articulo?.denominacion ||
            promocionesDetalle?.[promocionId]?.denominacion ||
            `Promoción ${promocionId}`,
          articulos,
          precioPromocional,
        };
      }
    );

    return { promociones, individuales };
  };

  const puedeCancelarPedido = (estadoActual: string): boolean => {
    // Solo se pueden cancelar pedidos en estados específicos
    const estadosCancelables = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION'];
    return estadosCancelables.includes(estadoActual);
  };

  const manejarCancelarPedido = () => {
    if (confirm(`¿Está seguro que desea cancelar el pedido #${pedido.id}?`)) {
      onCancelarPedido(pedido.id);
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
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Cliente</h3>
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
              </div>
            </div>
          </div>{' '}
          {/* Detalles del Pedido */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Detalles del Pedido
              {pedido.detallesCompletos && (
                <span className="text-sm text-green-600 ml-2">Con información de promociones</span>
              )}
            </h3>

            {/* Mostrar detalles agrupados si están disponibles */}
            {pedido.detallesCompletos && pedido.detallesCompletos.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  const { promociones, individuales } = agruparArticulos();
                  return (
                    <>
                      {/* Artículos Individuales */}
                      {individuales.map((detalle, index) => (
                        <div key={`individual-${index}`} className="bg-white border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {detalle.articulo.denominacion}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Cantidad: {detalle.cantidad}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {formatearPrecio(detalle.subtotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Promociones */}
                      {promociones.map(
                        (promocion) => (
                          console.log('promocion :>> ', promocion),
                          (
                            <div
                              key={`promocion-${promocion.promocionId}`}
                              className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                            >
                              <div className="flex items-center mb-3">
                                <div className="flex-1">
                                  <p className="font-medium text-purple-900">
                                    {promocion.denominacion}
                                  </p>
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                    🎉 Promoción
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-purple-900">
                                    Cantidad: {promocion.articulos[0]?.cantidad || 1}
                                  </p>
                                </div>
                              </div>

                              {/* Artículos dentro de la promoción */}
                              <div className="ml-6 space-y-2">
                                {promocion.articulos.map((detalle, artIndex) => (
                                  <div
                                    key={`promo-art-${artIndex}`}
                                    className="flex items-center justify-between bg-white bg-opacity-50 rounded p-2"
                                  >
                                    <div className="flex items-center">
                                      <span className="text-sm text-gray-700">
                                        {detalle.articulo.denominacion}
                                      </span>
                                    </div>
                                    <span className="text-xs text-purple-600">
                                      {detalle.cantidadConPromocion > 0 &&
                                        `${detalle.cantidadConPromocion} incluidos`}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Total de la promoción */}
                              <div className="mt-3 pt-2 border-t border-purple-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-purple-800">
                                    Total promoción:
                                  </span>
                                  <span className="font-medium text-purple-900">
                                    {formatearPrecio(promocion.precioPromocional)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        )
                      )}

                      {/* Total general */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-green-800">
                            Total del Pedido:
                          </span>
                          <span className="text-xl font-bold text-green-900">
                            {pedido.totalCalculado
                              ? formatearPrecio(pedido.totalCalculado)
                              : formatearPrecio(pedido.total)}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              /* Fallback a detalles originales */
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Artículo</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-700">
                        Cantidad
                      </th>
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
                </table>{' '}
              </div>
            )}
          </div>
          {/* Gestión de Factura */}
          <div className="mb-6">
            {' '}
            <GestionFacturaRecepcion
              pedidoId={pedido.id}
              clienteNombre={`${pedido.cliente.nombre} ${pedido.cliente.apellido}`}
              clienteEmail={pedido.cliente.email}
              className="w-full"
            />
          </div>
          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            {puedeCancelarPedido(pedido.estado.nombre) && (
              <button
                onClick={manejarCancelarPedido}
                className="px-4 py-2 gap-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
              >
                <IconoBasura />
                Cancelar Pedido
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>

            {puedeAvanzarEstado(pedido.estado.nombre, pedido.tipoEnvio.nombre) && (
              <button
                onClick={manejarAvanzarEstado}
                className="px-4 py-2 gap-2 bg-primary text-white rounded hover:bg-primarydark transition-colors flex items-center"
              >
                <IconoArrowRight />
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
