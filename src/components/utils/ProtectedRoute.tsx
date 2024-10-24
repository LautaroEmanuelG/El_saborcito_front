import { Navigate } from 'react-router-dom';

import { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = true; // Aquí deberías verificar si el usuario está autenticado

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;