import { Header } from '../../components/header/Header';
import { IconoLocation } from '../../components/iconos/IconoLocation';
import BtnCantidadProducto from '../../components/producto/BtnCantidadProducto';
import { useCart } from '../../hooks/useCart';

const VistaCarrito = () => {
  const { carrito, removeFromCart } = useCart();

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <Header onSearch={undefined} />
        {/* Contenido del carrito */}
        <div className="container min-h-full mx-auto px-4 py-6 flex">
          {/* Productos */}
          <div className="bg-blanco min-h-full p-4 rounded-xl shadow-lg shadow-gray-300 w-[1068px] mr-4 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-semibold mb-4">Productos</h2>
              {carrito.map((producto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-t border-gray-300 py-4">
                  <div className="flex items-center">
                    <img
                      src={
                        Array.isArray(producto.imagen)
                          ? producto.imagen[0]
                          : producto.imagen
                      }
                      alt={producto.nombre}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="ml-4">
                      <h3 className="text-[24px] font-semibold">
                        {producto.nombre}
                      </h3>
                      <button
                        className="text-[24px] text-primary hover:underline"
                        onClick={() => removeFromCart(producto)}>
                        Eliminar
                      </button>
                      <button className="ml-4 text-[24px] font-semibold text-[#E11D48] hover:underline">
                        Guardar
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {/* BtnCantidadProducto */}
                    <BtnCantidadProducto
                      producto={producto}
                      cantidadProducto={1}
                      setCantidadProducto={() => {
                        /* enviamos nada */
                      }}
                    />
                    <p className="ml-6 text-xl font-semibold w-24 flex justify-end">
                      ${(producto.precio * producto.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Barra de Envío: Retiro en Local */}
            <div className="flex justify-between items-center py-2 text-[#E11D48] mt-4">
              <span className="font-semibold text-black text-[24px]">
                Envío
              </span>
              <div className="flex items-center w-full ml-4">
                <span className="mr-2 text-[24px] text-[#E11D48]">
                  Retiro en Local
                </span>
                <div className="border-t-4 border-[#E11D48] flex-grow mx-2"></div>
                <IconoLocation />
              </div>
            </div>
          </div>

          {/* Resumen de compra */}
          <div className="bg-[#F2F2F2] p-4 rounded-xl shadow-lg shadow-gray-300 w-[325px] h-[370px] flex flex-col">
            <h3 className="text-[24px] font-semibold">Resumen Compra</h3>
            <div className="flex-grow">
              <div className="flex justify-between mt-2 text-[20px]">
                <span>Productos ({carrito.length})</span>
                <span>
                  $
                  {carrito
                    .reduce(
                      (total, producto) =>
                        total + producto.precio * producto.quantity,
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mt-2 text-[20px]">
                <span>Envío</span>
                <span className="text-[#E11D48]">Gratis</span>
              </div>
            </div>
            <div className="flex justify-between mt-auto text-3xl font-bold">
              <span>Total</span>
              <span>
                $
                {carrito
                  .reduce(
                    (total, producto) =>
                      total + producto.precio * producto.quantity,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <button className="mt-4 w-full py-2 bg-[#E11D48] text-[24px] font-semibold text-white rounded-lg text-center">
              Comprar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VistaCarrito;
