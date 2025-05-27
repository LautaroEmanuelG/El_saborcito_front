import { useState } from 'react';
import { Header } from '../../../app/views/user/header/Header';
import { IconoLocation } from '../../../assets/svgs/icons/IconoLocation';
import BtnCantidadProducto from '../../HU9_PaginaPrincipalClientes/components/articulos/btnCantidadProducto';
import { useCart } from '../../../shared/hooks/useCart';
import MetodoPagoModal from './MetodoPagoModal';

export const VistaCarrito = () => {
  const { carrito, removeFromCart } = useCart();
  const [isMetodoPagoOpen, setMetodoPagoOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gray-300">
        <Header onSearch={undefined} />
        {/* Contenido del carrito */}
        <div className="container min-h-full mx-auto px-6 py-12 flex gap-4 flex-col md:flex-row">
          {/* Productos */}
          <div className="bg-blanco min-h-full p-4 rounded-xl shadow-lg shadow-gray-300 w-full mr-4 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-semibold mb-4">Productos</h2>
              {carrito.map((producto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-t border-gray-300 py-4"
                >
                  <div className="flex gap-6">
                    {/* Imagen del producto */}
                    <picture className="hidden md:block w-1/2 h-auto object-cover rounded-lg">
                      <source type="image/webp" />
                      <img
                        src={
                          Array.isArray(producto.imagen) && producto.imagen.length > 0
                            ? producto.imagen[0]
                            : Array.isArray(producto.imagen) && producto.imagen.length > 1
                              ? producto.imagen[1]
                              : ''
                        }
                        alt={producto.denominacion}
                        className=" w-20 h-20 object-cover rounded-lg"
                      />
                    </picture>
                    <div className="w-full">
                      <h3 className="text-md md:text-xl  font-semibold">{producto.denominacion}</h3>
                      <button
                        className="text-lg md:text-xl  text-primary hover:underline"
                        onClick={() => removeFromCart(producto)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <BtnCantidadProducto
                      articulo={producto}
                      cantidadProducto={1}
                      setCantidadProducto={() => {
                        /* enviamos nada */
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
            <h3 className="text-lg md:text-xl font-semibold">Resumen Compra</h3>
            <div className="flex-grow">
              <div className="flex justify-between mt-2 text-lg sm:text-2xl">
                <span>
                  Productos ({carrito.reduce((total, producto) => total + producto.cantidad, 0)})
                </span>
                <span>
                  $
                  {carrito
                    .reduce(
                      (total, producto) => total + producto.precioVenta * producto.cantidad,
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mt-2 text-lg sm:text-2xl">
                <span>Envío</span>
                <span className="text-primary">Gratis</span>
              </div>
            </div>
            <div className="flex justify-between mt-auto text-2xl sm:text-3xl font-bold">
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
                className="mt-4 w-full py-2 bg-primary text-lg md:text-xl  font-semibold text-white rounded-lg text-center"
              >
                Comprar
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
