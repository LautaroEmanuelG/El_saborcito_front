import React, {
  createContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
  useState,
} from 'react';
import type { Articulo, ArticuloManufacturado } from '../../types/Articulo';
import { useProductStore } from './ProductProvider';
import { useNotificacion } from '../hooks/useNotificacion';

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

// Define the provider component
export const CarritoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(carritoReducer, initialState);
  const [isProcessingInBackground, setIsProcessingInBackground] = useState(false);
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
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
