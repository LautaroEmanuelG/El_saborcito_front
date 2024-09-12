import type { Producto } from '../../utils/types';

type ProductProps = {
  product: Producto;
};

export const CardProducto = ({ product }: ProductProps) => {
  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden border"
      style={{ width: '300px' }}>
      <div className="relative">
        <img
          src={product.imagen[0] ?? product.imagen}
          alt={product.nombre}
          className="w-full h-64 object-cover"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-4 flex justify-end items-end w-full">
        <button
          className="text-white rounded-xl font-semibold"
          style={{
            backgroundColor: '#E11D48',
            width: '200px',
            height: '50px',
          }}>
          Agregar al carrito
        </button>
      </div>
      <div className="p-4 text-left">
        <h3 className="text-lg font-bold">{product.nombre}</h3>
        <p className="text-gray-500">${product.precio.toFixed(2)}</p>
      </div>
    </div>
  );
};
