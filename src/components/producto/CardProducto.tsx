import type { ProductoValor } from '../../utils/types';
import { BtnAgregarCarrito } from '../utils/BtnAgregarCarrito';

type ProductProps = {
  product: ProductoValor;
  setProductoModal: (producto: ProductoValor) => void;
};

export const CardProducto = ({ product, setProductoModal }: ProductProps) => {
  //Handle Producto modal
  const handleProductoModal = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setProductoModal(product);
  };

  return (
    <div
      onClick={handleProductoModal}
      className="bg-white rounded-xl shadow-lg overflow-hidden border cursor-pointer"
      style={{ width: '300px' }}>
      <div className="relative flex justify-end items-end w-full bg-red-900">
        <div className="bg-red-500 h-64 w-full">
          <picture>
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
              className="object-cover w-full h-full"
            />
          </picture>
        </div>
        <BtnAgregarCarrito
          position={'right'}
          product={product}
          cantidadProducto={1}
          setCantidadProducto={() => {}}
          onClose={() => {}}
        />
      </div>
      <div className="p-4 text-left">
        <h3 className="text-lg font-bold">{product.nombre}</h3>
        <p className="text-gray-500">${product.valor.precio}</p>
      </div>
    </div>
  );
};
