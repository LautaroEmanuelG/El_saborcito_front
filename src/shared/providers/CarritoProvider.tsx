import React, { createContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import type { Articulo, ArticuloManufacturado } from '../../types/Articulo';
import { useProductAvailability } from '../hooks/useProductAvailability';

// Define the state shape
interface ArticuloContext extends ArticuloManufacturado {
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
}
// Create the context
export const CarritoContext = createContext<CarritoContextValue | undefined>(undefined);

// Define the initial state
const initialState: State = {
  carrito: JSON.parse(localStorage.getItem('carrito') || '[]') as ArticuloContext[],
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
        updatedCarrito[existingProductIndex].cantidad =
          (updatedCarrito[existingProductIndex].cantidad ?? 1) + (action.payload.cantidad ?? 1);
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
          updatedCarrito[articuloIndex].cantidad -= 1;
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

// Define the provider component
export const CarritoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(carritoReducer, initialState);
  const { checkAvailability, isArticuloManufacturado } = useProductAvailability();

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(state.carrito));
  }, [state.carrito]);

  // Función para verificar disponibilidad de un producto
  const isProductAvailable = useCallback(
    async (articulo: Articulo): Promise<boolean> => {
      // Solo verificamos disponibilidad para artículos manufacturados
      if (!isArticuloManufacturado(articulo)) {
        return true; // Los artículos que no son manufacturados siempre están disponibles
      }
      return await checkAvailability(articulo);
    },
    [checkAvailability, isArticuloManufacturado]
  );

  // Modificamos addToCarrito para que devuelva una promesa con el resultado
  const addToCarrito = useCallback(
    async (articulo: Articulo, cantidad: number = 1): Promise<boolean> => {
      // Verificar disponibilidad antes de agregar al carrito
      const available = await isProductAvailable(articulo);

      if (!available) {
        return false; // No se pudo agregar al carrito
      }

      // Si está disponible, agregarlo al carrito
      dispatch({ type: 'ADD_TO_CARRITO', payload: { articulo, cantidad } });
      return true; // Se agregó correctamente
    },
    [isProductAvailable]
  );

  const removeFromCart = useCallback((articulo: { denominacion: string }) => {
    dispatch({ type: 'REMOVE_FROM_CARRITO', payload: articulo });
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
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
