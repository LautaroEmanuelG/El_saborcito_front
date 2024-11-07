import { Navigate } from 'react-router-dom';

import { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = localStorage.getItem('rol') === 'Admin'; // Verifica si el rol es Admin

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;