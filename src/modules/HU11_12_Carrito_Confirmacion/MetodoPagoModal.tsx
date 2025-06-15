import React, { useState, useEffect, useContext } from 'react';
import { useCart } from '../../shared/hooks/useCart';
import { CarritoContext } from '../../shared/providers/CarritoProvider';
import type { AnalisisProduccionResponse } from '../../types/Articulo';
import MapaInteractivo from './MapaInteractivo';
import { RadioOption } from '../../shared/components/utils/RadioOption';
import { ContactForm } from './ContactForm';
import { ProductSummary } from './ProductSummary';
import { IconoLocation } from '../../assets/svgs/icons/IconoLocation';
import { getAllFormaPagos, type FormaPago } from '../../shared/services/formaPagoService';
import { createPedido, type CreatePedidoRequest } from '../../shared/services/pedidoService';
import {
  getIconoFormaPago,
  formatearNombreFormaPago,
  tieneItemsEnCarrito,
  calcularTiempoEstimadoMaximo,
  extraerDireccionDeUbicacion,
  combinarClases,
} from '../../shared/utils/pedidoUtils';
import {
  DEFAULT_VALUES,
  TIPO_ENVIO,
  DOMICILIO_DEFAULT,
  FORMAS_PAGO_FALLBACK,
  BUTTON_STYLES,
  ALERT_STYLES,
} from './constants/pedidoConstants';

interface MetodoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

