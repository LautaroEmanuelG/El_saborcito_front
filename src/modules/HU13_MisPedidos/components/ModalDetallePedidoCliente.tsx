// 🔍 Modal de detalle de pedido para cliente

import React, { useState, useEffect } from 'react';
import { PedidoCompletoConDetalles } from '../../../types/Pedido';
import { formatearNombreFormaPago } from '../../../shared/utils/pedidoUtils';
import { getPromocionById } from '../../../shared/services/promocionService';

interface ModalDetallePedidoClienteProps {
  pedido: PedidoCompletoConDetalles;
  isOpen: boolean;
  onClose: () => void;
}

interface PromocionConArticulos {
  promocionId: number;
  denominacion?: string;
  articulos: any[];
  precioPromocional: number;
}

interface ArticulosAgrupados {
  promociones: PromocionConArticulos[];
  individuales: any[];
}

export const ModalDetallePedidoCliente: React.FC<ModalDetallePedidoClienteProps> = ({
  pedido,
  isOpen,
  onClose,
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

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  // Cargar detalles de promociones cuando se abre el modal
  useEffect(() => {
    if (isOpen && pedido.detalles) {
      cargarDetallesPromociones();
    }
  }, [isOpen, pedido.detalles]);

  const cargarDetallesPromociones = async () => {
    try {
      const promocionesUnicas = Array.from(
        new Set(
          pedido.detalles
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
        // Tomar el precio promocional fijo desde promocionesDetalle
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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClickOutside}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🧾 Detalle del Pedido #{pedido.id}</h2>
            <p className="text-gray-600 mt-1">{formatearFecha(pedido.fechaPedido)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Información del pedido */}
        <div className="p-6 space-y-6">
          {/* Datos generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <strong className="text-gray-700">📦 Estado:</strong>
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                  pedido.estado.nombre === 'PENDIENTE'
                    ? 'bg-yellow-100 text-yellow-800'
                    : pedido.estado.nombre === 'EN_PREPARACION'
                      ? 'bg-blue-100 text-blue-800'
                      : pedido.estado.nombre === 'LISTO'
                        ? 'bg-green-100 text-green-800'
                        : pedido.estado.nombre === 'ENTREGADO'
                          ? 'bg-green-200 text-green-900'
                          : pedido.estado.nombre === 'CANCELADO'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                }`}
              >
                {pedido.estado.nombre.replace('_', ' ')}
              </span>
            </div>
            <div>
              <strong className="text-gray-700">🚚 Tipo de envío:</strong>
              <span className="ml-2">{pedido.tipoEnvio.nombre}</span>
            </div>
            <div>
              <strong className="text-gray-700">💳 Forma de pago:</strong>
              <span className="ml-2">{formatearNombreFormaPago(pedido.formaPago.nombre)}</span>
            </div>
          </div>
          {/* Datos del cliente */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">👤 Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-700">Nombre:</strong>
                <span className="ml-2">
                  {pedido.cliente.nombre} {pedido.cliente.apellido}
                </span>
              </div>
              <div>
                <strong className="text-gray-700">Email:</strong>
                <span className="ml-2">{pedido.cliente.email}</span>
              </div>
              <div>
                <strong className="text-gray-700">Teléfono:</strong>
                <span className="ml-2">{pedido.cliente.telefono}</span>
              </div>
            </div>
          </div>{' '}
          {/* Dirección de entrega */}
          {pedido.cliente.domicilios && pedido.cliente.domicilios.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📍 Dirección de Entrega</h3>
              <p className="text-gray-700">
                {pedido.cliente.domicilios[0].calle} {pedido.cliente.domicilios[0].numero}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {pedido.cliente.domicilios[0].localidad.nombre}, CP:{' '}
                {pedido.cliente.domicilios[0].cp}{' '}
              </p>
            </div>
          )}
          {/* Artículos del pedido */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🛒 Productos Pedidos</h3>

            <div className="space-y-4">
              {(() => {
                const { promociones, individuales } = agruparArticulos();
                return (
                  <>
                    {/* Artículos Individuales */}
                    {individuales.map((detalle, index) => (
                      <div
                        key={`individual-${index}`}
                        className="flex justify-between items-center bg-white p-3 rounded border border-gray-200"
                      >
                        <div>
                          <span className="font-medium">
                            {detalle.cantidad}x {detalle.articulo.denominacion}
                          </span>
                          <p className="text-sm text-gray-600">
                            {formatearPrecio(detalle.articulo.precioVenta)} c/u
                          </p>
                        </div>
                        <span className="font-bold text-red-600">
                          {formatearPrecio(detalle.subtotal)}
                        </span>
                      </div>
                    ))}

                    {/* Promociones */}
                    {promociones.map((promocion) => (
                      <div
                        key={`promocion-${promocion.promocionId}`}
                        className="border border-orange-200 rounded-lg p-4 bg-white"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h5 className="font-medium text-orange-800">
                              {promocion.denominacion}
                            </h5>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              🎉 Promoción
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-orange-600 font-bold">
                              {formatearPrecio(promocion.precioPromocional)}
                            </span>
                            <p className="text-sm text-gray-600">
                              Cantidad: {promocion.articulos[0]?.cantidad || 1}
                            </p>
                          </div>
                        </div>

                        {/* Artículos dentro de la promoción */}
                        <div className="space-y-2">
                          {promocion.articulos.map((articulo, artIndex) => (
                            <div
                              key={`promo-art-${artIndex}`}
                              className="flex justify-between items-center bg-orange-50 p-2 rounded"
                            >
                              <span className="text-sm">{articulo.articulo.denominacion}</span>
                              <span className="text-xs text-orange-600">
                                {articulo.cantidadConPromocion > 0 &&
                                  `${articulo.cantidadConPromocion} incluidos`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
          {/* Total del pedido */}
          <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">💰 Total del Pedido:</span>
              <span className="text-2xl font-bold text-red-600">
                {formatearPrecio(pedido.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
