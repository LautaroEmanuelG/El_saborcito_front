import React, { useContext, useEffect, useState } from 'react';
import { CarritoContext } from '../../shared/providers/CarritoProvider';
import { useLocation } from 'react-router-dom';
import type { Promocion } from '../../types/Promocion';

interface BtnCantidadPromocionProps {
  promocion: Promocion;
  cantidadPromocion: number;
}

const BtnCantidadPromocion: React.FC<BtnCantidadPromocionProps> = ({
  promocion,
  cantidadPromocion,
}) => {
  const carritoContext = useContext(CarritoContext);
  const [quantity, setQuantity] = useState(cantidadPromocion);
  const location = useLocation();

  if (!carritoContext) {
    throw new Error('BtnCantidadPromocion must be used within a CarritoProvider');
  }

  const {
    promocionesEnCarrito,
    addPromocionToCarrito,
    decreasePromocionFromCart,
    isAnalyzing,
    canIncreasePromocion,
  } = carritoContext;

  // 🔄 **SINCRONIZACIÓN CON CARRITO**
  useEffect(() => {
    const promocionEnCarrito = promocionesEnCarrito.find(
      (item) => item.promocion.id === promocion.id
    );
    if (promocionEnCarrito) {
      setQuantity(promocionEnCarrito.cantidad);
    } else {
      setQuantity(cantidadPromocion);
    }
  }, [promocionesEnCarrito, promocion.id, cantidadPromocion]);

  // ➕ **MANEJAR INCREMENTO CON VALIDACIÓN CENTRALIZADA**
  const handleIncrease = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (location.pathname === '/carrito') {
      // � **USAR VALIDACIÓN CENTRALIZADA**
      if (!canIncreasePromocion(promocion.id)) {
        console.log(
          `❌ No se puede agregar más de la promoción ${promocion.denominacion} - tiene productos problemáticos`
        );
        return;
      }

      if (isAnalyzing) {
        console.log('⏳ Análisis de promoción en curso, esperando...');
        return;
      }

      console.log(`🎁 Agregando promoción ${promocion.denominacion} al carrito`);

      try {
        await addPromocionToCarrito(promocion, 1);
        console.log(`✅ Promoción agregada exitosamente`);
      } catch (error) {
        console.error('Error al agregar promoción:', error);
      }
    }
  };

  // ➖ **MANEJAR DECREMENTO**
  const handleDecrease = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (quantity > 1) {
      setQuantity(quantity - 1);
      if (location.pathname === '/carrito') {
        decreasePromocionFromCart(promocion.id);
      }
    } else {
      // Si la cantidad es 1 y estamos en /carrito, elimina la promoción del carrito
      if (location.pathname === '/carrito') {
        decreasePromocionFromCart(promocion.id);
      }
    }
  };

  // 🚫 **VERIFICAR SI EL BOTÓN + DEBE ESTAR DESHABILITADO**
  const isIncreaseDisabled = (): boolean => {
    if (location.pathname === '/carrito') {
      return Boolean(isAnalyzing || !canIncreasePromocion(promocion.id));
    }
    return false;
  };

  // 💡 **OBTENER TÍTULO DEL BOTÓN +**
  const getIncreaseButtonTitle = (): string | undefined => {
    if (!isIncreaseDisabled()) return undefined;

    if (isAnalyzing) {
      return 'Analizando disponibilidad de promoción...';
    }

    return 'No se puede agregar más - algunos productos de esta promoción no se pueden fabricar';
  };

  // 📊 **OBTENER CANTIDAD ACTUAL**
  const cantProd = () => {
    if (location.pathname === '/carrito') {
      return quantity;
    } else {
      return cantidadPromocion;
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

export default BtnCantidadPromocion;
