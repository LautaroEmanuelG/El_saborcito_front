import { useState, useEffect, useContext } from 'react';
import { Header } from '../../app/views/user/header/Header';
import { IconoLocation } from '../../assets/svgs/icons/IconoLocation';
import { useCart } from '../../shared/hooks/useCart';
import { CarritoContext } from '../../shared/providers/CarritoProvider';
import type { ArticuloManufacturado } from '../../types/Articulo';
import MetodoPagoModal from './MetodoPagoModal';
import BtnCantidadProducto from '../HU9_10_Landing_Busqueda/articulos/btnCantidadProducto';
import BtnCantidadPromocion from './BtnCantidadPromocion';
import { useUser } from '../../shared/providers/UserProvider';
import { useNotificacion } from '../../shared/hooks/useNotificacion';

export const VistaCarrito = () => {
  const { carrito, promocionesEnCarrito, removeFromCart, removePromocionFromCart } = useCart();
  const [isMetodoPagoOpen, setMetodoPagoOpen] = useState(false);

  const carritoContext = useContext(CarritoContext);
  if (!carritoContext) {
    throw new Error('VistaCarrito must be used within a CarritoProvider');
  }

  const { analizarCarrito, limitacionesProduccion, promocionesProblematicas, isAnalyzing } =
    carritoContext;

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

  // 🚀 **ANÁLISIS AUTOMATIZADO AL MONTAR EL COMPONENTE**
  useEffect(() => {
    // Solo analizar si hay items en el carrito y no se está analizando ya
    if (todosLosItems.length > 0 && !isAnalyzing) {
      console.log('🔍 Analizando carrito inicial desde VistaCarrito');
      analizarCarrito();
    }
  }, []); // Solo ejecutar al montar el componente

  // Función para determinar si un artículo es manufacturado
  const isArticuloManufacturado = (articulo: any): articulo is ArticuloManufacturado => {
    return 'categoriaId' in articulo && 'descripcion' in articulo;
  };

  // Función para determinar si un artículo es insumo
  const isArticuloInsumo = (articulo: any): boolean => {
    return 'stockActual' in articulo && 'esParaElaborar' in articulo;
  };

  // 🚀 **FUNCIÓN OPTIMIZADA PARA VERIFICAR LIMITACIONES**
  const hayLimitacionesExcedidas = (): boolean => {
    return todosLosItems.some((item) => {
      if (item.tipo === 'producto') {
        const articuloIdStr = (item.id ?? 0).toString();
        const limitacionMaxima = limitacionesProduccion[articuloIdStr];
        return limitacionMaxima && item.cantidad > limitacionMaxima;
      } else if (item.tipo === 'promocion') {
        return promocionesProblematicas.has(item.id);
      }
      return false;
    });
  };

  // 🚀 **FUNCIÓN PARA VERIFICAR LIMITACIONES ALCANZADAS**
  const hayLimitacionesAlcanzadas = (): boolean => {
    return todosLosItems.some((item) => {
      if (item.tipo === 'producto') {
        const articuloIdStr = (item.id ?? 0).toString();
        const limitacionMaxima = limitacionesProduccion[articuloIdStr];
        return limitacionMaxima && item.cantidad === limitacionMaxima;
      }
      return false;
    });
  };

  // 🚀 **FUNCIÓN OPTIMIZADA PARA MANEJAR COMPRA**
  const handleComprarClick = async () => {
    // No permitir compra si se está analizando
    if (isAnalyzing) {
      console.log('⏳ Análisis en curso, esperando...');
      return;
    }

    // 🚫 Validar baja lógica del cliente
    if (user && user.estado === false) {
      mostrarNotificacion(
        'No puedes realizar pedidos porque estás dado de baja. Contacta al administrador.',
        'error',
        6000
      );
      return;
    }

    // Realizar análisis final antes de abrir el modal
    const analisisFinal = await analizarCarrito();

    if (!analisisFinal?.sePuedeProducirCompleto) {
      alert(
        '❌ No se puede completar la compra debido a limitaciones de stock. Por favor, ajuste las cantidades.'
      );
      return;
    }

    setMetodoPagoOpen(true);
  };

  // 🚀 **FUNCIÓN OPTIMIZADA PARA MENSAJES DE LIMITACIÓN**
  const getMensajeLimitacion = (item: any) => {
    if (item.tipo === 'promocion') {
      const esProblematica = promocionesProblematicas.has(item.id);
      return esProblematica
        ? '⚠️ Esta promoción contiene productos que no se pueden fabricar completamente'
        : null;
    }

    if (!item.id) return null;

    const articuloIdStr = item.id.toString();
    const limitacionMaxima = limitacionesProduccion[articuloIdStr];
    const cantidadEnCarrito = item.cantidad;

    if (!limitacionMaxima || cantidadEnCarrito <= limitacionMaxima) return null;

    if (isArticuloInsumo(item)) {
      return `⚠️ Stock limitado: máximo ${limitacionMaxima} unidades disponibles`;
    } else if (isArticuloManufacturado(item)) {
      return `⚠️ Solo se pueden producir hasta ${limitacionMaxima} unidades de este producto`;
    }

    return `⚠️ Cantidad limitada a ${limitacionMaxima} unidades`;
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
                disabled={hayLimitacionesExcedidas()}
                className={`mt-4 w-full py-2 text-lg md:text-xl font-semibold rounded-lg text-center ${
                  hayLimitacionesExcedidas()
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
                title={
                  hayLimitacionesExcedidas()
                    ? 'Hay cantidades que exceden los límites de producción'
                    : hayLimitacionesAlcanzadas()
                      ? 'Algunos productos están en su límite máximo de producción'
                      : undefined
                }
              >
                {hayLimitacionesExcedidas() ? 'Reducir Cantidades' : 'Comprar'}
              </button>
            )}
          </div>
        </div>
        {/* Modal de método de pago */}{' '}
        <MetodoPagoModal
          isOpen={isMetodoPagoOpen}
          onClose={() => setMetodoPagoOpen(false)}
          total={todosLosItems.reduce(
            (total, item) => total + getPrecioItem(item) * item.cantidad,
            0
          )}
        />
      </div>
    </>
  );
};
