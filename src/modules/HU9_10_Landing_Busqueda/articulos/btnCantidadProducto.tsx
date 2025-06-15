import React, { useContext, useEffect, useState, useRef } from 'react';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastCarritoSize = useRef(0);
  const pendingAnalysis = useRef(false);
  const location = useLocation();

  if (!carritoContext) {
    throw new Error('BtnCantidadProducto must be used within a CarritoProvider');
  }

  const { carrito, addToCarrito, decreaseFromCart, analizarCarrito, limitacionesProduccion } =
    carritoContext;
  // Sincronizar estado con carrito
  useEffect(() => {
    const productoEnCarrito = carrito.find((item) => item.denominacion === articulo.denominacion);
    if (productoEnCarrito) {
      setQuantity(productoEnCarrito.cantidad);
    } else {
      setQuantity(cantidadProducto);
      setHasAttemptedExceedLimit(false);
    }
  }, [carrito, articulo.denominacion, cantidadProducto]);

  // 🔄 **EFECTO REACTIVO** para analizar carrito cuando cambie
  useEffect(() => {
    // Solo ejecutar en vista carrito y si hay un análisis pendiente
    if (location.pathname !== '/carrito' || !pendingAnalysis.current) {
      return;
    }

    const currentCarritoSize = carrito.reduce((total, item) => total + item.cantidad, 0);

    // Si el carrito cambió desde la última vez
    if (currentCarritoSize !== lastCarritoSize.current) {
      lastCarritoSize.current = currentCarritoSize;

      const executeAnalysis = async () => {
        try {
          setIsAnalyzing(true);
          console.log(`🔄 Analizando carrito reactivo para ${articulo.denominacion}`);

          const analisisResultado = await analizarCarrito();
          console.log(`📋 Análisis reactivo completado:`, analisisResultado);

          if (analisisResultado && !analisisResultado.sePuedeProducirCompleto) {
            const problemaEsteArticulo = analisisResultado.productosConProblemas?.find(
              (problema) => problema.articuloId === articulo.id
            );

            if (problemaEsteArticulo) {
              const cantidadMaxima = problemaEsteArticulo.cantidadMaximaPosible;
              const cantidadActual = carrito.find((item) => item.id === articulo.id)?.cantidad ?? 0;

              console.log(`🚫 Limitación detectada para ${articulo.denominacion}:`);
              console.log(`   - Cantidad máxima posible: ${cantidadMaxima}`);
              console.log(`   - Cantidad actual: ${cantidadActual}`);

              if (cantidadActual > cantidadMaxima) {
                console.log(`🔄 Ajustando de ${cantidadActual} a ${cantidadMaxima}`);

                // Decrementar hasta llegar a la cantidad máxima
                const vecesDecrementar = cantidadActual - cantidadMaxima;
                for (let i = 0; i < vecesDecrementar; i++) {
                  decreaseFromCart({ id: articulo.id ?? 0 });
                }
              }

              // Marcar que se intentó exceder el límite
              setHasAttemptedExceedLimit(true);
            }
          } else {
            console.log(`✅ Sin limitaciones para ${articulo.denominacion}`);
            setHasAttemptedExceedLimit(false);
          }
        } catch (error) {
          console.error('Error en análisis reactivo:', error);
        } finally {
          setIsAnalyzing(false);
          pendingAnalysis.current = false;
        }
      };

      executeAnalysis();
    }
  }, [
    carrito,
    location.pathname,
    articulo.denominacion,
    articulo.id,
    analizarCarrito,
    decreaseFromCart,
  ]);
  const handleIncrease = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (location.pathname === '/carrito') {
      if (isAnalyzing) {
        console.log('⏳ Análisis en curso, esperando...');
        return;
      }

      console.log(`➕ Agregando ${articulo.denominacion} al carrito`);

      // Marcar que hay un análisis pendiente
      pendingAnalysis.current = true;

      try {
        // Agregar al carrito - el useEffect detectará el cambio y hará el análisis
        await addToCarrito(articulo, 1);
        console.log(`✅ Producto agregado, análisis se ejecutará automáticamente`);
      } catch (error) {
        console.error('Error al agregar al carrito:', error);
        pendingAnalysis.current = false;
      }
    } else {
      setCantidadProducto(cantidadProducto + 1);
    }
  };

  const handleDecrease = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    // SIEMPRE limpiar flag cuando se reduce cantidad
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
      // Deshabilitar si:
      // 1. Se está analizando actualmente
      // 2. Se intentó exceder el límite Y actualmente está en el límite
      return Boolean(isAnalyzing || (hasAttemptedExceedLimit && isCurrentlyAtLimit()));
    }
    return false;
  };

  // Función auxiliar para verificar si actualmente está en el límite
  const isCurrentlyAtLimit = (): boolean => {
    const articuloIdStr = (articulo.id ?? 0).toString();
    const limitacionMaxima = limitacionesProduccion[articuloIdStr];
    const cantidadActual = carrito.find((item) => item.id === articulo.id)?.cantidad ?? 0;

    return Boolean(limitacionMaxima && cantidadActual >= limitacionMaxima);
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
              ? 'Analizando disponibilidad...'
              : hasAttemptedExceedLimit
                ? 'Límite alcanzado - No se puede agregar más'
                : `Máximo ${limitacionesProduccion[(articulo.id ?? 0).toString()]} unidades disponibles`
            : undefined
        }
      >
        +
      </button>
    </div>
  );
};

export default BtnCantidadProducto;
