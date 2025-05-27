import React, { useState } from 'react';
import { BtnAgregarCarrito } from '../../../HU11_CarritoCompras/components/BtnAgregarCarrito';
import BtnCantidadProducto from './btnCantidadProducto';
import type { ArticuloInsumo, ArticuloManufacturado } from '../../../../types/Articulo';

type Props = {
  articulo: ArticuloManufacturado | ArticuloInsumo | null;
  isOpen: boolean;
  onClose: () => void;
};

export const ModalProducto: React.FC<Props> = ({ articulo = null, isOpen, onClose }) => {
  if (!isOpen || !articulo) return null;
  const [cantidadProducto, setCantidadProducto] = useState(1);

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <article className="relative flex flex-row bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        {/* Imagen del plato */}
        <div className="w-full flex">
          <picture className="w-1/2 h-auto object-cover rounded-lg">
            <source type="image/webp" />
            <img
              src={articulo?.imagen?.url ?? '/img/Default.png'}
              alt={articulo?.denominacion ?? 'Imagen por default el Saborcito'}
              className="object-cover w-full h-full rounded-lg"
            />
          </picture>
          <aside className="relative w-1/2 h-auto">
            {/* Detalles del plato */}
            <div className="pl-6 flex flex-col h-72">
              <h2 className="text-2xl font-semibold">{articulo.denominacion}</h2>
              <p className="text-xl text-gray-500 mt-2">${articulo.precioVenta}</p>
              <p className="mt-4 text-gray-600">
                {'descripcion' in articulo ? (articulo.descripcion ?? '') : ''}
              </p>
            </div>

            <div className="absolute bottom-0 right-0">
              {/* Botones de acción */}
              <button
                className="absolute px-4 py-2 bg-[#C2BCBC] text-black rounded-md right-56 bottom-4"
                onClick={onClose}
              >
                Volver
              </button>
              <BtnAgregarCarrito
                articulo={articulo}
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
