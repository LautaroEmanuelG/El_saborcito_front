import React, { useState, useEffect, useContext } from 'react';
import { useCart } from '../../../shared/hooks/useCart';
import { CarritoContext } from '../../../shared/providers/CarritoProvider';
import type { AnalisisProduccionResponse, ArticuloManufacturado } from '../../../types/Articulo';
import MapaInteractivo from './MapaInteractivo';

interface MetodoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

const MetodoPagoModal: React.FC<MetodoPagoModalProps> = ({ isOpen, onClose, total }) => {
  const { carrito, clearCarrito } = useCart();
  const carritoContext = useContext(CarritoContext);

  // Estados
  const [modaloEntrega, setModoEntrega] = useState<'retiro' | 'domicilio' | ''>('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'mercadopago' | ''>(''); // 🚀 Nuevo estado
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(false);
  const [ubicacionInfo, setUbicacionInfo] = useState<{
    lat: number;
    lng: number;
    direccion?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [puedeComprar, setPuedeComprar] = useState(false);
  const [analisisProduccion, setAnalisisProduccion] = useState<AnalisisProduccionResponse | null>(
    null
  );
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [tiempoEstimado, setTiempoEstimado] = useState(0);

  if (!carritoContext) {
    throw new Error('MetodoPagoModal must be used within a CarritoProvider');
  }

  const { analizarCarrito } = carritoContext;

  // Calcular total con descuento si es retiro en tienda
  const totalConDescuento = modaloEntrega === 'retiro' ? total * 0.9 : total;

  // Función para determinar si un artículo es manufacturado
  const isArticuloManufacturado = (articulo: any): articulo is ArticuloManufacturado => {
    return 'categoriaId' in articulo && 'descripcion' in articulo;
  };

  // Calcular tiempo estimado máximo de los productos manufacturados
  const calcularTiempoEstimado = (): number => {
    const productosManufacturados = carrito.filter((item) => isArticuloManufacturado(item));
    if (productosManufacturados.length === 0) return 45; // Default 45 minutos si no hay manufacturados

    const tiemposEstimados = productosManufacturados.map(
      (producto) => (producto as ArticuloManufacturado).tiempoEstimadoMinutos || 45
    );

    return Math.max(...tiemposEstimados);
  };

  // Verificar si se puede comprar al abrir el modal
  useEffect(() => {
    const verificarCompra = async () => {
      if (isOpen && carrito.length > 0) {
        try {
          const resultado = await analizarCarrito();
          setAnalisisProduccion(resultado);
          setPuedeComprar(resultado?.sePuedeProducirCompleto ?? false);
          setTiempoEstimado(calcularTiempoEstimado());
        } catch (error) {
          console.error('Error al analizar carrito:', error);
          setPuedeComprar(false);
        }
      }
    };

    verificarCompra();
  }, [isOpen, carrito, analizarCarrito]);

  // Verificar si todos los campos están completos
  const camposCompletos = (): boolean => {
    const basicosCompletos = modaloEntrega !== '' && telefono.trim() !== '' && email.trim() !== '';

    if (modaloEntrega === 'domicilio') {
      return basicosCompletos && ubicacionSeleccionada && metodoPago !== '';
    }

    return basicosCompletos;
  };

  // Manejar selección de ubicación en el mapa
  const manejarSeleccionUbicacion = (lat: number, lng: number, direccion?: string) => {
    setUbicacionInfo({ lat, lng, direccion });
    setUbicacionSeleccionada(true);
  };

  // Manejar confirmación de compra
  const confirmarCompra = async () => {
    if (!camposCompletos() || !puedeComprar) return;

    setLoading(true);

    try {
      // NO realizamos análisis aquí, se hizo en VistaCarrito

      // Preparar datos para enviar al backend
      const datosCompra = {
        // Información del pedido
        productos: carrito.map((producto) => ({
          id: producto.id,
          denominacion: producto.denominacion,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioVenta,
          subtotal: producto.precioVenta * producto.cantidad,
          esManufacturado: isArticuloManufacturado(producto),
          ...(isArticuloManufacturado(producto) && {
            tiempoEstimadoMinutos: (producto as ArticuloManufacturado).tiempoEstimadoMinutos,
          }),
        })),

        // Información de precios
        subtotal: total,
        descuento: modaloEntrega === 'retiro' ? total * 0.1 : 0,
        total: totalConDescuento,

        // Información de entrega
        tipoEntrega: modaloEntrega,
        ...(modaloEntrega === 'domicilio' && {
          metodoPago,
          ...(ubicacionInfo && {
            ubicacionEntrega: {
              latitud: ubicacionInfo.lat,
              longitud: ubicacionInfo.lng,
              direccion:
                ubicacionInfo.direccion ||
                `${ubicacionInfo.lat.toFixed(6)}, ${ubicacionInfo.lng.toFixed(6)}`,
            },
          }),
        }),

        // Información de contacto
        telefono,
        email,

        // Información adicional
        tiempoEstimadoTotal: tiempoEstimado,
        fechaHoraPedido: new Date().toISOString(),
        analisisProduccion: analisisProduccion,
      };

      // 🚀 CONSOLE.LOG DE LOS DATOS QUE SE ENVIARÁN AL BACKEND
      console.log('=== DATOS DE COMPRA PARA BACKEND ===');
      console.log(JSON.stringify(datosCompra, null, 2));
      console.log('=======================================');

      // Simular procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // NO limpiar carrito aquí, se hará en el modal de confirmación
      setMostrarConfirmacion(true);
    } catch (error) {
      console.error('Error en el proceso de compra:', error);
      alert('Hubo un problema al procesar la compra. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal y resetear estados
  const cerrarModal = () => {
    setModoEntrega('');
    setMetodoPago('');
    setTelefono('');
    setEmail('');
    setUbicacionSeleccionada(false);
    setUbicacionInfo(null);
    setMostrarConfirmacion(false);
    onClose();
  };

  // Navegar al inicio - AHORA limpia el carrito
  const irAlInicio = () => {
    clearCarrito(); // 🚀 Limpiar carrito al confirmar
    cerrarModal();
    window.location.href = '/';
  };

  // Navegar al perfil - AHORA limpia el carrito
  const irAlPerfil = () => {
    clearCarrito(); // 🚀 Limpiar carrito al confirmar
    cerrarModal();
    console.log('Navegando al perfil del usuario...');
    alert('La pantalla de perfil aún no está implementada. Redirigiendo al inicio...');
    window.location.href = '/';
  };

  if (!isOpen) return null;

  // Modal de confirmación de compra exitosa
  if (mostrarConfirmacion) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">¡Gracias por su compra! 🎉</h2>
          <p className="text-lg mb-2 text-gray-700">Su pedido estará listo en</p>
          <p className="text-4xl font-bold text-primary mb-4">{tiempoEstimado} minutos</p>
          <p className="text-gray-600 mb-6">Te llegará un aviso</p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={irAlInicio}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={irAlPerfil}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Ir a mi perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Elegir Retiro 📍</h2>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">${totalConDescuento.toFixed(2)}</p>
            {modaloEntrega === 'retiro' && (
              <p className="text-sm text-green-600">10% Descuento aplicado</p>
            )}
          </div>
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            onClick={cerrarModal}
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Opciones de entrega */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center text-lg cursor-pointer">
                <input
                  type="radio"
                  name="entrega"
                  value="retiro"
                  checked={modaloEntrega === 'retiro'}
                  onChange={(e) => setModoEntrega(e.target.value as 'retiro')}
                  className="mr-3 w-5 h-5"
                />
                <span className="flex items-center gap-2">Retiro en tienda (10% Descuento)</span>
              </label>

              <label className="flex items-center text-lg cursor-pointer">
                <input
                  type="radio"
                  name="entrega"
                  value="domicilio"
                  checked={modaloEntrega === 'domicilio'}
                  onChange={(e) => setModoEntrega(e.target.value as 'domicilio')}
                  className="mr-3 w-5 h-5"
                />
                <span className="flex items-center gap-2">Envío a domicilio</span>
              </label>
            </div>
          </div>{' '}
          {/* Layout condicional según el tipo de entrega */}
          {modaloEntrega === 'retiro' ? (
            // Layout para RETIRO EN TIENDA - Contacto a la izquierda, Resumen a la derecha
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda - Datos de contacto */}
              <div>
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold">Datos de contacto</h3>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Teléfono <b className="text-primary font-bold">*</b>
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ingresa tu teléfono"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <b className="text-primary font-bold">*</b>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ingresa tu email"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Columna derecha - Resumen de productos */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Resumen de productos</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {carrito.map((producto, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{producto.denominacion}</p>
                        <p className="text-xs text-gray-600">Cantidad: {producto.cantidad}</p>
                      </div>
                      <p className="font-semibold text-sm">
                        ${(producto.precioVenta * producto.cantidad).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <div className="text-right">
                      {modaloEntrega === 'retiro' && (
                        <p className="text-sm text-gray-500 line-through">${total.toFixed(2)}</p>
                      )}
                      <p className="text-xl font-bold text-primary">
                        ${totalConDescuento.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mensaje de estado de análisis */}
                {!puedeComprar && analisisProduccion && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">⚠️ No se puede completar la compra</p>
                    <p className="text-red-600 text-sm">
                      Hay limitaciones de stock. Ajusta las cantidades en el carrito.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : modaloEntrega === 'domicilio' ? (
            // Layout para ENVÍO A DOMICILIO - Mapa a la izquierda, Contacto y resumen a la derecha
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda - Mapa y método de pago */}
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Selecciona tu ubicación</h3>
                  <MapaInteractivo
                    onUbicacionSeleccionada={manejarSeleccionUbicacion}
                    ubicacionActual={ubicacionInfo}
                  />
                  {ubicacionSeleccionada && ubicacionInfo && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">
                        ✅ Ubicación seleccionada
                      </p>
                      {ubicacionInfo.direccion && (
                        <p className="text-xs text-green-600 mt-1">{ubicacionInfo.direccion}</p>
                      )}
                    </div>
                  )}

                  {/* Método de pago para envío a domicilio */}
                  <div className="mt-4">
                    <h4 className="text-md font-semibold mb-3">Método de pago</h4>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="metodoPago"
                          value="efectivo"
                          checked={metodoPago === 'efectivo'}
                          onChange={(e) => setMetodoPago(e.target.value as 'efectivo')}
                          className="mr-3 w-4 h-4"
                        />
                        <span>💵 Efectivo</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="metodoPago"
                          value="mercadopago"
                          checked={metodoPago === 'mercadopago'}
                          onChange={(e) => setMetodoPago(e.target.value as 'mercadopago')}
                          className="mr-3 w-4 h-4"
                        />
                        <span>💳 Mercado Pago</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Datos de contacto y resumen */}
              <div>
                {/* Inputs de contacto */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold">Datos de contacto</h3>
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono *</label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ingresa tu teléfono"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ingresa tu email"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Resumen de productos */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Resumen de productos</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {carrito.map((producto, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{producto.denominacion}</p>
                          <p className="text-xs text-gray-600">Cantidad: {producto.cantidad}</p>
                        </div>
                        <p className="font-semibold text-sm">
                          ${(producto.precioVenta * producto.cantidad).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          ${totalConDescuento.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mensaje de estado de análisis */}
                  {!puedeComprar && analisisProduccion && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-medium">⚠️ No se puede completar la compra</p>
                      <p className="text-red-600 text-sm">
                        Hay limitaciones de stock. Ajusta las cantidades en el carrito.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Mensaje cuando no se ha seleccionado ninguna opción
            <div className="text-center py-8">
              <p className="text-primary font-semibold text-lg">
                Selecciona un método de entrega para continuar
              </p>
            </div>
          )}
          {/* Botón de pagar */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={confirmarCompra}
              disabled={!camposCompletos() || !puedeComprar || loading}
              className={`px-8 py-3 rounded-lg font-semibold text-lg ${
                camposCompletos() && puedeComprar && !loading
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              {loading ? 'Procesando...' : 'Pagar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetodoPagoModal;