const MetodoPagoModal: React.FC<MetodoPagoModalProps> = ({ isOpen, onClose, total }) => {
  const { carrito, promocionesEnCarrito, clearCarrito } = useCart();
  const carritoContext = useContext(CarritoContext);

  // Estados
  const [modaloEntrega, setModoEntrega] = useState<'retiro' | 'domicilio' | ''>('');
  const [metodoPagoId, setMetodoPagoId] = useState<number | null>(null); // 🚀 Cambiado a ID numérico
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]); // 🚀 Estado para formas de pago
  const [loadingFormasPago, setLoadingFormasPago] = useState(false);
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
  const totalConDescuento =
    modaloEntrega === 'retiro' ? total * (1 - DEFAULT_VALUES.DESCUENTO_RETIRO) : total;

  // Calcular tiempo estimado máximo de los productos manufacturados
  const calcularTiempoEstimado = (): number => {
    return calcularTiempoEstimadoMaximo(carrito, DEFAULT_VALUES.TIEMPO_ESTIMADO_DEFAULT);
  };
  // Cargar formas de pago al abrir el modal
  useEffect(() => {
    const cargarFormasPago = async () => {
      if (isOpen) {
        setLoadingFormasPago(true);
        try {
          const formas = await getAllFormaPagos();
          setFormasPago(formas);
        } catch (error) {
          console.error('Error al cargar formas de pago:', error);
          // Fallback a formas de pago por defecto
          setFormasPago([...FORMAS_PAGO_FALLBACK]);
        } finally {
          setLoadingFormasPago(false);
        }
      }
    };

    cargarFormasPago();
  }, [isOpen]); // Verificar si se puede comprar al abrir el modal
  useEffect(() => {
    const verificarCompra = async () => {
      // Verificar si hay items (productos o promociones) en el carrito
      const tieneItems = tieneItemsEnCarrito(carrito, promocionesEnCarrito);

      if (isOpen && tieneItems) {
        try {
          const resultado = await analizarCarrito();
          setAnalisisProduccion(resultado);
          setPuedeComprar(resultado?.sePuedeProducirCompleto ?? false);
          setTiempoEstimado(calcularTiempoEstimado());
        } catch (error) {
          console.error('Error al analizar carrito:', error);
          setPuedeComprar(false);
        }
      } else if (isOpen && !tieneItems) {
        // Si no hay items, no se puede comprar
        setPuedeComprar(false);
        setAnalisisProduccion(null);
      }
    };

    verificarCompra();
  }, [isOpen, carrito, promocionesEnCarrito, analizarCarrito]);
  // Verificar si todos los campos están completos
  const camposCompletos = (): boolean => {
    const basicosCompletos = modaloEntrega !== '' && telefono.trim() !== '' && email.trim() !== '';

    if (modaloEntrega === 'domicilio') {
      return (
        basicosCompletos && ubicacionSeleccionada && metodoPagoId !== null && ubicacionInfo !== null
      );
    }

    // Para retiro en tienda, solo necesitamos los datos básicos
    return basicosCompletos;
  };

  // Manejar selección de ubicación en el mapa
  const manejarSeleccionUbicacion = (lat: number, lng: number, direccion?: string) => {
    setUbicacionInfo({ lat, lng, direccion });
    setUbicacionSeleccionada(true);
  }; // Manejar confirmación de compra
  const confirmarCompra = async () => {
    // Verificar que tengamos items en el carrito (productos o promociones)
    const tieneItems = tieneItemsEnCarrito(carrito, promocionesEnCarrito);

    if (!camposCompletos() || !puedeComprar || !tieneItems) {
      console.log('❌ No se puede confirmar compra:', {
        camposCompletos: camposCompletos(),
        puedeComprar,
        tieneItems,
        carrito: carrito.length,
        promociones: promocionesEnCarrito.length,
      });
      return;
    }

    setLoading(true);

    try {
      // Preparar datos del pedido según el formato EXACTO requerido por el backend
      const pedidoData: CreatePedidoRequest = {
        clienteId: DEFAULT_VALUES.CLIENTE_ID,
        tipoEnvioId: modaloEntrega === 'retiro' ? TIPO_ENVIO.RETIRO : TIPO_ENVIO.DOMICILIO,
        formaPagoId: metodoPagoId || 1, // ID de la forma de pago seleccionada
        sucursalId: DEFAULT_VALUES.SUCURSAL_ID,
        detalles: carrito.map((producto) => ({
          cantidad: producto.cantidad,
          articuloId: producto.id || 0,
        })),
        // Solo incluir promociones SI hay promociones en el carrito
        ...(promocionesEnCarrito.length > 0 && {
          promocionesSeleccionadas: promocionesEnCarrito.map((promo) => ({
            promocionId: promo.promocion.id || 0,
            cantidad: promo.cantidad,
          })),
        }),
        // Solo incluir domicilio SI es envío a domicilio Y tenemos ubicación
        ...(modaloEntrega === 'domicilio' &&
          ubicacionInfo && {
            domicilio: {
              calle: extraerDireccionDeUbicacion(ubicacionInfo),
              numero: DOMICILIO_DEFAULT.NUMERO,
              cp: DOMICILIO_DEFAULT.CP,
              latitud: ubicacionInfo.lat,
              longitud: ubicacionInfo.lng,
              localidadId: DEFAULT_VALUES.LOCALIDAD_ID,
            },
          }),
      };

      // 🚀 LOG para debugging
      console.log('=== DATOS DE PEDIDO PARA BACKEND ===');
      console.log(JSON.stringify(pedidoData, null, 2));
      console.log('=======================================');

      // Enviar pedido al backend
      const response = await createPedido(pedidoData);
      console.log('✅ Pedido creado exitosamente:', response);

      // Mostrar confirmación
      setMostrarConfirmacion(true);
    } catch (error) {
      console.error('❌ Error en el proceso de compra:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(
        `Hubo un problema al procesar la compra: ${errorMessage}. Por favor, intenta nuevamente.`
      );
    } finally {
      setLoading(false);
    }
  }; // Cerrar modal y resetear estados
  const cerrarModal = () => {
    setModoEntrega('');
    setMetodoPagoId(null);
    setTelefono('');
    setEmail('');
    setUbicacionSeleccionada(false);
    setUbicacionInfo(null);
    setMostrarConfirmacion(false);
    onClose();
  };

  // Manejar clic fuera del modal para cerrarlo
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      cerrarModal();
    }
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
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
        onClick={handleClickOutside}
      >
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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={handleClickOutside}
    >
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
              <RadioOption
                name="entrega"
                value="retiro"
                checked={modaloEntrega === 'retiro'}
                onChange={(value) => setModoEntrega(value as 'retiro')}
              >
                Retiro en tienda (10% Descuento)
              </RadioOption>
              <RadioOption
                name="entrega"
                value="domicilio"
                checked={modaloEntrega === 'domicilio'}
                onChange={(value) => setModoEntrega(value as 'domicilio')}
              >
                Envío a domicilio
              </RadioOption>
            </div>
          </div>{' '}
          {/* Layout condicional según el tipo de entrega */}
          {modaloEntrega === 'retiro' ? (
            // Layout para RETIRO EN TIENDA - Contacto a la izquierda, Resumen a la derecha
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContactForm
                telefono={telefono}
                email={email}
                onTelefonoChange={setTelefono}
                onEmailChange={setEmail}
              />{' '}
              <ProductSummary
                productos={carrito}
                promociones={promocionesEnCarrito}
                total={total}
                descuento={total * DEFAULT_VALUES.DESCUENTO_RETIRO}
                showDiscount={true}
              />
            </div>
          ) : modaloEntrega === 'domicilio' ? (
            // Layout para ENVÍO A DOMICILIO - Mapa a la izquierda, Contacto y resumen a la derecha
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda - Mapa y método de pago */}
              <div>
                <div className="mb-6">
                  <h3 className="text-lg flex gap-2 font-semibold mb-3">
                    <IconoLocation /> Selecciona tu ubicación
                  </h3>{' '}
                  <MapaInteractivo
                    onUbicacionSeleccionada={manejarSeleccionUbicacion}
                    ubicacionActual={ubicacionInfo}
                  />
                  {ubicacionSeleccionada && ubicacionInfo ? (
                    <div className={combinarClases(ALERT_STYLES.base, ALERT_STYLES.success)}>
                      <p className="text-sm font-medium">✅ Ubicación seleccionada</p>
                      {ubicacionInfo.direccion && (
                        <p className="text-xs mt-1">{ubicacionInfo.direccion}</p>
                      )}
                    </div>
                  ) : (
                    <div className={combinarClases(ALERT_STYLES.base, ALERT_STYLES.warning)}>
                      <p className="text-sm font-medium">
                        📍 Selecciona tu ubicación en el mapa para continuar
                      </p>
                    </div>
                  )}
                  <div className="mt-4">
                    <h4 className="text-md font-semibold mb-3">💳 Método de pago</h4>
                    {loadingFormasPago ? (
                      <div className="space-y-2">
                        <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
                        <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formasPago.map((forma) => (
                          <RadioOption
                            key={forma.id}
                            name="metodoPago"
                            value={forma.id.toString()}
                            checked={metodoPagoId === forma.id}
                            onChange={(value) => setMetodoPagoId(parseInt(value))}
                            className="w-4 h-4"
                          >
                            {getIconoFormaPago(forma.nombre)}{' '}
                            {formatearNombreFormaPago(forma.nombre)}
                          </RadioOption>
                        ))}
                      </div>
                    )}
                    {modaloEntrega === 'domicilio' && metodoPagoId === null && (
                      <div className={combinarClases(ALERT_STYLES.base, ALERT_STYLES.warning)}>
                        <p className="text-sm font-medium">
                          💳 Selecciona un método de pago para continuar
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna derecha - Datos de contacto y resumen */}
              <div>
                <ContactForm
                  telefono={telefono}
                  email={email}
                  onTelefonoChange={setTelefono}
                  onEmailChange={setEmail}
                />
                <ProductSummary
                  productos={carrito}
                  promociones={promocionesEnCarrito}
                  total={totalConDescuento}
                />
              </div>
            </div>
          ) : (
            // Mensaje cuando no se ha seleccionado ninguna opción
            <div className="text-center py-8">
              <p className="text-primary font-semibold text-lg">
                👆 Selecciona un método de entrega para continuar
              </p>
            </div>
          )}
          {/* Mensaje de estado de análisis - Común para ambos layouts */}
          {!puedeComprar && analisisProduccion && (
            <div className={combinarClases(ALERT_STYLES.base, ALERT_STYLES.error)}>
              <p className="font-medium">⚠️ No se puede completar la compra</p>
              <p className="text-sm">
                Hay limitaciones de stock. Ajusta las cantidades en el carrito.
              </p>
            </div>
          )}
          {/* Botones de acción */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={cerrarModal}
              disabled={loading}
              className={combinarClases(
                BUTTON_STYLES.base,
                BUTTON_STYLES.secondary,
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              Cancelar
            </button>
            <button
              onClick={confirmarCompra}
              disabled={!camposCompletos() || !puedeComprar || loading}
              className={combinarClases(
                BUTTON_STYLES.base,
                camposCompletos() && puedeComprar && !loading
                  ? BUTTON_STYLES.primary
                  : BUTTON_STYLES.disabled
              )}
              title={
                !camposCompletos()
                  ? 'Complete todos los campos requeridos'
                  : !puedeComprar
                    ? 'Ajuste las cantidades antes de continuar o el carrito está vacío'
                    : undefined
              }
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
