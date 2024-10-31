import { useState } from 'react';
import { Header } from '../../components/header/Header';
import { IconoLocation } from '../../components/iconos/IconoLocation';
import BtnCantidadProducto from '../../components/producto/BtnCantidadProducto';
import { useCart } from '../../hooks/useCart';
import MetodoPagoModal from './MetodoPagoModal';

const VistaCarrito = () => {
  const { carrito, removeFromCart } = useCart();
  const [isMetodoPagoOpen, setMetodoPagoOpen] = useState(false);

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
                    {/* Imagen del producto */}
                    <img
                      src={
                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP8AAADGCAMAAAAqo6adAAAALVBMVEXQ0NDw8PDV1dXPz8/T09Pb29vZ2dnd3d3n5+ft7e3j4+Pg4ODr6+vz8/Ps7OyJEr6/AAAEhUlEQVR4nO3d20LCMAyAYbYiA3G+/+PqxANgD0mabMmSXHrF9wuC61oOB9czbv0ANp7w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w901KieVxbDUd/oU+nk7j0XIDsj+l0/kyf81wnswWIPpTmi7z8Dvz8HqwWYDmT+O9/jaTyQAkf5r+6T+fA2eLASj+dM3wP+fNYACCP/vbtxoA709jiT/Mr+YCEPwl/RJgtBYA7U/Xin+47N9f4w/zyVgArD9NVb+5P4Fo/1vdP4s8SrlB+4t//L/9L7aeAEh/OjX8g7G3QKy/8fIfBmOfgrH+6rvfMsb+ALL73537d/779/76L//z8z3XXfsbH3/tfQBG+88Nvy0+3v9SfwEYe/mz//9n7QIA3l+8+rWMsXc/0vWf98qv/yjwEEWHcP3zWObbWwOgXP8t/Q9o8PIn7fp/PoDJBRDa+s+Y4xv75Hcb4vrf4fz0FJgv1t75bkNd/07jfYH5YnUFvGP9/zDdbgAY3q6jUX3f/S/p68aPlFze/7GTCb/vCb/vCb/vCb/vCb/vCb/vCb/vCb/vUelP620m0ehPp/WWURX6l+WV1QLo899Wl9YKoM7/s7i2UgBt/r+1xXUCKPPfL62uEkCX/3FleY0AqvzPdxeuEECTP3NzpXgARf7svaXSAfT4C7fWCgdQ4y/eWSwbQIu/cmO1aAAl/up95ZIBdPgbt9ULBlDhb+4qkAugwd/eVCEXQIEfwJcLsL0fxBcLsLkfyJcKsLUfzBcKsLEfwZcJsK0fxRcJsKkfyZcIsKUfzRcIwOtPR8TjI/D5A7D604S4YkXiswfg9C9b48ABiHzuAIz+285AYAAynzkAn/9nYyQoQAefNwCb/29fKCBAdgPVJgG4/PfbYpsBOvmcAZj8j7uCGwG6+YwBePzPm6KrARj4fAFY/P/3hFcCsPDZAnD4c1viiwGY+FwBGPz5EwEKAdj4TAH6/aUTMbIBGPk8Abr95QNBMgFY+SwBus8/r5yH8i8AM58jQKe/fhzMUwB2PkOAPn/rNJyHAAL8/gBd/hb/IYAIvztA1/7vJv8ugBC/N0DP9x8A+L8BxPidAeh+GP87gCC/LwD9/Acg/yuAKL8rAPn8DzB/CSDL7wlA/f4LBH+NIQcgnn+jjE8PQDv/SB2fHIB0/pVCPjUA5fwzlXxiAML5f0r5tAD48x/V8kkBuM8/3XbwAbDnH6vmEwLg/Nr5+AAov34+OgDGb4E/DJhbUFB+G3xkALjfCh8XAOy3w0cFgPot8TEBgH5bfEQAmN8aHx4A5LfHBweA+C3yoQEAfpt8YIC23yofFqDpt8sHBWj5LfMhARp+23xAgLrfOr8doOq3z28GqPn3wG8FqPj3wW8EKPvbX/VpZWoBiv798KsBSv498WsBCv598SsB8v698csBsv798YsBcv498ksBMv7P9/1dTvapnvvheNznQP2eJvy+J/y+J/y+J/y+J/y+J/y+J/y+J/y+Z/wAooFG1ZYJEhoAAAAASUVORK5CYII='
                      }
                      // src={Array.isArray(producto.imagen) ? producto.imagen[0] : producto.imagen}
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
                    </div>
                  </div>

                  <div className="flex items-center">
                    <BtnCantidadProducto
                      producto={producto}
                      cantidadProducto={1}
                      setCantidadProducto={() => {
                        /* enviamos nada */
                      }}
                    />
                    <p className="ml-6 text-xl font-semibold w-24 flex justify-end">
                      ${(producto.valor.precio * producto.quantity).toFixed(2)}
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
            <button
              onClick={() => setMetodoPagoOpen(true)}
              className="mt-4 w-full py-2 bg-[#E11D48] text-[24px] font-semibold text-white rounded-lg text-center">
              Comprar
            </button>
          </div>
        </div>

        {/* Modal de método de pago */}
        <MetodoPagoModal
          isOpen={isMetodoPagoOpen}
          onClose={() => setMetodoPagoOpen(false)}
          total={carrito.reduce(
            (total, producto) => total + producto.precio * producto.quantity,
            0
          )}
        />
      </div>
    </>
  );
};

export default VistaCarrito;
