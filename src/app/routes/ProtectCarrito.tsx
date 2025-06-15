import { Navigate } from 'react-router-dom';

import { ReactNode } from 'react';
import { useCart } from '../../shared/hooks/useCart';

const ProtectedCarrito = ({ children }: { children: ReactNode }) => {
  const { carrito, promocionesEnCarrito } = useCart();

  // Verificar si hay productos o promociones en el carrito
  const tieneItems = carrito.length > 0 || promocionesEnCarrito.length > 0;

  return tieneItems ? children : <Navigate to="/" />;
};

export default ProtectedCarrito;
