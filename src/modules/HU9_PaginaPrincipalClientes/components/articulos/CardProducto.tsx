import type { ArticuloManufacturado } from '../../../../types/Articulo';
import { BtnAgregarCarrito } from '../../../HU11_CarritoCompras/components/BtnAgregarCarrito';

type ProductProps = {
  articulo: ArticuloManufacturado;
  setProductoModal: (producto: ArticuloManufacturado | null) => void;
};

export const CardProducto = ({ articulo, setProductoModal }: ProductProps) => {
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
      <div className="relative flex justify-end items-end w-full bg-red-900">
        <div className="bg-red-500 h-64 w-full">
          <picture>
            <source type="image/webp" />
            <img
              src={
                Array.isArray(articulo.imagen) && articulo.imagen.length > 0
                  ? articulo.imagen[0]
                  : Array.isArray(articulo.imagen) && articulo.imagen.length > 1
                    ? articulo.imagen[1]
                    : ''
              }
              alt={articulo.denominacion}
              className="object-cover w-full h-full"
            />
          </picture>
        </div>
        <BtnAgregarCarrito
          position={'right'}
          articulo={articulo}
          cantidadProducto={1}
          setCantidadProducto={() => {}}
          onClose={() => {}}
        />
      </div>
      <div className="p-4 text-left">
        <h3 className="text-lg font-bold">{articulo.denominacion}</h3>
        <p className="text-gray-500">${articulo.precioVenta}</p>
      </div>
    </div>
  );
};
