import React, { useContext, useEffect, useState } from 'react';
import { CarritoContext } from '../../../shared/providers/CarritoProvider';
import { useLocation } from 'react-router-dom';
import type { Articulo } from '../../../types/Articulo';

interface BtnCantidadProductoProps {
  articulo: Articulo;
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
  const [hasAttemptedExceedLimit, setHasAttemptedExceedLimit] = useState(false);
  const location = useLocation();

  if (!carritoContext) {
    throw new Error('BtnCantidadProducto must be used within a CarritoProvider');
  }

  const { carrito, addToCarrito, decreaseFromCart, analizarCarrito, limitacionesProduccion } =
    carritoContext;
  useEffect(() => {
    const productoEnCarrito = carrito.find((item) => item.denominacion === articulo.denominacion);
    if (productoEnCarrito) {
      const nuevaCantidad = productoEnCarrito.cantidad;
      const cantidadAnterior = quantity;

      // Si la cantidad se redujo automáticamente (sistema revirtió un intento de exceder límite)
      if (nuevaCantidad < cantidadAnterior && location.pathname === '/carrito') {
        setHasAttemptedExceedLimit(true);
      }

      setQuantity(nuevaCantidad);
    } else {
      setQuantity(cantidadProducto);
      setHasAttemptedExceedLimit(false);
    }
  }, [carrito, articulo.denominacion, cantidadProducto, quantity, location.pathname]);
  const handleIncrease = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (location.pathname === '/carrito') {
      // En la vista de carrito, verificar límites antes de agregar
      const limitacionMaxima = limitacionesProduccion[articulo.id ?? 0];
      const cantidadActual = carrito.find((item) => item.id === articulo.id)?.cantidad ?? 0;

      if (limitacionMaxima && cantidadActual >= limitacionMaxima) {
        // No se puede agregar más de lo permitido
        setHasAttemptedExceedLimit(true);
        return;
      }

      // Reiniciar flag cuando se permite agregar
      setHasAttemptedExceedLimit(false);

      // Agregar al carrito y luego analizar para actualizar limitaciones
      await addToCarrito(articulo, 1);
      await analizarCarrito(); // Actualizar limitaciones después del cambio
    } else {
      setCantidadProducto(cantidadProducto + 1);
    }
  };

  const handleDecrease = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    // Reiniciar flag cuando se reduce cantidad
    setHasAttemptedExceedLimit(false);

    if (quantity > 1) {
      setQuantity(quantity - 1);
      if (location.pathname === '/carrito') {
        decreaseFromCart({ id: articulo.id ?? 0 });
      } else {
        setCantidadProducto(quantity - 1);
      }
    } else {
      // Si la cantidad es 1 y estamos en /carrito, elimina el producto del carrito
      if (location.pathname === '/carrito') {
        decreaseFromCart({ id: articulo.id ?? 0 });
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

  // Verificar si el botón + debe estar deshabilitado en vista carrito
  const isIncreaseDisabled = (): boolean => {
    if (location.pathname === '/carrito') {
      const limitacionMaxima = limitacionesProduccion[articulo.id ?? 0];
      const cantidadActual = carrito.find((item) => item.id === articulo.id)?.cantidad ?? 0;

      // Deshabilitar si:
      // 1. Hay una limitación y se alcanzó el límite
      // 2. Se ha intentado exceder el límite (flag activado)
      return Boolean(
        (limitacionMaxima && cantidadActual >= limitacionMaxima) || hasAttemptedExceedLimit
      );
    }
    return false;
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
        disabled={isIncreaseDisabled()}
        className={`px-3 py-2 rounded-full ${
          isIncreaseDisabled()
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-primary text-white hover:font-bold hover:bg-primary-dark'
        }`}
        title={
          isIncreaseDisabled()
            ? hasAttemptedExceedLimit
              ? 'Límite alcanzado - No se puede agregar más'
              : `Máximo ${limitacionesProduccion[articulo.id ?? 0]} unidades disponibles`
            : undefined
        }
      >
        +
      </button>
    </div>
  );
};

export default BtnCantidadProducto;
