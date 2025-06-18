import { useState, useEffect, useContext } from 'react';
import { useCart } from '../../shared/hooks/useCart';
import { CarritoContext } from '../../shared/providers/CarritoProvider';
import { getAllFormaPagos, type FormaPago } from '../../shared/services/formaPagoService';
import { getAllTipoEnvios } from '../../shared/services/tipoEnvioService';
import { createPedido, type CreatePedidoRequest } from '../../shared/services/pedidoService';
import { crearPreferencia, abrirCheckoutMP } from '../../shared/services/mercadoPagoService';
import { useUser } from '../../shared/providers/UserProvider';
import MercadoPagoLoader from './components/MercadoPagoLoader';
import { InformacionUsuario } from './components/InformacionUsuario';
import { SeleccionDomicilio } from './components/SeleccionDomicilio';
import { FormularioEnvioYPago } from './components/FormularioEnvioYPago';
import { ProductSummary } from './ProductSummary';
import { useUsuarioCompleto } from './hooks/useUsuarioCompleto';
import {
  tieneItemsEnCarrito,
  calcularTiempoEstimadoMaximo,
  extraerDireccionDeUbicacion,
} from '../../shared/utils/pedidoUtils';
import { DEFAULT_VALUES, DOMICILIO_DEFAULT } from './constants/pedidoConstants';
import {
  formatearTiempoEstimado as formatearTiempo,
  calcularTiempoRestante,
} from '../HU17_Cocina/utils/tiempoUtils';

interface MetodoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

interface TipoEnvio {
  id: number;
  nombre: string;
}

