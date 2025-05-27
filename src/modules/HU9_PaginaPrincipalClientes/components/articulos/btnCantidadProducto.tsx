import React, { useContext, useEffect, useState } from 'react';
import { CarritoContext } from '../../../../shared/providers/CarritoProvider';
import { useLocation } from 'react-router-dom';
import type { ArticuloInsumo, ArticuloManufacturado } from '../../../../types/Articulo';

interface BtnCantidadProductoProps {
  articulo: ArticuloManufacturado | ArticuloInsumo;
  cantidadProducto: number;
  setCantidadProducto: React.Dispatch<React.SetStateAction<number>>;
}

const BtnCantidadProducto: React.FC<BtnCantidadProductoProps> = ({
  articulo,
  cantidadProducto,
  setCantidadProducto,
}) => {
  const carritoContext = useContext(CarritoContext);
  const [quantity, setQuantity] = useState(cantidadProducto);
  const location = useLocation();

  if (!carritoContext) {
    throw new Error('BtnCantidadProducto must be used within a CarritoProvider');
  }

  const { carrito, addToCarrito, decreaseFromCart } = carritoContext;

  useEffect(() => {
    const productoEnCarrito = carrito.find((item) => item.denominacion === articulo.denominacion);
    if (productoEnCarrito) {
      setQuantity(productoEnCarrito.cantidad);
    }
  }, [carrito, articulo.denominacion]);

  const handleIncrease = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (location.pathname === '/carrito') {
      addToCarrito(articulo, 1);
    } else {
      setCantidadProducto(cantidadProducto + 1);
    }
  };

  const handleDecrease = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (quantity > 1) {
      setQuantity(quantity - 1);
      if (location.pathname === '/carrito') {
        decreaseFromCart({ id: articulo.id! });
      } else {
        setCantidadProducto(quantity - 1);
      }
    } else {
      // Si la cantidad es 1 y estamos en /carrito, elimina el producto del carrito
      if (location.pathname === '/carrito') {
        decreaseFromCart({ id: articulo.id! });
      } else {
        setCantidadProducto(1);
      }
    }
  };

  const cantProd = () => {
    if (location.pathname === '/carrito') {
      return quantity;
    } else {
      return cantidadProducto;
    }
  };

  return (
    <div className="flex items-center justify-between space-x-2 sm:space-x-4 rounded-3xl border-t-gray-300 border-2 sm:w-32">
      <button
        onClick={handleDecrease}
        className="px-3 py-2 bg-gray-300 text-black rounded-full hover:bg-gray-400"
      >
        -
      </button>
      <span className="sm:text-lg font-semibold">{cantProd()}</span>
      <button
        onClick={handleIncrease}
        className="px-3 py-2 bg-primary text-white rounded-full hover:font-bold hover:bg-primary-dark"
      >
        +
      </button>
    </div>
  );
};

export default BtnCantidadProducto;
