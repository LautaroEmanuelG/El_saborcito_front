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
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 🚨 NUEVO: Flag para evitar análisis concurrentes
  const location = useLocation();

  if (!carritoContext) {
    throw new Error('BtnCantidadPromocion must be used within a CarritoProvider');
  }

  const {
    promocionesEnCarrito,
    addPromocionToCarrito,
    decreasePromocionFromCart,
    analizarCarrito,
    promocionesProblematicas,
  } = carritoContext;

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

  const handleIncrease = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (location.pathname === '/carrito') {
      // 🚨 Evitar múltiples análisis concurrentes
      if (isAnalyzing) {
        console.log('⏳ Análisis de promoción en curso, esperando...');
        return;
      }

      // Verificar si esta promoción tiene problemas antes de agregar
      const tieneProblemas = promocionesProblematicas.has(promocion.id);

      if (tieneProblemas) {
        console.log(
          `❌ No se puede agregar más de la promoción ${promocion.denominacion} - tiene productos problemáticos`
        );
        return; // No permitir agregar si tiene problemas
      }

      try {
        setIsAnalyzing(true);

        // Agregar promoción al carrito
        await addPromocionToCarrito(promocion, 1);

        // Analizar carrito después del cambio
        const analisisResultado = await analizarCarrito();

        // 🚨 NUEVO: Verificar si después del análisis se detectó que la promoción tiene problemas
        if (analisisResultado && !analisisResultado.sePuedeProducirCompleto) {
          // Verificar si esta promoción ahora tiene problemas
          const articulosDeEstaPromocion =
            promocion.promocionDetalles?.map((detalle) => detalle.articulo.id) || [];
          const tieneProblemasAhora = analisisResultado.productosConProblemas?.some(
            (problema: any) => articulosDeEstaPromocion.includes(problema.articuloId)
          );

          if (tieneProblemasAhora) {
            console.log(
              `🔄 Revirtiendo última adición de promoción ${promocion.denominacion} - productos problemáticos detectados`
            );
            // Revertir la última adición decrementando la promoción
            decreasePromocionFromCart(promocion.id);
          }
        }
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleDecrease = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (quantity > 1) {
      setQuantity(quantity - 1);
      if (location.pathname === '/carrito') {
        decreasePromocionFromCart(promocion.id);
        await analizarCarrito(); // Analizar carrito después del cambio
      }
    } else {
      // Si la cantidad es 1 y estamos en /carrito, elimina la promoción del carrito
      if (location.pathname === '/carrito') {
        decreasePromocionFromCart(promocion.id);
        await analizarCarrito(); // Analizar carrito después del cambio
      }
    }
  };

  // Verificar si el botón + debe estar deshabilitado
  const isIncreaseDisabled = (): boolean => {
    if (location.pathname === '/carrito') {
      return promocionesProblematicas.has(promocion.id) || isAnalyzing;
    }
    return false;
  };

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
        title={
          isIncreaseDisabled()
            ? isAnalyzing
              ? 'Analizando disponibilidad de promoción...'
              : 'No se puede agregar más - algunos productos de esta promoción no se pueden fabricar'
            : undefined
        }
      >
        +
      </button>
    </div>
  );
};

export default BtnCantidadPromocion;
