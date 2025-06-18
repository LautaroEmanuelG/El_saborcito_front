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
  const location = useLocation();

  if (!carritoContext) {
    throw new Error('BtnCantidadProducto must be used within a CarritoProvider');
  }
  const { carrito, addToCarrito, decreaseFromCart, isAnalyzing, limitacionesProduccion } =
    carritoContext;

  // 🔄 **SINCRONIZACIÓN CON CARRITO**
  useEffect(() => {
    const productoEnCarrito = carrito.find((item) => item.denominacion === articulo.denominacion);
    if (productoEnCarrito) {
      setQuantity(productoEnCarrito.cantidad);
    } else {
      setQuantity(cantidadProducto);
    }
  }, [carrito, articulo.denominacion, cantidadProducto]);
  // ➕ **MANEJAR INCREMENTO CON ANÁLISIS PREDICTIVO**
  const handleIncrease = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (location.pathname === '/carrito') {
      // 🚀 **ESTRATEGIA PREDICTIVA: Validar antes de agregar**
      if (!articulo.id) {
        return;
      }

      if (isAnalyzing) {
        return;
      }

      try {
        // El addToCarrito ahora maneja internamente el análisis predictivo y auto-ajuste
        await addToCarrito(articulo, 1);
      } catch (error) {
        console.error('Error al agregar al carrito:', error);
      }
    } else {
      // Vista normal (no carrito)
      setCantidadProducto(cantidadProducto + 1);
    }
  };

  // ➖ **MANEJAR DECREMENTO**
  const handleDecrease = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

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

  // 📊 **OBTENER CANTIDAD ACTUAL**
  const cantProd = () => {
    if (location.pathname === '/carrito') {
      return quantity;
    } else {
      return cantidadProducto;
    }
  };
  // 🚫 **VERIFICAR SI EL BOTÓN + DEBE ESTAR DESHABILITADO**
  const isIncreaseDisabled = (): boolean => {
    if (location.pathname === '/carrito') {
      // Solo deshabilitar si está analizando o si hay limitación y está en el límite
      if (isAnalyzing) return true;

      if (articulo.id) {
        const articuloIdStr = articulo.id.toString();
        const limitacionMaxima = limitacionesProduccion[articuloIdStr];
        const cantidadActual = carrito.find((item) => item.id === articulo.id)?.cantidad ?? 0;

        return Boolean(limitacionMaxima && cantidadActual >= limitacionMaxima);
      }
    }
    return false;
  };

  // 💡 **OBTENER TÍTULO DEL BOTÓN +**
  const getIncreaseButtonTitle = (): string | undefined => {
    if (!isIncreaseDisabled()) return undefined;

    if (isAnalyzing) {
      return 'Analizando disponibilidad...';
    }

    if (articulo.id) {
      const articuloIdStr = articulo.id.toString();
      const limitacionMaxima = limitacionesProduccion[articuloIdStr];

      if (limitacionMaxima) {
        return `Máximo ${limitacionMaxima} unidades disponibles`;
      }
    }

    return 'No se puede agregar más';
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
        title={getIncreaseButtonTitle()}
      >
        +
      </button>
    </div>
  );
};

export default BtnCantidadProducto;
