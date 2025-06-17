import React, { useState, useEffect } from 'react';
import type { ArticuloInsumo, ArticuloManufacturado } from '../../../types/Articulo';
import { useProductStore } from '../../../shared/providers/ProductProvider';
import { BtnAgregarCarrito } from '../../HU11_12_Carrito_Confirmacion/BtnAgregarCarrito';

type Props = {
  articulo: ArticuloManufacturado | ArticuloInsumo | null;
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Determina si un artículo es de tipo ArticuloManufacturado
 */
const isArticuloManufacturado = (
  articulo: ArticuloInsumo | ArticuloManufacturado
): articulo is ArticuloManufacturado => {
  return 'categoriaId' in articulo && 'descripcion' in articulo;
};

export const ModalProducto: React.FC<Props> = ({ articulo = null, isOpen, onClose }) => {
  if (!isOpen || !articulo) return null;

  const [cantidadProducto, setCantidadProducto] = useState(1);
  const productAvailability = useProductStore((state) => state.productAvailability);
  const checkSingleProductAvailability = useProductStore(
    (state) => state.checkSingleProductAvailability
  );

  // Verificar disponibilidad en background al abrir el modal
  useEffect(() => {
    if (!articulo?.id || !isArticuloManufacturado(articulo)) return;

    // Verificar en background sin mostrar estado de carga
    checkSingleProductAvailability(articulo.id);
  }, [articulo, checkSingleProductAvailability]);

  // Obtener disponibilidad del estado centralizado
  const isAvailable = productAvailability[articulo.id] ?? true;

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
              </button>{' '}
              {!isAvailable && (
                <div className="bg-negro/80 text-white text-nowrap text-xs px-3 py-1 rounded absolute bottom-16 right-3">
                  Sin stock de insumos
                </div>
              )}
              <BtnAgregarCarrito
                articulo={articulo}
                cantidadProducto={cantidadProducto}
                setCantidadProducto={setCantidadProducto}
                onClose={onClose}
                disabledOverride={!isAvailable}
              />
            </div>
          </aside>
        </div>
      </article>
    </section>
  );
};
