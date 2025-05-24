import { Navigate } from 'react-router-dom';

import { ReactNode } from 'react';
import { useCart } from '../../shared/hooks/useCart';

const ProtectedCarrito = ({ children }: { children: ReactNode }) => {
  const { carrito } = useCart();
  console.log('carrito', carrito);
  return carrito.length > 0 ? children : <Navigate to="/" />;
};

export default ProtectedCarrito;
