import React, { useContext } from 'react';
import { CarritoContext } from '../carrito/CarritoProvider';
import type { ProductoValor } from '../../utils/types';

interface BtnAgregarCarritoProps {
  position?: 'left' | 'right';
  product: ProductoValor;
  cantidadProducto: number;
  setCantidadProducto: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Make onClick optional
}

export const BtnAgregarCarrito: React.FC<BtnAgregarCarritoProps> = ({
  position = 'right',
  product,
  cantidadProducto,
  setCantidadProducto,
  onClose,
  onClick, // Destructure onClick
}) => {
  const carritoContext = useContext(CarritoContext);

  if (!carritoContext) {
    throw new Error('BtnAgregarCarrito must be used within a CarritoProvider');
  }

  const { addToCarrito } = carritoContext;

  const handleAddToCarrito = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addToCarrito(product, cantidadProducto || 1);
    setCantidadProducto(1);
    onClose();
    if (onClick) {
      onClick(event); // Call onClick if it is provided
    }
  };

  return (
    <button
      className={`absolute bg-primary bottom-3 ${
        position === 'right' ? 'right-3' : 'left-3'
      } text-white rounded-xl font-semibold hover:bg-blanco hover:text-primary hover:font-bold hover:text-lg transition-all duration-100 ease-in-out transform hover:scale-105`}
      style={{
        width: '200px',
        height: '50px',
      }}
      onClick={handleAddToCarrito}>
      Agregar al carrito
    </button>
  );
};
