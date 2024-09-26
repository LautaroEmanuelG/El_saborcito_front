import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import type { Producto, ProductoCarrito } from '../../utils/types';

// Define the state shape
interface State {
  carrito: ProductoCarrito[];
}

// Define the context value shape
interface CarritoContextValue {
  carrito: ProductoCarrito[];
  addToCarrito: (producto: Producto, cantidad: number) => void;
  removeFromCart: (producto: { nombre: string }) => void;
  decreaseFromCart: (producto: { id: number }) => void;
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
        item => item.id === action.payload.producto.id
      );

      if (existingProductIndex !== -1) {
        const updatedCarrito = [...state.carrito];
        console.log('Updatede para sumar', updatedCarrito);
        console.log('Cantidad a sumar', action.payload.cantidad);
        updatedCarrito[existingProductIndex].quantity +=
          action.payload.cantidad;
        return { ...state, carrito: updatedCarrito };
      }

      console.log('Updatede para agregar', state.carrito);
      return {
        ...state,
        carrito: [
          ...state.carrito,
          { ...action.payload.producto, quantity: action.payload.cantidad },
        ],
      };
    case 'REMOVE_FROM_CARRITO':
      if (!action.payload || !action.payload.id) {
        console.error(
          'REMOVE_FROM_CARRITO action payload is invalid:',
          action.payload
        );
        return state;
      }
      return {
        ...state,
        carrito: state.carrito.filter(
          product => product.nombre !== action.payload.nombre
        ),
      };
    case 'DECREASE_FROM_CARRITO':
      if (!action.payload || !action.payload.nombre) {
        console.error(
          'DECREASE_FROM_CARRITO action payload is invalid:',
          action.payload
        );
        return state;
      }
      const productIndex = state.carrito.findIndex(
        product => product.id === action.payload.id
      );
      if (productIndex !== -1) {
        const updatedCarrito = [...state.carrito];
        if (updatedCarrito[productIndex].quantity > 1) {
          updatedCarrito[productIndex].quantity -= 1;
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

  const addToCarrito = (producto: Producto, cantidad: number = 1) => {
    dispatch({ type: 'ADD_TO_CARRITO', payload: { producto, cantidad } });
  };

  const removeFromCart = (producto: { nombre: string }) => {
    dispatch({ type: 'REMOVE_FROM_CARRITO', payload: producto });
  };

  const decreaseFromCart = (producto: { id: number }) => {
    dispatch({ type: 'DECREASE_FROM_CARRITO', payload: producto });
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
