import React, { useContext, useEffect, useState } from 'react';
import { CarritoContext } from '../carrito/CarritoProvider';
import type { Producto } from '../../utils/types';
import { useLocation } from 'react-router-dom';

interface BtnCantidadProductoProps {
  producto: Producto;
  cantidad: number;
}

const BtnCantidadProducto: React.FC<BtnCantidadProductoProps> = ({
  producto,
  cantidad = 1,
}) => {
  const carritoContext = useContext(CarritoContext);
  const [quantity, setQuantity] = useState(cantidad);
  const location = useLocation();

  if (!carritoContext) {
    throw new Error(
      'BtnCantidadProducto must be used within a CarritoProvider'
    );
  }

  const { carrito, addToCarrito, decreaseFromCart } = carritoContext;

  useEffect(() => {
    const productoEnCarrito = carrito.find(
      item => item.nombre === producto.nombre
    );
    if (productoEnCarrito) {
      setQuantity(productoEnCarrito.quantity);
    }
  }, [carrito, producto.nombre]);

  const handleIncrease = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setQuantity(quantity + 1);
    if (location.pathname === '/carrito') {
      addToCarrito(producto);
    }
  };
  
  const handleDecrease = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (quantity > 1) {
      setQuantity(quantity - 1);
      if (location.pathname === '/carrito') {
        decreaseFromCart(producto);
      }
    } else {
      // Si la cantidad es 1 y estamos en /carrito, elimina el producto del carrito
      if (location.pathname === '/carrito') {
        decreaseFromCart(producto);
      }
    }
  };

  return (
    <div className="flex items-center justify-between space-x-4 rounded-3xl border-t-gray-300 border-2 w-32">
      <button
        onClick={handleDecrease}
        className="px-3 py-2 bg-gray-300 text-black rounded-full hover:bg-gray-400">
        -
      </button>
      <span className="text-lg font-semibold">{quantity}</span>
      <button
        onClick={handleIncrease}
        className="px-3 py-2 bg-primary text-white rounded-full hover:font-bold hover:bg-primary-dark">
        +
      </button>
    </div>
  );
};

export default BtnCantidadProducto;
