import { useState, useEffect, useContext } from 'react';
import { Header } from '../../../app/views/user/header/Header';
import { IconoLocation } from '../../../assets/svgs/icons/IconoLocation';
import BtnCantidadProducto from '../../HU9_PaginaPrincipalClientes/components/articulos/btnCantidadProducto';
import { useCart } from '../../../shared/hooks/useCart';
import { CarritoContext } from '../../../shared/providers/CarritoProvider';
import type { AnalisisProduccionResponse, ArticuloManufacturado } from '../../../types/Articulo';
import MetodoPagoModal from './MetodoPagoModal';

export const VistaCarrito = () => {
  const { carrito, removeFromCart } = useCart();
  const [isMetodoPagoOpen, setMetodoPagoOpen] = useState(false);
  const [analisisCarrito, setAnalisisCarrito] = useState<AnalisisProduccionResponse | null>(null);

  const carritoContext = useContext(CarritoContext);
  if (!carritoContext) {
    throw new Error('VistaCarrito must be used within a CarritoProvider');
  }

  const { analizarCarrito, limitacionesProduccion } = carritoContext;

  // Analizar carrito cuando se monta el componente o cuando cambia
  useEffect(() => {
    const realizarAnalisis = async () => {
      const resultado = await analizarCarrito();
      setAnalisisCarrito(resultado);
    };

    if (carrito.length > 0) {
      realizarAnalisis();
    } else {
      setAnalisisCarrito(null);
    }
  }, [carrito, analizarCarrito]);

  // Función para determinar si un artículo es manufacturado
  const isArticuloManufacturado = (articulo: any): articulo is ArticuloManufacturado => {
    return 'categoriaId' in articulo && 'descripcion' in articulo;
  };

  // Función para determinar si un artículo es insumo
  const isArticuloInsumo = (articulo: any): boolean => {
    return 'stockActual' in articulo && 'esParaElaborar' in articulo;
  };

  // Función para verificar si hay limitaciones excedidas que impidan la compra
  const hayLimitacionesExcedidas = (): boolean => {
    return carrito.some((producto) => {
      const limitacionMaxima = limitacionesProduccion[producto.id ?? 0];
      return limitacionMaxima && producto.cantidad > limitacionMaxima;
    });
  };

  // Función para obtener mensaje de limitación para un producto
  const getMensajeLimitacion = (producto: any) => {
    if (!producto.id) return null;

    const limitacionMaxima = limitacionesProduccion[producto.id];
    const cantidadEnCarrito = (producto as any).cantidad;

    // Solo mostrar mensaje si hay limitación y la cantidad actual excede el límite
    if (!limitacionMaxima || cantidadEnCarrito <= limitacionMaxima) return null;

    // Diferentes mensajes según el tipo de artículo
    if (isArticuloInsumo(producto)) {
      return `⚠️ Stock limitado: máximo ${limitacionMaxima} unidades disponibles`;
    } else if (isArticuloManufacturado(producto)) {
      return `⚠️ Solo se pueden producir hasta ${limitacionMaxima} unidades de este producto`;
    }

    return `⚠️ Cantidad limitada a ${limitacionMaxima} unidades`;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-300">
        <Header onSearch={undefined} />
        {/* Contenido del carrito */}
        <div className="container min-h-full mx-auto px-6 py-12 flex gap-4 flex-col md:flex-row">
          {/* Productos */}
          <div className="bg-blanco min-h-full p-4 rounded-xl shadow-lg shadow-gray-300 w-full mr-4 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-4">Carrito</h2>
              {carrito.map((producto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-t border-gray-300 py-4"
                >
                  <div className="flex gap-6">
                    {/* Imagen del producto */}
                    <picture className="hidden md:block w-40 h-auto object-cover rounded-lg">
                      <source type="image/webp" />
                      <img
                        src={
                          producto.imagen?.url ||
                          (Array.isArray(producto.imagen) && producto.imagen.length > 0
                            ? producto.imagen[0]
                            : '/img/Default.png')
                        }
                        alt={producto.denominacion}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </picture>
                    <div className="w-full">
                      <h3 className="text-md md:text-xl  font-semibold">{producto.denominacion}</h3>
                      {getMensajeLimitacion(producto) && (
                        <p className="text-sm text-orange-600 font-medium mt-1">
                          {getMensajeLimitacion(producto)}
                        </p>
                      )}
                      <button
                        className="text-lg md:text-xl  text-primary hover:underline"
                        onClick={() => removeFromCart(producto)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>{' '}
                  <div className="flex items-center">
                    <BtnCantidadProducto
                      articulo={producto}
                      cantidadProducto={producto.cantidad}
                      setCantidadProducto={() => {
                        /* No se usa en vista carrito */
                      }}
                    />
                    <p className="ml-6 sm:text-xl font-semibold flex justify-end">
                      ${(producto.precioVenta * producto.cantidad).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
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
            <h3 className="text-xl md:text-2xl font-semibold">Resumen Compra</h3>
            <div className="flex-grow">
              <div className="flex justify-between mt-2 text-lg sm:text-xl">
                <span className="text-nowrap">
                  Productos ({carrito.reduce((total, producto) => total + producto.cantidad, 0)})
                </span>
                <span className="pl-4 text-negro font-bold">
                  $
                  {carrito
                    .reduce(
                      (total, producto) => total + producto.precioVenta * producto.cantidad,
                      0
                    )
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
                {carrito
                  .reduce((total, producto) => total + producto.precioVenta * producto.cantidad, 0)
                  .toFixed(2)}
              </span>
            </div>
            {/* Condicional para mostrar el botón Comprar */}
            {carrito.length > 0 && (
              <button
                onClick={() => setMetodoPagoOpen(true)}
                disabled={hayLimitacionesExcedidas()}
                className={`mt-4 w-full py-2 text-lg md:text-xl font-semibold rounded-lg text-center ${
                  hayLimitacionesExcedidas()
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
                title={
                  hayLimitacionesExcedidas()
                    ? 'Ajuste las cantidades antes de continuar'
                    : undefined
                }
              >
                {hayLimitacionesExcedidas() ? 'Ajustar Cantidades' : 'Comprar'}
              </button>
            )}
          </div>
        </div>

        {/* Modal de método de pago */}
        <MetodoPagoModal
          isOpen={isMetodoPagoOpen}
          onClose={() => setMetodoPagoOpen(false)}
          total={carrito.reduce(
            (total, producto) => total + producto.precioVenta * producto.cantidad,
            0
          )}
        />
      </div>
    </>
  );
};
