import React, {
  createContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
  useState,
} from 'react';
import type {
  Articulo,
  ArticuloManufacturado,
  AnalisisProduccionResponse,
} from '../../types/Articulo';
import { useProductStore } from './ProductProvider';
import { useNotificacion } from '../hooks/useNotificacion';
import { analizarProduccion } from '../services/articuloService';

// Define the state shape - El carrito puede contener cualquier tipo de artículo
interface ArticuloContext extends Articulo {
  cantidad: number;
}

interface State {
  carrito: ArticuloContext[];
}

// Define the context value shape
interface CarritoContextValue {
  carrito: ArticuloContext[];
  addToCarrito: (articulo: Articulo, cantidad: number) => Promise<boolean>; // Devuelve true si se pudo agregar, false si no
  removeFromCart: (articulo: { denominacion: string }) => void;
  decreaseFromCart: (articulo: { id: number }) => void;
  clearCarrito: () => void;
  isProductAvailable: (articulo: Articulo) => Promise<boolean>; // Nueva función para verificar disponibilidad
  isProcessingInBackground: boolean; // Flag para saber si hay procesos en segundo plano
  analizarCarrito: () => Promise<AnalisisProduccionResponse | null>; // Nueva función para analizar todo el carrito
  limitacionesProduccion: Record<number, number>; // ID del producto -> cantidad máxima producible
  ajustarCantidadesCarrito: () => Promise<void>; // Función para ajustar cantidades manualmente
}
// Create the context
export const CarritoContext = createContext<CarritoContextValue | undefined>(undefined);

// Función para limpiar carrito con productos de estructura antigua
const limpiarCarritoAntiguo = (): ArticuloContext[] => {
  try {
    const carritoGuardado = localStorage.getItem('carrito');
    if (!carritoGuardado) return [];

    const carrito = JSON.parse(carritoGuardado) as any[];

    // Filtrar productos que tienen la estructura correcta
    const carritoLimpio = carrito.filter((item) => {
      // Verificar que tiene las propiedades básicas necesarias
      return (
        item.id &&
        item.denominacion &&
        item.precioVenta &&
        typeof item.cantidad === 'number' &&
        !item.nombre
      ); // Excluir productos con estructura antigua que tienen 'nombre' en lugar de 'denominacion'
    });

    return carritoLimpio;
  } catch (error) {
    console.error('Error al limpiar carrito:', error);
    return [];
  }
};

// Define the initial state
const initialState: State = {
  carrito: limpiarCarritoAntiguo(),
};

// Define the reducer
const carritoReducer = (state: State, action: any): State => {
  switch (action.type) {
    case 'ADD_TO_CARRITO':
      const existingProductIndex = state.carrito.findIndex(
        (item) => item.id === action.payload.articulo.id
      );

      if (existingProductIndex !== -1) {
        const updatedCarrito = [...state.carrito];
        updatedCarrito[existingProductIndex] = {
          ...updatedCarrito[existingProductIndex],
          cantidad: updatedCarrito[existingProductIndex].cantidad + (action.payload.cantidad ?? 1),
        };
        return { ...state, carrito: updatedCarrito };
      }

      return {
        ...state,
        carrito: [
          ...state.carrito,
          { ...action.payload.articulo, cantidad: action.payload.cantidad ?? 1 },
        ],
      };
    case 'REMOVE_FROM_CARRITO':
      return {
        ...state,
        carrito: state.carrito.filter(
          (articulo) => articulo.denominacion !== action.payload.nombre
        ),
      };
    case 'DECREASE_FROM_CARRITO':
      const articuloIndex = state.carrito.findIndex(
        (articulo) => articulo.id === action.payload.id
      );
      if (articuloIndex !== -1) {
        const updatedCarrito = [...state.carrito];
        if (updatedCarrito[articuloIndex].cantidad > 1) {
          updatedCarrito[articuloIndex] = {
            ...updatedCarrito[articuloIndex],
            cantidad: updatedCarrito[articuloIndex].cantidad - 1,
          };
        } else {
          updatedCarrito.splice(articuloIndex, 1);
        }
        return {
          ...state,
          carrito: updatedCarrito,
        };
      }
      return state;
    case 'CLEAR_CARRITO':
      return { ...state, carrito: [] };
    case 'ADJUST_QUANTITIES':
      // Ajustar cantidades basado en limitaciones de producción
      // Solo para productos manufacturados, no para insumos
      const updatedCarritoWithLimits = state.carrito.map((item) => {
        const limitacion = action.payload.limitaciones[item.id];
        const esManufacturado = isArticuloManufacturado(item);

        // Solo ajustar cantidades automáticamente para productos manufacturados
        if (limitacion && item.cantidad > limitacion && esManufacturado) {
          return { ...item, cantidad: limitacion };
        }
        return item;
      });
      return { ...state, carrito: updatedCarritoWithLimits };
    default:
      return state;
  }
};

