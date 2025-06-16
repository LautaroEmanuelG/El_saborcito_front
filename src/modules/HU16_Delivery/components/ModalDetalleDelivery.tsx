import React, { useEffect, useRef } from 'react';
import { PedidoCompletoConDetalles } from '../../../types/Pedido';

// Declaración para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface ModalDetalleDeliveryProps {
  pedido: PedidoCompletoConDetalles;
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

  const manejarEntrega = () => {
    onMarcarEntregado(pedido.id);
    onClose();
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  // Agrupar artículos por promoción usando pedido.detalles (artículos reales)
  const agruparArticulos = () => {
    // Usar pedido.detalles que contiene los artículos reales
    const detallesReales = pedido.detalles || [];
    const articulosIndividuales: any[] = [];
    const promociones: { [key: string]: any[] } = {};

    // Agrupar artículos reales por promocionOrigenId
    detallesReales.forEach((detalle) => {
      if (detalle.promocionOrigenId) {
        const promocionId = detalle.promocionOrigenId.toString();
        if (!promociones[promocionId]) {
          promociones[promocionId] = [];
        }
        promociones[promocionId].push(detalle);
      } else {
        articulosIndividuales.push(detalle);
      }
    });

    return { articulosIndividuales, promociones };
  };

  const { articulosIndividuales, promociones } = agruparArticulos();

  // Inicializar mapa cuando el modal se abre
  useEffect(() => {
    if (isOpen && mapRef.current && !mapInstanceRef.current) {
      // Cargar Leaflet dinámicamente
      const loadLeaflet = async () => {
        if (!window.L) {
          // Cargar CSS
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(cssLink);

          // Cargar JS
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = initializeMap;
          document.head.appendChild(script);
        } else {
          initializeMap();
        }
      };

      const initializeMap = () => {
        if (!mapRef.current || !window.L) return;

        // Buscar domicilio con coordenadas
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
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4"
      onClick={handleClickOutside}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[95vh] overflow-auto">
        {/* Header */}
        <div className="bg-purple-600 text-white p-3 sm:p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold">🚚 Pedido #{pedido.id}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-xl">
              ✕
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Información del Cliente - Compacta */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-blue-800">👤 Cliente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
              <p>
                <strong>Nombre:</strong> {pedido.cliente.nombre} {pedido.cliente.apellido}
              </p>
              <p>
                <strong>Teléfono:</strong> {pedido.cliente.telefono}
              </p>
              <p className="sm:col-span-2">
                <strong>Email:</strong> {pedido.cliente.email}
              </p>
            </div>
          </div>

          {/* Mapa y Dirección */}
          {pedido.cliente.domicilios.length > 0 && (
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-800">
                📍 Dirección de Entrega
              </h3>
              {/* Mapa compacto */}
              <div className="mt-3">
                <div
                  ref={mapRef}
                  className="h-32 sm:h-48 w-full rounded border"
                  style={{ zIndex: 1 }}
                />
              </div>
            </div>
          )}

          {/* Artículos a Entregar - Mobile Optimized */}
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-green-800">
              Artículos a Entregar
            </h3>
            {/* Artículos Individuales */}
            {articulosIndividuales.length > 0 && (
              <div className="space-y-2 mb-4">
                {articulosIndividuales.map((detalle, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-green-200">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm sm:text-base">
                          {detalle.articulo.denominacion}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">Individual</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs sm:text-sm font-bold">
                          Cantidad: {detalle.cantidad}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}{' '}
            {/* Promociones */}
            {Object.keys(promociones).length > 0 && (
              <div className="space-y-3">
                {Object.entries(promociones).map(([promocionId, articulosPromo]) => {
                  // Buscar el nombre de la promoción en detallesCompletos
                  const promocionInfo = pedido.detallesCompletos?.find(
                    (detalle) => detalle.promocionOrigenId?.toString() === promocionId
                  );

                  return (
                    <div
                      key={promocionId}
                      className="bg-purple-50 p-3 rounded border border-purple-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🎁</span>
                        <h4 className="font-semibold text-sm sm:text-base text-purple-800">
                          {promocionInfo?.articulo?.denominacion || `Promoción ${promocionId}`}
                        </h4>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">
                          🎉 Promoción
                        </span>
                      </div>

                      {/* Cantidad total de la promoción */}
                      <div className="mb-2">
                        <span className="bg-purple-200 text-purple-900 px-2 py-1 rounded text-xs sm:text-sm font-bold">
                          Cantidad: {articulosPromo[0]?.cantidad || 1}
                        </span>
                      </div>

                      {/* Artículos dentro de la promoción */}
                      <div className="ml-4 space-y-2">
                        {articulosPromo.map((articulo, idx) => (
                          <div key={idx} className="bg-white p-2 rounded border border-purple-100">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <p className="font-medium text-xs sm:text-sm">
                                  • {articulo.articulo.denominacion}
                                </p>
                              </div>
                              <span className="text-xs text-purple-600">x{articulo.cantidad}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total del Pedido */}
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border-2 border-yellow-200">
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-semibold text-yellow-800">
                Total del Pedido:
              </span>
              <span className="text-lg sm:text-xl font-bold text-yellow-900">
                {formatearPrecio(pedido.totalCalculado || pedido.total)}
              </span>
            </div>
          </div>

          {/* Botones de Acción - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              onClick={manejarEntrega}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
            >
              Marcar como Entregado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
