// src/app/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import React, { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[]; // e.g. ['ADMIN', 'CAJERO']
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const rol = localStorage.getItem('rol'); // o lo que extraigas de tu servicio

  if (!rol || !allowedRoles.includes(rol)) {
    // redirigir a home si no está autorizado
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