/**
 * Determina si un artículo es de tipo ArticuloManufacturado
 */
const isArticuloManufacturado = (articulo: Articulo): articulo is ArticuloManufacturado => {
  return 'categoriaId' in articulo && 'descripcion' in articulo;
};

/**
 * Determina si un artículo es de tipo ArticuloInsumo
 */
const isArticuloInsumo = (articulo: any): boolean => {
  return 'stockActual' in articulo && 'esParaElaborar' in articulo;
};

// Define the provider component
export const CarritoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(carritoReducer, initialState);
  const [isProcessingInBackground, setIsProcessingInBackground] = useState(false);
  const [limitacionesProduccion, setLimitacionesProduccion] = useState<Record<number, number>>({});
  const productAvailability = useProductStore((state) => state.productAvailability);
  const checkSingleProductAvailability = useProductStore(
    (state) => state.checkSingleProductAvailability
  );
  const { mostrarNotificacion } = useNotificacion();

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(state.carrito));
  }, [state.carrito]);

  // Función para verificar disponibilidad de un producto
  const isProductAvailable = useCallback(
    async (articulo: Articulo): Promise<boolean> => {
      // Solo verificamos disponibilidad para artículos manufacturados
      if (!isArticuloManufacturado(articulo) || !articulo.id) {
        return true; // Los artículos que no son manufacturados siempre están disponibles
      }

      // Verificar en el estado centralizado primero
      const cachedAvailability = productAvailability[articulo.id];
      if (cachedAvailability !== undefined) {
        return cachedAvailability;
      }

      // Si no está en el caché, verificar y actualizar
      setIsProcessingInBackground(true);
      try {
        await checkSingleProductAvailability(articulo.id);
        // Obtener el resultado actualizado
        const updatedAvailability = useProductStore.getState().productAvailability[articulo.id];
        return updatedAvailability ?? false;
      } finally {
        setIsProcessingInBackground(false);
      }
    },
    [productAvailability, checkSingleProductAvailability]
  );

  // Función para verificar disponibilidad en background y notificar si no hay stock
  const verifyAvailabilityInBackground = useCallback(
    async (articulo: Articulo): Promise<void> => {
      if (!isArticuloManufacturado(articulo) || !articulo.id) return;

      setIsProcessingInBackground(true);
      try {
        await checkSingleProductAvailability(articulo.id);
        const updatedAvailability = useProductStore.getState().productAvailability[articulo.id];

        if (!updatedAvailability) {
          // Si no hay disponibilidad, quitar del carrito y notificar
          mostrarNotificacion(
            `No hay suficientes insumos para ${articulo.denominacion}. Se ha removido del carrito.`,
            'error',
            5000
          );

          // Remover del carrito
          dispatch({
            type: 'REMOVE_FROM_CARRITO',
            payload: { nombre: articulo.denominacion },
          });
        }
      } catch (error) {
        console.error('Error verificando disponibilidad en background:', error);
      } finally {
        setIsProcessingInBackground(false);
      }
    },
    [checkSingleProductAvailability, mostrarNotificacion]
  );

  // Modificamos addToCarrito para que devuelva una promesa con el resultado
  const addToCarrito = useCallback(
    async (articulo: Articulo, cantidad: number = 1): Promise<boolean> => {
      // Agregar al carrito inmediatamente (estrategia optimista)
      dispatch({ type: 'ADD_TO_CARRITO', payload: { articulo, cantidad } });

      // Verificar disponibilidad en segundo plano
      verifyAvailabilityInBackground(articulo);

      return true; // Siempre retornamos true para la estrategia optimista
    },
    [verifyAvailabilityInBackground]
  );

  const removeFromCart = useCallback((articulo: { denominacion: string }) => {
    dispatch({ type: 'REMOVE_FROM_CARRITO', payload: { nombre: articulo.denominacion } });
  }, []);

  const decreaseFromCart = useCallback((articulo: { id: number }) => {
    dispatch({ type: 'DECREASE_FROM_CARRITO', payload: articulo });
  }, []);

  const clearCarrito = useCallback(() => {
    dispatch({ type: 'CLEAR_CARRITO' });
    localStorage.removeItem('carrito');
  }, []);

  // Función para analizar todo el carrito con el nuevo endpoint
  const analizarCarrito = useCallback(async (): Promise<AnalisisProduccionResponse | null> => {
    // Filtrar productos manufacturados del carrito
    const productosManufacturados = state.carrito.filter(
      (item) => isArticuloManufacturado(item) && item.id
    );

    // Filtrar productos insumos del carrito
    const productosInsumos = state.carrito.filter((item) => isArticuloInsumo(item) && item.id);

    // Combinar todos los productos para análisis
    const todosLosProductos = [...productosManufacturados, ...productosInsumos];

    if (todosLosProductos.length === 0) {
      return null; // No hay productos para analizar
    }

    try {
      setIsProcessingInBackground(true);

      const articulosParaAnalizar = todosLosProductos.map((item) => ({
        articuloId: item.id,
        cantidad: item.cantidad,
      }));

      const analisis = await analizarProduccion(articulosParaAnalizar);

      // Limpiar limitaciones existentes primero
      const nuevasLimitaciones: Record<string, number> = {};

      // Solo agregar limitaciones para productos que realmente tienen problemas
      if (analisis.productosConProblemas && analisis.productosConProblemas.length > 0) {
        analisis.productosConProblemas.forEach((problema: any) => {
          nuevasLimitaciones[problema.id.toString()] = problema.cantidadProducible;
        });
      }

      // Para insumos, agregar limitaciones si la cantidad en carrito excede o iguala el stock
      productosInsumos.forEach((insumo) => {
        const stockActual = (insumo as any).stockActual;
        if (stockActual !== undefined && insumo.cantidad >= stockActual) {
          nuevasLimitaciones[insumo.id.toString()] = stockActual;
        }
      });

      // IMPORTANTE: También establecer limitaciones para productos que alcanzaron su límite exacto
      // Esto ayuda a deshabilitar el botón + cuando se alcanza el límite después de un ajuste
      state.carrito.forEach((item) => {
        const limitacionExistente = nuevasLimitaciones[item.id.toString()];
        if (limitacionExistente && item.cantidad === limitacionExistente) {
          // Ya está en el límite exacto, mantener la limitación
          nuevasLimitaciones[item.id.toString()] = limitacionExistente;
        }
      });

      setLimitacionesProduccion(nuevasLimitaciones);

      // Si NO hay productos con problemas, limpiar limitaciones anteriores
      if (analisis.sePuedeProducirCompleto && Object.keys(nuevasLimitaciones).length === 0) {
        // Ya se establecieron las limitaciones vacías arriba, no necesitamos hacer nada más
      }

      // Si hay productos con problemas, ajustar cantidades automáticamente
      if (!analisis.sePuedeProducirCompleto && Object.keys(nuevasLimitaciones).length > 0) {
        dispatch({
          type: 'ADJUST_QUANTITIES',
          payload: { limitaciones: nuevasLimitaciones },
        });
      }

      return analisis;
    } catch (error) {
      console.error('Error al analizar carrito:', error);
      mostrarNotificacion('Error al verificar disponibilidad del carrito', 'error', 3000);
      return null;
    } finally {
      setIsProcessingInBackground(false);
    }
  }, [state.carrito, mostrarNotificacion]);

  // Función para ajustar cantidades manualmente basado en limitaciones actuales
  const ajustarCantidadesCarrito = useCallback(async (): Promise<void> => {
    if (Object.keys(limitacionesProduccion).length > 0) {
      dispatch({
        type: 'ADJUST_QUANTITIES',
        payload: { limitaciones: limitacionesProduccion },
      });
    }
  }, [limitacionesProduccion, mostrarNotificacion]);

  return (
    <CarritoContext.Provider
      value={{
        carrito: state.carrito,
        addToCarrito,
        removeFromCart,
        decreaseFromCart,
        clearCarrito,
        isProductAvailable,
        isProcessingInBackground,
        analizarCarrito,
        limitacionesProduccion,
        ajustarCantidadesCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
