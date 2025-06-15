import React, { useState, useEffect } from 'react';
import FacturaAdmin from './FacturaAdmin';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5252';

interface Pedido {
  id: number;
  cliente: {
    id: number;
    nombre: string;
    email: string;
  };
  total: number;
  estado: {
    nombre: string;
  };
  fechaPedido: string;
}

/**
 * Componente de demo para probar FacturaAdmin
 * Permite probar con pedidos reales del backend
 */
const FacturaAdminDemo: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<number | null>(null);

  // Cargar pedidos reales del backend
  const cargarPedidos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/pedidos`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Tomar solo los primeros 10 pedidos para el demo
      setPedidos(data.slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
            <path d="M6 8h8v2H6V8zm0 4h8v2H6v-2z" />
          </svg>
          Demo - Gestión de Facturas
        </h1>
        <p className="text-gray-600 mb-4">
          Prueba la funcionalidad de administración de facturas con pedidos reales del backend.
        </p>

        <div className="flex gap-3 mb-4">
          <button
            onClick={cargarPedidos}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Recargar Pedidos'}
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>Selecciona un pedido para probar la gestión de facturas</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de pedidos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Pedidos Disponibles ({pedidos.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando pedidos...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <p>No se encontraron pedidos</p>
              <p className="text-xs mt-1">Verifica que el backend esté funcionando</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    pedidoSeleccionado === pedido.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setPedidoSeleccionado(pedido.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">Pedido #{pedido.id}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        pedido.estado.nombre === 'PAGADO'
                          ? 'bg-green-100 text-green-800'
                          : pedido.estado.nombre === 'PENDIENTE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {pedido.estado.nombre}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Cliente:</strong> {pedido.cliente.nombre}
                    </p>
                    <p>
                      <strong>Email:</strong> {pedido.cliente.email}
                    </p>
                    <p>
                      <strong>Total:</strong> ${pedido.total}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {new Date(pedido.fechaPedido).toLocaleDateString()}
                    </p>
                  </div>

                  {pedidoSeleccionado === pedido.id && (
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      ← Seleccionado para prueba
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Componente de gestión de facturas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
              <path d="M6 8h8v2H6V8zm0 4h8v2H6v-2z" />
            </svg>
            Prueba de FacturaAdmin
          </h2>

          {pedidoSeleccionado ? (
            <div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Probando con Pedido #{pedidoSeleccionado}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  El componente buscará automáticamente si existe una factura para este pedido.
                </p>
              </div>

              <FacturaAdmin
                pedidoId={pedidoSeleccionado}
                mostrarSiempre={true}
                className="border-2 border-dashed border-purple-300"
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
              </svg>
              <p>Selecciona un pedido de la lista</p>
              <p className="text-xs mt-1">para probar la gestión de facturas</p>
            </div>
          )}
        </div>
      </div>

      {/* Instrucciones de prueba */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Instrucciones de Prueba
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">🔍 Para probar búsqueda de facturas:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Selecciona un pedido de la lista</li>
              <li>Haz clic en "Buscar Factura"</li>
              <li>Si el pedido tiene factura, se mostrará la información</li>
              <li>Si no tiene factura, aparecerá un mensaje informativo</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">📄 Para probar descarga y reenvío:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Una vez encontrada la factura, usa "Descargar PDF"</li>
              <li>Usa "Reenviar Email" para enviar nuevamente</li>
              <li>Los mensajes de éxito/error aparecerán abajo</li>
              <li>El PDF se descargará automáticamente</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>💡 Tip:</strong> Para crear facturas de prueba, usa Postman para hacer POST a
            <code className="bg-yellow-100 px-1 rounded">/api/pedidos</code> con datos válidos, o
            asegúrate de que los pedidos existentes tengan forma de pago configurada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacturaAdminDemo;