const MetodoPagoModal: React.FC<MetodoPagoModalProps> = (props: MetodoPagoModalProps) => {
  const { isOpen, onClose, total } = props;
  const { carrito, promocionesEnCarrito, clearCarrito } = useCart();
  const carritoContext = useContext(CarritoContext);
  const { user } = useUser();

  // 🚀 Hook para obtener usuario completo con domicilios
  const { usuarioCompleto, loading: loadingUsuario, error: errorUsuario } = useUsuarioCompleto();

  // Estados principales
  const [tipoEnvioSeleccionado, setTipoEnvioSeleccionado] = useState<number | null>(null);
  const [tiposEnvio, setTiposEnvio] = useState<TipoEnvio[]>([]);
  const [loadingTiposEnvio, setLoadingTiposEnvio] = useState(false);
  const [metodoPagoId, setMetodoPagoId] = useState<number | null>(null);
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
  const [loadingFormasPago, setLoadingFormasPago] = useState(false);

  // 🏠 Estados para manejo de domicilios
  const [domicilioSeleccionado, setDomicilioSeleccionado] = useState<number | null>(null);
  const [ubicacionNueva, setUbicacionNueva] = useState<{
    lat: number;
    lng: number;
    direccion?: string;
  } | null>(null);
  // Estados de UI y proceso
  const [loading, setLoading] = useState(false);
  const [puedeComprar, setPuedeComprar] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [tiempoEstimado, setTiempoEstimado] = useState(0);
  const [horaEstimadaEntrega, setHoraEstimadaEntrega] = useState<string>('');
  const [procesandoMercadoPago, setProcesandoMercadoPago] = useState(false);

  if (!carritoContext) {
    throw new Error('MetodoPagoModal must be used within a CarritoProvider');
  }

  const { analizarCarrito } = carritoContext;

  // 🏠 **FUNCIONES DE DOMICILIO**
  const esTipoDelivery = (): boolean => {
    const tipo = tiposEnvio.find((t) => t.id === tipoEnvioSeleccionado);
    return tipo?.nombre === 'DELIVERY';
  };

  const manejarCambioDomicilio = (domicilioId: number | null) => {
    setDomicilioSeleccionado(domicilioId);
    // Si selecciona un domicilio existente, limpiar ubicación nueva
    if (domicilioId !== null) {
      setUbicacionNueva(null);
    }
  };

  const manejarUbicacionNueva = (lat: number, lng: number, direccion?: string) => {
    setUbicacionNueva({ lat, lng, direccion });
    // Si selecciona ubicación nueva, limpiar domicilio existente
    setDomicilioSeleccionado(null);
  };

  // Obtener cliente ID desde el contexto de usuario
  const obtenerClienteId = (): number => {
    return user?.id ?? DEFAULT_VALUES.CLIENTE_ID;
  };

  // Verificar si un tipo de envío es TAKE_AWAY para aplicar descuento
  const esTakeAway = (tipoId: number): boolean => {
    const tipo = tiposEnvio.find((t) => t.id === tipoId);
    return tipo?.nombre === 'TAKE_AWAY';
  };

  // Calcular total con descuento si es TAKE_AWAY
  const totalConDescuento = esTakeAway(tipoEnvioSeleccionado ?? 0)
    ? total * (1 - DEFAULT_VALUES.DESCUENTO_RETIRO)
    : total;

  // Función para procesar tiempo estimado desde el backend usando tiempoUtils
  const procesarTiempoEstimado = (
    horasEstimadas: string
  ): { minutos: number; horaEntrega: string } => {
    try {
      if (!horasEstimadas) {
        return {
          minutos: DEFAULT_VALUES.TIEMPO_ESTIMADO_DEFAULT,
          horaEntrega: '',
        };
      }

      // Usar las utilidades de tiempo del módulo de cocina
      const minutosRestantes = calcularTiempoRestante(horasEstimadas);
      const horaFormateada = formatearTiempo(horasEstimadas);

      return {
        minutos: Math.max(0, minutosRestantes), // No mostrar tiempo negativo
        horaEntrega: horaFormateada,
      };
    } catch (error) {
      console.error('Error al procesar tiempo estimado:', error);
      return {
        minutos: DEFAULT_VALUES.TIEMPO_ESTIMADO_DEFAULT,
        horaEntrega: '',
      };
    }
  };

  // Verificar si todos los campos están completos
  const camposCompletos = (): boolean => {
    const basicosCompletos =
      tipoEnvioSeleccionado !== null && metodoPagoId !== null && usuarioCompleto !== null; // Usuario debe estar cargado

    // Si es delivery, necesitamos también la ubicación (domicilio existente o nuevo)
    if (esTipoDelivery()) {
      const tieneUbicacion = domicilioSeleccionado !== null || ubicacionNueva !== null;
      return basicosCompletos && tieneUbicacion;
    }

    // Para TAKE_AWAY, solo necesitamos los datos básicos
    return basicosCompletos;
  }; // Cargar tipos de envío al abrir el modal
  useEffect(() => {
    const cargarTiposEnvio = async () => {
      // Siempre establecer fallback primero para garantizar que siempre haya opciones
      const tiposFallback = [
        { id: 1, nombre: 'DELIVERY' },
        { id: 2, nombre: 'TAKE_AWAY' },
      ];

      if (isOpen) {
        console.log('🔄 Iniciando carga de tipos de envío...');
        setLoadingTiposEnvio(true);

        try {
          const data = await getAllTipoEnvios();
          console.log('✅ Tipos de envío cargados desde API:', data);

          // Verificar que los datos sean válidos
          if (data && Array.isArray(data) && data.length > 0) {
            setTiposEnvio(data);
          } else {
            console.warn('⚠️ API devolvió datos inválidos, usando fallback');
            setTiposEnvio(tiposFallback);
          }
        } catch (error) {
          console.error('❌ Error cargando tipos de envío:', error);
          console.log('🔄 Usando tipos de envío de fallback:', tiposFallback);
          setTiposEnvio(tiposFallback);
        } finally {
          setLoadingTiposEnvio(false);
        }
      } else {
        // Cuando el modal se cierra, mantener al menos el fallback para evitar errores
        if (tiposEnvio.length === 0) {
          setTiposEnvio(tiposFallback);
        }
      }
    };

    cargarTiposEnvio();
  }, [isOpen, tiposEnvio.length]);

  // Cargar formas de pago al abrir el modal
  useEffect(() => {
    const cargarFormasPago = async () => {
      if (isOpen) {
        setLoadingFormasPago(true);
        try {
          const data = await getAllFormaPagos();
          setFormasPago(data);
          console.log('✅ Formas de pago cargadas:', data);
        } catch (error) {
          console.error('❌ Error cargando formas de pago:', error);
        } finally {
          setLoadingFormasPago(false);
        }
      }
    };

    cargarFormasPago();
  }, [isOpen]);

  // Verificar si se puede comprar al abrir el modal
  useEffect(() => {
    const verificarCompra = async () => {
      const tieneItems = tieneItemsEnCarrito(carrito, promocionesEnCarrito);

      if (isOpen && tieneItems) {
        try {
          const analisisResultado = await analizarCarrito();
          setPuedeComprar(analisisResultado?.sePuedeProducirCompleto ?? false);
        } catch (error) {
          console.error('❌ Error verificando capacidad de compra:', error);
          setPuedeComprar(false);
        }
      } else if (isOpen && !tieneItems) {
        setPuedeComprar(false);
      }
    };

    verificarCompra();
  }, [isOpen, carrito, promocionesEnCarrito, analizarCarrito]);

  // Manejar confirmación de compra
  const confirmarCompra = async () => {
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
      // 🏠 **PREPARAR DATOS DE DOMICILIO SEGÚN LA NUEVA LÓGICA**
      let domicilioData = {};

      if (esTipoDelivery()) {
        if (domicilioSeleccionado !== null) {
          // Caso 1: Domicilio existente seleccionado
          domicilioData = { domicilioExistenteId: domicilioSeleccionado };
        } else if (ubicacionNueva !== null) {
          // Caso 2: Nueva ubicación seleccionada
          domicilioData = {
            domicilio: {
              calle: extraerDireccionDeUbicacion(ubicacionNueva),
              numero: DOMICILIO_DEFAULT.NUMERO,
              cp: DOMICILIO_DEFAULT.CP,
              latitud: ubicacionNueva.lat,
              longitud: ubicacionNueva.lng,
              localidadId: DEFAULT_VALUES.LOCALIDAD_ID,
            },
          };
        }
      }

      // Preparar datos del pedido según el formato EXACTO requerido por el backend
      const pedidoData: CreatePedidoRequest = {
        clienteId: obtenerClienteId(),
        tipoEnvioId: tipoEnvioSeleccionado!,
        formaPagoId: metodoPagoId!,
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
        // Incluir datos de domicilio (existente o nuevo)
        ...domicilioData,
      };

      // 🚀 LOG para debugging
      console.log('=== DATOS DE PEDIDO PARA BACKEND ===');
      console.log(JSON.stringify(pedidoData, null, 2));
      console.log('=======================================');

      // Enviar pedido al backend
      const response = await createPedido(pedidoData);
      console.log('✅ Pedido creado exitosamente:', response);

      // Procesar tiempo estimado del backend usando las utilidades de tiempo
      if (response?.pedido?.horasEstimadaFinalizacion) {
        const { minutos, horaEntrega } = procesarTiempoEstimado(
          response.pedido.horasEstimadaFinalizacion
        );
        setTiempoEstimado(minutos);
        setHoraEstimadaEntrega(horaEntrega);
      } else {
        setTiempoEstimado(
          calcularTiempoEstimadoMaximo(carrito, DEFAULT_VALUES.TIEMPO_ESTIMADO_DEFAULT)
        );
        setHoraEstimadaEntrega('');
      }

      // Verificar si es pago con Mercado Pago
      const esMercadoPago =
        formasPago.find((f) => f.id === metodoPagoId)?.nombre === 'MERCADO_PAGO';

      if (esMercadoPago && response?.pedido?.id) {
        setProcesandoMercadoPago(true);
        try {
          const preferencia = await crearPreferencia(response.pedido.id);
          await abrirCheckoutMP(preferencia.initPoint);
        } catch (mpError) {
          console.error('❌ Error con Mercado Pago:', mpError);
          alert('Error al procesar el pago con Mercado Pago. El pedido fue creado correctamente.');
          setMostrarConfirmacion(true);
        } finally {
          setProcesandoMercadoPago(false);
        }
      } else {
        setMostrarConfirmacion(true);
      }
    } catch (error) {
      console.error('❌ Error en el proceso de compra:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(
        `Hubo un problema al procesar la compra: ${errorMessage}. Por favor, intenta nuevamente.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal y resetear estados
  const cerrarModal = () => {
    setTipoEnvioSeleccionado(null);
    setMetodoPagoId(null);
    setDomicilioSeleccionado(null);
    setUbicacionNueva(null);
    setMostrarConfirmacion(false);
    setTiempoEstimado(0);
    setHoraEstimadaEntrega('');
    onClose();
  };

  // Manejar clic fuera del modal para cerrarlo
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      cerrarModal();
    }
  };

  // Navegar al inicio - limpiar carrito
  const irAlInicio = () => {
    clearCarrito();
    cerrarModal();
    window.location.href = '/';
  };

  // Navegar al perfil - limpiar carrito
  const irAlPerfil = () => {
    clearCarrito();
    cerrarModal();
    window.location.href = '/perfil';
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

          {tiempoEstimado <= 0 ? (
            // Caso cuando el pedido está listo para retirar
            <>
              <p className="text-2xl font-bold text-green-600 mb-4">¡Su pedido está listo! ✅</p>
              <p className="text-lg text-gray-700 mb-4">Puede pasar a retirarlo cuando guste</p>
              {horaEstimadaEntrega && (
                <p className="text-lg text-gray-600 mb-4">
                  Hora estimada: <span className="font-semibold">{horaEstimadaEntrega}</span>
                </p>
              )}
            </>
          ) : (
            // Caso normal con tiempo de espera
            <>
              <p className="text-lg mb-2 text-gray-700">Su pedido estará listo en</p>
              <p className="text-4xl font-bold text-primary mb-2">{tiempoEstimado} minutos</p>
              {horaEstimadaEntrega && (
                <p className="text-lg text-gray-600 mb-4">
                  Aproximadamente a las <span className="font-semibold">{horaEstimadaEntrega}</span>
                </p>
              )}
            </>
          )}

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

  // Mostrar loading si el usuario está cargando
  if (loadingUsuario) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
        onClick={handleClickOutside}
      >
        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no se puede cargar el usuario
  if (errorUsuario || !usuarioCompleto) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
        onClick={handleClickOutside}
      >
        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar usuario</h2>
          <p className="text-gray-600 mb-4">
            {errorUsuario || 'No se pudieron cargar los datos del usuario'}
          </p>
          <button
            onClick={cerrarModal}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Cerrar
          </button>
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
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Finalizar compra</h2>
            <button
              onClick={cerrarModal}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          {/* Información del usuario */}
          <InformacionUsuario usuario={usuarioCompleto} /> {/* Resumen de productos */}
          <div className="mb-6">
            <ProductSummary
              productos={carrito.map((producto) => ({
                denominacion: producto.denominacion || 'Producto sin nombre',
                cantidad: producto.cantidad,
                precioVenta: producto.precioVenta || 0,
              }))}
              promociones={promocionesEnCarrito}
              total={total}
              descuento={
                esTakeAway(tipoEnvioSeleccionado ?? 0) ? total * DEFAULT_VALUES.DESCUENTO_RETIRO : 0
              }
              showDiscount={esTakeAway(tipoEnvioSeleccionado ?? 0)}
            />
          </div>
          {/* Formulario de envío y pago */}
          <FormularioEnvioYPago
            tiposEnvio={tiposEnvio}
            formasPago={formasPago}
            tipoEnvioSeleccionado={tipoEnvioSeleccionado}
            metodoPagoId={metodoPagoId}
            onTipoEnvioChange={setTipoEnvioSeleccionado}
            onMetodoPagoChange={setMetodoPagoId}
            loadingTiposEnvio={loadingTiposEnvio}
            loadingFormasPago={loadingFormasPago}
          />
          {/* Selección de domicilio (solo si es delivery) */}
          {esTipoDelivery() && usuarioCompleto.domicilios && (
            <SeleccionDomicilio
              domicilios={usuarioCompleto.domicilios}
              domicilioSeleccionado={domicilioSeleccionado}
              onDomicilioChange={manejarCambioDomicilio}
              ubicacionNueva={ubicacionNueva}
              onUbicacionNuevaChange={manejarUbicacionNueva}
              esTipoDelivery={esTipoDelivery()}
            />
          )}{' '}
          {/* Resumen y botón de confirmación */}
          <div className="mt-8 space-y-4">
            {/* Total y descuento */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  ${totalConDescuento.toFixed(2)}
                </span>
              </div>

              {esTakeAway(tipoEnvioSeleccionado ?? 0) && (
                <p className="text-sm text-green-600 mb-4">
                  ✅ Descuento del 10% aplicado por retiro en local
                </p>
              )}

              <button
                onClick={confirmarCompra}
                disabled={!camposCompletos() || !puedeComprar || loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                  camposCompletos() && puedeComprar && !loading
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  'Confirmar pedido'
                )}
              </button>

              {!camposCompletos() && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  Por favor, completa todos los campos requeridos
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loader de Mercado Pago */}
      <MercadoPagoLoader
        isVisible={procesandoMercadoPago}
        mensaje="Preparando tu pago con Mercado Pago..."
      />
    </div>
  );
};

export default MetodoPagoModal;
