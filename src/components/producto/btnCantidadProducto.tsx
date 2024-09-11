/*
Para copiar la siguiente funcionalidad durante el codigo usar: import BtnCantidadProducto from './components/producto/btnCantidadProducto';

Incluirlo en la interfaz con <BtnCantidadProducto />



*/

import React, { useState } from 'react';

const BtnCantidadProducto = () => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Boton - (restar unidad) */}
      <button
        onClick={handleDecrease}
        className="px-3 py-2 bg-gray-300 text-black rounded-full hover:bg-gray-400"
      >
        -
      </button>

      {/* Cantidad */}
      <span className="text-lg font-semibold">{quantity}</span>

      {/* Botón + (agregar cantidad)*/}
      <button
        onClick={handleIncrease}
        className="px-3 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
      >
        +
      </button>
    </div>
  );
};

export default BtnCantidadProducto;
