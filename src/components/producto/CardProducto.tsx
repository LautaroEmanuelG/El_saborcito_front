import type { Producto } from '../../utils/types';
import { BtnAgregarCarrito } from '../utils/BtnAgregarCarrito';

type ProductProps = {
  product: Producto;
  setProductoModal: (producto: Producto) => void;
};

export const CardProducto = ({ product, setProductoModal }: ProductProps) => {
  //Handle Producto modal
  const handleProductoModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    // event.preventDefault();
    setProductoModal(product);
  };

  return (
    <button
      onClick={handleProductoModal}
      className="bg-white rounded-xl shadow-lg overflow-hidden border"
      style={{ width: '300px' }}>
      <div className="relative flex justify-end items-end w-full bg-red-900">
        <div className="bg-red-500 h-64 w-full">
          <img
            src={product.imagen[0] ?? product.imagen}
            alt={product.nombre}
            className="object-cover w-full h-full"
          />
        </div>
        <BtnAgregarCarrito
          position={'right'}
          product={product}
        />
      </div>
      <div className="p-4 text-left">
        <h3 className="text-lg font-bold">{product.nombre}</h3>
        <p className="text-gray-500">${product.precio.toFixed(2)}</p>
      </div>
    </button>
  );
};
