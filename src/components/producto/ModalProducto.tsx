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
          <picture className="w-1/2 h-auto object-cover rounded-lg">
            <source type="image/webp" />
            <img
              src={
                Array.isArray(product.imagen) && product.imagen.length > 0
                  ? product.imagen[0]
                  : Array.isArray(product.imagen) && product.imagen.length > 1
                  ? product.imagen[1]
                  : ''
              }
              alt={product.nombre}
              className="object-cover w-full h-full rounded-lg"
            />
          </picture>
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
