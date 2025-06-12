import type { ArticuloInsumo, ArticuloManufacturado } from '../../../types/Articulo';
import { useProductStore } from '../../../shared/providers/ProductProvider';
import { BtnAgregarCarrito } from '../../HU11_12_Carrito_Confirmacion/BtnAgregarCarrito';

type ProductProps = {
  articulo: ArticuloManufacturado | ArticuloInsumo;
  setProductoModal: (producto: ArticuloManufacturado | ArticuloInsumo | null) => void;
};

/**
 * Determina si un artículo es de tipo ArticuloManufacturado
 */
const isArticuloManufacturado = (
  articulo: ArticuloInsumo | ArticuloManufacturado
): articulo is ArticuloManufacturado => {
  return 'categoriaId' in articulo && 'descripcion' in articulo;
};

export const CardProducto = ({ articulo, setProductoModal }: ProductProps) => {
  const productAvailability = useProductStore((state) => state.productAvailability);

  // Obtener disponibilidad del estado centralizado
  const isAvailable = productAvailability[articulo.id] ?? true;

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
          </picture>{' '}
          {isArticuloManufacturado(articulo) && !isAvailable && (
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
          disabledOverride={isArticuloManufacturado(articulo) && !isAvailable}
        />
      </div>
      <div className="p-4 text-left">
        <h3 className="text-lg font-bold">{articulo.denominacion}</h3>
        <p className="text-gray-500">${articulo.precioVenta}</p>
      </div>
    </div>
  );
};
