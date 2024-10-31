import React, { useState } from 'react';
import BtnCantidadProducto from './BtnCantidadProducto';
import type { ProductoValor } from '../../utils/types';
import { BtnAgregarCarrito } from '../utils/BtnAgregarCarrito';

type Props = {
  product: ProductoValor | null;
  isOpen: boolean;
  onClose: () => void;
};

export const ModalProducto: React.FC<Props> = ({
  product = null,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !product) return null;
  const [cantidadProducto, setCantidadProducto] = useState(1);

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <article className="relative flex flex-row bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        {/* Imagen del plato */}
        <div className="w-full flex">
          <img
            src={
              // Array.isArray(product.imagen) ? product.imagen[0] : product.imagen
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP8AAADGCAMAAAAqo6adAAAALVBMVEXQ0NDw8PDV1dXPz8/T09Pb29vZ2dnd3d3n5+ft7e3j4+Pg4ODr6+vz8/Ps7OyJEr6/AAAEhUlEQVR4nO3d20LCMAyAYbYiA3G+/+PqxANgD0mabMmSXHrF9wuC61oOB9czbv0ANp7w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w901KieVxbDUd/oU+nk7j0XIDsj+l0/kyf81wnswWIPpTmi7z8Dvz8HqwWYDmT+O9/jaTyQAkf5r+6T+fA2eLASj+dM3wP+fNYACCP/vbtxoA709jiT/Mr+YCEPwl/RJgtBYA7U/Xin+47N9f4w/zyVgArD9NVb+5P4Fo/1vdP4s8SrlB+4t//L/9L7aeAEh/OjX8g7G3QKy/8fIfBmOfgrH+6rvfMsb+ALL73537d/779/76L//z8z3XXfsbH3/tfQBG+88Nvy0+3v9SfwEYe/mz//9n7QIA3l+8+rWMsXc/0vWf98qv/yjwEEWHcP3zWObbWwOgXP8t/Q9o8PIn7fp/PoDJBRDa+s+Y4xv75Hcb4vrf4fz0FJgv1t75bkNd/07jfYH5YnUFvGP9/zDdbgAY3q6jUX3f/S/p68aPlFze/7GTCb/vCb/vCb/vCb/vCb/vCb/vCb/vCb/vUelP620m0ehPp/WWURX6l+WV1QLo899Wl9YKoM7/s7i2UgBt/r+1xXUCKPPfL62uEkCX/3FleY0AqvzPdxeuEECTP3NzpXgARf7svaXSAfT4C7fWCgdQ4y/eWSwbQIu/cmO1aAAl/up95ZIBdPgbt9ULBlDhb+4qkAugwd/eVCEXQIEfwJcLsL0fxBcLsLkfyJcKsLUfzBcKsLEfwZcJsK0fxRcJsKkfyZcIsKUfzRcIwOtPR8TjI/D5A7D604S4YkXiswfg9C9b48ABiHzuAIz+285AYAAynzkAn/9nYyQoQAefNwCb/29fKCBAdgPVJgG4/PfbYpsBOvmcAZj8j7uCGwG6+YwBePzPm6KrARj4fAFY/P/3hFcCsPDZAnD4c1viiwGY+FwBGPz5EwEKAdj4TAH6/aUTMbIBGPk8Abr95QNBMgFY+SwBus8/r5yH8i8AM58jQKe/fhzMUwB2PkOAPn/rNJyHAAL8/gBd/hb/IYAIvztA1/7vJv8ugBC/N0DP9x8A+L8BxPidAeh+GP87gCC/LwD9/Acg/yuAKL8rAPn8DzB/CSDL7wlA/f4LBH+NIQcgnn+jjE8PQDv/SB2fHIB0/pVCPjUA5fwzlXxiAML5f0r5tAD48x/V8kkBuM8/3XbwAbDnH6vmEwLg/Nr5+AAov34+OgDGb4E/DJhbUFB+G3xkALjfCh8XAOy3w0cFgPot8TEBgH5bfEQAmN8aHx4A5LfHBweA+C3yoQEAfpt8YIC23yofFqDpt8sHBWj5LfMhARp+23xAgLrfOr8doOq3z28GqPn3wG8FqPj3wW8EKPvbX/VpZWoBiv798KsBSv498WsBCv598SsB8v698csBsv798YsBcv498ksBMv7P9/1dTvapnvvheNznQP2eJvy+J/y+J/y+J/y+J/y+J/y+J/y+J/y+Z/wAooFG1ZYJEhoAAAAASUVORK5CYII='
            }
            alt={product.nombre}
            className="w-1/2 h-auto object-cover rounded-lg"
          />
          <aside className="relative w-1/2 h-auto">
            {/* Detalles del plato */}
            <div className="pl-6 flex flex-col h-72">
              <h2 className="text-2xl font-semibold">{product.nombre}</h2>
              <p className="text-xl text-gray-500 mt-2">
                ${product.valor.precio}
              </p>
              <p className="mt-4 text-gray-600">{product.descripcion}</p>
            </div>

            <div className="absolute bottom-0 right-0">
              {/* Controles de cantidad */}
              <div className="absolute bottom-20 right-4">
                <BtnCantidadProducto
                  producto={product}
                  cantidadProducto={cantidadProducto}
                  setCantidadProducto={setCantidadProducto}
                />
              </div>

              {/* Botones de acción */}
              <button
                className="absolute px-4 py-2 bg-[#C2BCBC] text-black rounded-md right-56 bottom-4"
                onClick={onClose}>
                Volver
              </button>
              <BtnAgregarCarrito
                product={product}
                cantidadProducto={cantidadProducto}
                setCantidadProducto={setCantidadProducto}
                onClose={onClose}
              />
            </div>
          </aside>
        </div>
      </article>
    </section>
  );
};
