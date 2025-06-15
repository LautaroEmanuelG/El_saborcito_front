import React, { useEffect, useRef } from 'react';
import { PedidoCompleto } from '../../../types/Pedido';
import { formatearNombreFormaPago } from '../../../shared/utils/pedidoUtils';

// Declaración para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface ModalDetalleDeliveryProps {
  pedido: PedidoCompleto;
  isOpen: boolean;
  onClose: () => void;
  onMarcarEntregado: (pedidoId: number) => void;
}

export const ModalDetalleDelivery: React.FC<ModalDetalleDeliveryProps> = ({
  pedido,
  isOpen,
  onClose,
  onMarcarEntregado,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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

  const manejarEntrega = () => {
    onMarcarEntregado(pedido.id);
    onClose();
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Inicializar mapa cuando el modal se abre
  useEffect(() => {
    if (isOpen && mapRef.current && !mapInstanceRef.current) {
      // Cargar Leaflet dinámicamente
      const loadLeaflet = async () => {
        if (!window.L) {
          // Cargar CSS de Leaflet
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          // Cargar JS de Leaflet
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => initializeMap();
          document.head.appendChild(script);
        } else {
          initializeMap();
        }
      };

      const initializeMap = () => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Obtener coordenadas del primer domicilio con coordenadas
        const domicilioConCoordenadas = pedido.cliente.domicilios.find(
          (d) => d.latitud && d.longitud
        );

        const lat = domicilioConCoordenadas?.latitud || -32.8895;
        const lng = domicilioConCoordenadas?.longitud || -68.8458;

        // Crear mapa
        mapInstanceRef.current = window.L.map(mapRef.current).setView([lat, lng], 15);

        // Agregar tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapInstanceRef.current);

        // Agregar marcador
        const marker = window.L.marker([lat, lng]).addTo(mapInstanceRef.current);

        if (domicilioConCoordenadas) {
          marker
            .bindPopup(
              `
            <div style="text-align: center;">
              <strong>📍 Dirección de Entrega</strong><br/>
              ${domicilioConCoordenadas.calle} ${domicilioConCoordenadas.numero}<br/>
              ${domicilioConCoordenadas.localidad.nombre}
            </div>
          `
            )
            .openPopup();
        }
      };

      loadLeaflet();
    }

    // Cleanup al cerrar el modal
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, pedido.cliente.domicilios]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={handleClickOutside}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🚚 Delivery - Pedido #{pedido.id}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Información del Cliente y Entrega */}
            <div className="space-y-6">
              {/* Cliente */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">
                  👤 Información del Cliente
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>Nombre:</strong> {pedido.cliente.nombre} {pedido.cliente.apellido}
                  </p>
                  <p>
                    <strong>Teléfono:</strong>
                    <a
                      href={`tel:${pedido.cliente.telefono}`}
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      📞 {pedido.cliente.telefono}
                    </a>
                  </p>
                  <p>
                    <strong>Email:</strong> {pedido.cliente.email}
                  </p>
                </div>
              </div>

              {/* Direcciones */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">
                  📍 Direcciones de Entrega
                </h3>
                {pedido.cliente.domicilios.length > 0 ? (
                  <div className="space-y-3">
                    {pedido.cliente.domicilios.map((domicilio, index) => (
                      <div
                        key={domicilio.id}
                        className="bg-white p-3 rounded border border-green-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-green-800">
                              📍 {domicilio.calle} {domicilio.numero}
                            </p>
                            <p className="text-sm text-gray-600">
                              {domicilio.localidad.nombre}, {domicilio.localidad.provincia.nombre}
                            </p>
                            <p className="text-sm text-gray-500">CP: {domicilio.cp}</p>
                            {domicilio.latitud && domicilio.longitud && (
                              <p className="text-xs text-green-600 mt-1">
                                📍 Coordenadas: {domicilio.latitud.toFixed(6)},{' '}
                                {domicilio.longitud.toFixed(6)}
                              </p>
                            )}
                          </div>
                          {index === 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Principal
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay direcciones registradas</p>
                )}
              </div>

              {/* Información del Pedido */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">
                  📦 Detalles del Pedido
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>Fecha:</strong> {formatearFecha(pedido.fechaPedido)}
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
            </div>

            {/* Mapa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">🗺️ Ubicación</h3>
              <div
                ref={mapRef}
                className="w-full h-80 bg-gray-200 rounded-lg border"
                style={{ minHeight: '320px' }}
              >
                {/* El mapa se renderizará aquí */}
                <div className="flex items-center justify-center h-full text-gray-500">
                  Cargando mapa...
                </div>
              </div>
            </div>
          </div>

          {/* Artículos del Pedido */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">🍽️ Artículos a Entregar</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="grid gap-3 p-4">
                {pedido.detalles.map((detalle) => (
                  <div
                    key={detalle.id}
                    className="bg-white p-3 rounded border flex items-center justify-between"
                  >
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
                        <p className="text-sm text-gray-600">Cantidad: {detalle.cantidad}</p>
                        {detalle.promocionOrigenId && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            🎉 Promoción
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatearPrecio(detalle.articulo.precioVenta)}</p>
                      {detalle.subtotal > 0 && (
                        <p className="text-sm text-gray-600">
                          Subtotal: {formatearPrecio(detalle.subtotal)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

            <button
              onClick={manejarEntrega}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
            >
              ✅ Marcar como Entregado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
