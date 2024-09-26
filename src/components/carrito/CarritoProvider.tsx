import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import type { Producto, ProductoCarrito } from '../../utils/types';

// Define the state shape
interface State {
  carrito: ProductoCarrito[];
}

// Define the context value shape
interface CarritoContextValue {
  carrito: ProductoCarrito[];
  addToCarrito: (producto: Producto) => void;
  removeFromCart: (producto: { nombre: string }) => void;
  decreaseFromCart: (producto: { nombre: string }) => void;
  clearCarrito: () => void;
}

// Create the context
export const CarritoContext = createContext<CarritoContextValue | undefined>(
  undefined
);

// Define the initial state
const initialState: State = {
  carrito: JSON.parse(localStorage.getItem('carrito') || '[]'),
};

// Define the reducer
const carritoReducer = (state: State, action: any): State => {
  switch (action.type) {
    case 'ADD_TO_CARRITO':
      const existingProductIndex = state.carrito.findIndex(
        item => item.nombre === action.payload.nombre
      );
      if (existingProductIndex !== -1) {
        const updatedCarrito = [...state.carrito];
        updatedCarrito[existingProductIndex].quantity += 0.5;
        return { ...state, carrito: updatedCarrito };
      }
      return {
        ...state,
        carrito: [...state.carrito, { ...action.payload, quantity: 1 }],
      };
    case 'REMOVE_FROM_CARRITO':
      return {
        ...state,
        carrito: state.carrito.filter(
          product => product.nombre !== action.payload.nombre
        ),
      };
    case 'DECREASE_FROM_CARRITO':
      const productIndex = state.carrito.findIndex(
        product => product.nombre === action.payload.nombre
      );
      if (productIndex !== -1) {
        const updatedCarrito = [...state.carrito];
        if (updatedCarrito[productIndex].quantity > 1) {
          updatedCarrito[productIndex].quantity -= 0.5;
        } else {
          updatedCarrito.splice(productIndex, 1);
        }
        return {
          ...state,
          carrito: updatedCarrito,
        };
      }
      return state;
    case 'CLEAR_CARRITO':
      return initialState;
    default:
      return state;
  }
};

// Define the provider component
export const CarritoProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(carritoReducer, initialState);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(state.carrito));
  }, [state.carrito]);

  const addToCarrito = (product: Producto) => {
    dispatch({ type: 'ADD_TO_CARRITO', payload: product });
  };

  const removeFromCart = (product: { nombre: string }) => {
    dispatch({ type: 'REMOVE_FROM_CARRITO', payload: product });
  };

  const decreaseFromCart = (product: { nombre: string }) => {
    dispatch({ type: 'DECREASE_FROM_CARRITO', payload: product });
  };

  const clearCarrito = () => {
    dispatch({ type: 'CLEAR_CARRITO' });
  };

  return (
    <CarritoContext.Provider
      value={{
        carrito: state.carrito,
        addToCarrito,
        removeFromCart,
        decreaseFromCart,
        clearCarrito,
      }}>
      {children}
    </CarritoContext.Provider>
  );
};
