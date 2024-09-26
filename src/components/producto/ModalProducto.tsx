import React from 'react';
import BtnCantidadProducto from './btnCantidadProducto';
import type { Producto } from '../../utils/types';
import { BtnAgregarCarrito } from '../utils/BtnAgregarCarrito';

type Props = {
  product: Producto | null;
  isOpen: boolean;
  onClose: () => void;
};

export const ModalProducto: React.FC<Props> = ({
  product = null,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !product) return null;

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <article className="relative flex flex-row bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        {/* Imagen del plato */}
        <div className="w-full flex">
          <img
            src={
              Array.isArray(product.imagen) ? product.imagen[0] : product.imagen
            }
            alt={product.nombre}
            className="w-1/2 h-auto object-cover rounded-lg"
          />
          <aside className="relative w-1/2 h-auto">
            {/* Detalles del plato */}
            <div className="pl-6 flex flex-col h-72">
              <h2 className="text-2xl font-semibold">{product.nombre}</h2>
              <p className="text-xl text-gray-500 mt-2">${product.precio}</p>
              <p className="mt-4 text-gray-600">{product.descripcion}</p>
            </div>

            <div className="absolute bottom-4 right-4">
              {/* Controles de cantidad */}
              <div className="absolute bottom-20 right-4">
                <BtnCantidadProducto />
              </div>

              {/* Botones de acción */}
              <button
                className="absolute px-4 py-2 bg-[#C2BCBC] text-black rounded-md right-56 bottom-4"
                onClick={onClose}>
                Volver
              </button>
              <BtnAgregarCarrito product={product} />
            </div>
          </aside>
        </div>
      </article>
    </section>
  );
};
