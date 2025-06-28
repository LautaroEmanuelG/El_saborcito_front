import { useState, useContext } from 'react';
import { Header } from '../../app/views/user/header/Header';
import { IconoLocation } from '../../assets/svgs/icons/IconoLocation';
import { useCart } from '../../shared/hooks/useCart';
import { CarritoContext } from '../../shared/providers/CarritoProvider';
import type { ArticuloManufacturado } from '../../types/Articulo';
import MetodoPagoModal from './MetodoPagoModal';
import { LoginModal } from '../HU1_2_Registro_Login/components/loggin/LoginModal';
import { RegistroModal } from '../HU1_2_Registro_Login/components/registro/RegistroModal';
import BtnCantidadProducto from '../HU9_10_Landing_Busqueda/articulos/btnCantidadProducto';
import BtnCantidadPromocion from './BtnCantidadPromocion';
import { useUser } from '../../shared/providers/UserProvider';
import { useNotificacion } from '../../shared/hooks/useNotificacion';

export const VistaCarrito = () => {
  const { carrito, promocionesEnCarrito, removeFromCart, removePromocionFromCart } = useCart();
  const [isMetodoPagoOpen, setMetodoPagoOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegistroModalOpen, setRegistroModalOpen] = useState(false);

  const carritoContext = useContext(CarritoContext);
  if (!carritoContext) {
    throw new Error('VistaCarrito must be used within a CarritoProvider');
  }

  const {
    analizarCarritoParaCompra,
    limitacionesProduccion,
    promocionesProblematicas,
    isAnalyzing,
  } = carritoContext;

  const { user } = useUser();
  const { mostrarNotificacion } = useNotificacion();

  // Combinar productos y promociones para mostrar
  const todosLosItems = [
    ...carrito.map((item) => ({ ...item, tipo: 'producto' as const })),
    ...promocionesEnCarrito.map((item) => ({
      ...item.promocion,
      cantidad: item.cantidad,
      tipo: 'promocion' as const,
    })),
  ];

  // � **NOTA: El análisis automático del carrito se maneja en CarritoProvider**
  // No necesitamos hacer análisis adicional aquí para evitar bucles infinitos

  // Función para determinar si un artículo es manufacturado
  const isArticuloManufacturado = (articulo: any): articulo is ArticuloManufacturado => {
    return 'categoriaId' in articulo && 'descripcion' in articulo;
  };

  // Función para determinar si un artículo es insumo
  const isArticuloInsumo = (articulo: any): boolean => {
    return 'stockActual' in articulo && 'esParaElaborar' in articulo;
  };

  // 🚀 **FUNCIÓN OPTIMIZADA PARA MANEJAR COMPRA**
  const handleComprarClick = async () => {
    // No permitir compra si se está analizando
    if (isAnalyzing) {
      return;
    }

    // 🔐 **VALIDAR AUTENTICACIÓN DEL USUARIO**
    if (!user) {
      mostrarNotificacion('Debes iniciar sesión para realizar una compra', 'warning', 4000);
      setLoginModalOpen(true);
      return;
    }

    // Realizar análisis final antes de abrir el modal (SIN SIMULACIÓN +1)
    const analisisFinal = await analizarCarritoParaCompra();

    if (!analisisFinal?.sePuedeProducirCompleto) {
      // Crear mensaje detallado basado en los problemas encontrados
      let mensajeDetallado =
        '❌ No se puede completar la compra debido a las siguientes limitaciones:\n\n';

      if (analisisFinal?.productosConProblemas && analisisFinal.productosConProblemas.length > 0) {
        analisisFinal.productosConProblemas.forEach((problema: any) => {
          mensajeDetallado += `• ${problema.denominacion || 'Producto'}: ${problema.motivoProblema}\n`;
        });
      }

      if (analisisFinal?.insumosInsuficientes && analisisFinal.insumosInsuficientes.length > 0) {
        mensajeDetallado += '\nInsumos insuficientes:\n';
        analisisFinal.insumosInsuficientes.forEach((insumo: any) => {
          mensajeDetallado += `• ${insumo.denominacion}: necesario ${insumo.cantidadNecesaria}, disponible ${insumo.stockDisponible}\n`;
        });
      }

      mensajeDetallado += '\nPor favor, ajuste las cantidades en su carrito.';

      alert(mensajeDetallado);
      return;
    }

    setMetodoPagoOpen(true);
  };

  // 🚀 **FUNCIÓN OPTIMIZADA PARA MENSAJES DE LIMITACIÓN (SOLO PROBLEMAS REALES)**
  const getMensajeLimitacion = (item: any) => {
    // Solo mostrar mensajes para items que REALMENTE están en el carrito
    if (item.tipo === 'promocion') {
      const esProblematica = promocionesProblematicas.has(item.id);

      // Solo mostrar mensaje si la promoción está realmente problemática
      if (esProblematica) {
        // return '⚠️ Esta promoción contiene productos con limitaciones de stock';
        return null;
      }
      return null;
    }

    // Para productos individuales
    if (!item.id) return null;

    const articuloIdStr = item.id.toString();
    const limitacionMaxima = limitacionesProduccion[articuloIdStr];
    const cantidadEnCarrito = item.cantidad;

    // Solo mostrar mensaje si la cantidad actual EXCEDE realmente la limitación
    if (!limitacionMaxima || cantidadEnCarrito <= limitacionMaxima) {
      return null;
    }

    // Diferentes mensajes según el tipo de artículo
    if (isArticuloInsumo(item)) {
      return `⚠️ Stock limitado: máximo ${limitacionMaxima} unidades disponibles (cantidad actual: ${cantidadEnCarrito})`;
    } else if (isArticuloManufacturado(item)) {
      return `⚠️ Limitación de producción: máximo ${limitacionMaxima} unidades (cantidad actual: ${cantidadEnCarrito})`;
    }

    return `⚠️ Cantidad limitada a ${limitacionMaxima} unidades (cantidad actual: ${cantidadEnCarrito})`;
  }; // Función para obtener el precio de un item
  const getPrecioItem = (item: any): number => {
    if (item.tipo === 'promocion') {
      return item.precioPromocional || item.precioVenta || 0;
    }
    return item.precioVenta || 0;
  };

  // Función para manejar eliminación según el tipo
  const handleEliminarItem = (item: any) => {
    if (item.tipo === 'promocion') {
      removePromocionFromCart(item.id);
    } else {
      removeFromCart(item);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-300">
        <Header onSearch={undefined} />
        {/* Contenido del carrito */}
        <div className="container min-h-full mx-auto px-6 py-12 flex gap-4 flex-col md:flex-row">
          {/* Productos */}
          <div className="bg-blanco min-h-full p-4 rounded-xl shadow-lg shadow-gray-300 w-full mr-4 flex flex-col justify-between">
            {' '}
            <div>
              <h2 className="text-3xl font-bold mb-4">Carrito</h2>
              {todosLosItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-500">Tu carrito está vacío</p>
                </div>
              ) : (
                todosLosItems.map((item, index) => (
                  <div
                    key={`${item.tipo}-${item.id}-${index}`}
                    className="flex items-center justify-between border-t border-gray-300 py-4"
                  >
                    <div className="flex gap-6">
                      {/* Imagen del item */}
                      <picture className="hidden md:block w-40 h-auto object-cover rounded-lg">
                        <source type="image/webp" />
                        <img
                          src={
                            item.imagen?.url ||
                            (Array.isArray(item.imagen) && item.imagen.length > 0
                              ? item.imagen[0]
                              : '/img/Default.png')
                          }
                          alt={item.denominacion}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </picture>
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <h3 className="text-md md:text-xl font-semibold">{item.denominacion}</h3>
                          {item.tipo === 'promocion' && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              🎁 PROMO
                            </span>
                          )}
                        </div>
                        {getMensajeLimitacion(item) && (
                          <p className="text-sm text-orange-600 font-medium mt-1">
                            {getMensajeLimitacion(item)}
                          </p>
                        )}
                        <button
                          className="text-lg md:text-xl text-primary hover:underline"
                          onClick={() => handleEliminarItem(item)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>{' '}
                    <div className="flex items-center">
                      {item.tipo === 'producto' ? (
                        <BtnCantidadProducto
                          articulo={item}
                          cantidadProducto={item.cantidad}
                          setCantidadProducto={() => {
                            /* No se usa en vista carrito */
                          }}
                        />
                      ) : (
                        <BtnCantidadPromocion promocion={item} cantidadPromocion={item.cantidad} />
                      )}
                      <p className="ml-6 sm:text-xl font-semibold flex justify-end">
                        ${(getPrecioItem(item) * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Barra de Envío: Retiro en Local */}
            <div className="flex justify-between items-center py-2 text-primary mt-4">
              <span className="font-semibold text-black text-lg md:text-xl ">Envío</span>
              <div className="flex items-center w-full ml-4">
                <span className="mr-2 text-lg md:text-xl  text-primary">Retiro en Local</span>
                <div className="border-t-4 border-primary flex-grow mx-2"></div>
                <IconoLocation />
              </div>
            </div>
          </div>

          {/* Resumen de compra */}
          <div className="bg-blanco p-4 rounded-xl shadow-lg shadow-gray-300 max-w-80 min-h-96 flex flex-col">
            <h3 className="text-xl md:text-2xl font-semibold">Resumen Compra</h3>{' '}
            <div className="flex-grow">
              <div className="flex justify-between mt-2 text-lg sm:text-xl">
                <span className="text-nowrap">
                  Items ({todosLosItems.reduce((total, item) => total + item.cantidad, 0)})
                </span>
                <span className="pl-4 text-negro font-bold">
                  $
                  {todosLosItems
                    .reduce((total, item) => total + getPrecioItem(item) * item.cantidad, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mt-2 text-lg sm:text-xl">
                <span>Envío</span>
                <span className="text-primary">Gratis</span>
              </div>
            </div>
            <div className="flex justify-between mt-auto text-xl sm:text-2xl font-bold">
              <span>Total</span>
              <span>
                $
                {todosLosItems
                  .reduce((total, item) => total + getPrecioItem(item) * item.cantidad, 0)
                  .toFixed(2)}
              </span>
            </div>
            {/* Condicional para mostrar el botón Comprar */}
            {todosLosItems.length > 0 && (
              <button
                onClick={handleComprarClick}
                disabled={isAnalyzing}
                className={`mt-4 w-full py-2 text-lg md:text-xl font-semibold rounded-lg text-center ${
                  isAnalyzing
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
                title={isAnalyzing ? 'Analizando carrito...' : undefined}
              >
                {isAnalyzing ? 'Analizando...' : 'Comprar'}
              </button>
            )}
          </div>
        </div>{' '}
        {/* Modal de método de pago */}
        <MetodoPagoModal
          isOpen={isMetodoPagoOpen}
          onClose={() => setMetodoPagoOpen(false)}
          total={todosLosItems.reduce(
            (total, item) => total + getPrecioItem(item) * item.cantidad,
            0
          )}
        />
        {/* Modal de login */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onOpenRegistro={() => {
            setLoginModalOpen(false);
            setRegistroModalOpen(true);
          }}
        />{' '}
        {/* Modal de registro */}
        <RegistroModal isOpen={isRegistroModalOpen} onClose={() => setRegistroModalOpen(false)} />
      </div>
    </>
  );
};
