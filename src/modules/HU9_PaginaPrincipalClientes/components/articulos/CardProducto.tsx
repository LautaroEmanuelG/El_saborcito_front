import { useState, useEffect } from 'react';
import type { ArticuloInsumo, ArticuloManufacturado } from '../../../../types/Articulo';
import { BtnAgregarCarrito } from '../../../HU11_CarritoCompras/components/BtnAgregarCarrito';
import { useProductAvailability } from '../../../../shared/hooks/useProductAvailability';

type ProductProps = {
  articulo: ArticuloManufacturado | ArticuloInsumo;
  setProductoModal: (producto: ArticuloManufacturado | ArticuloInsumo | null) => void;
};

export const CardProducto = ({ articulo, setProductoModal }: ProductProps) => {
  const { checkAvailability, isArticuloManufacturado } = useProductAvailability();
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Verificar disponibilidad al cargar el componente
  useEffect(() => {
    const checkProductAvailability = async () => {
      // Solo verificamos artículos manufacturados
      if (!isArticuloManufacturado(articulo)) return;

      setIsChecking(true);
      const available = await checkAvailability(articulo);
      setIsAvailable(available);
      setIsChecking(false);
    };

    checkProductAvailability();
  }, [articulo, checkAvailability, isArticuloManufacturado]);

  //Handle Producto modal
  const handleProductoModal = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setProductoModal(articulo);
  };

  return (
    <div
      onClick={handleProductoModal}
      className="bg-white flex-1 rounded-xl shadow-lg overflow-hidden border cursor-pointer "
    >
      {' '}
      <div className="relative flex justify-end items-end w-full bg-red-900">
        <div className="bg-red-500 h-64 w-full">
          <picture>
            <source type="image/webp" />
            <img
              src={articulo?.imagen?.url ?? ''}
              alt={articulo?.denominacion ?? ''}
              className="object-cover w-full h-full"
            />
          </picture>
          {isArticuloManufacturado(articulo) && !isAvailable && !isChecking && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Sin stock de insumos
            </div>
          )}
        </div>
        <BtnAgregarCarrito
          position={'right'}
          articulo={articulo}
          cantidadProducto={1}
          setCantidadProducto={() => {}}
          onClose={() => {}}
          disabledOverride={isArticuloManufacturado(articulo) && (!isAvailable || isChecking)}
        />
      </div>
      <div className="p-4 text-left">
        <h3 className="text-lg font-bold">{articulo.denominacion}</h3>
        <p className="text-gray-500">${articulo.precioVenta}</p>
      </div>
    </div>
  );
};
