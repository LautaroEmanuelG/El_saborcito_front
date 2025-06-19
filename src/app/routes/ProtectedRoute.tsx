// src/app/routes/ProtectedRoute.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Rol } from '../../types/Rol';
import { useAuth } from '../../shared/hooks/useAuth';
import { useEmpleado } from '../../shared/providers/EmpleadoProvider';
import { UnauthorizedAccess } from '../../shared/components/UnauthorizedAccess';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Rol[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rol, isLoading, isAuthenticated, hasRole } = useAuth();
  const { empleadoAutenticado } = useEmpleado();
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  // 🚀 **LÓGICA HÍBRIDA: DETECTAR EMPLEADOS Y CLIENTES**
  const isEmployeeAuthenticated = !!empleadoAutenticado;
  const empleadoRol = empleadoAutenticado?.rol;

  // Determinar autenticación y rol final
  const finalIsAuthenticated = isAuthenticated || isEmployeeAuthenticated;
  const finalRol = empleadoRol || rol;
  const finalHasRole = finalRol ? allowedRoles.includes(finalRol as Rol) : false;

  useEffect(() => {
    if (!isLoading && finalIsAuthenticated && finalRol && !finalHasRole) {
      setShowUnauthorized(true);
    } else {
      setShowUnauthorized(false);
    }
  }, [isLoading, finalIsAuthenticated, finalRol, allowedRoles, finalHasRole]);

  // Función para volver a la ruta anterior
  const handleGoBack = () => {
    navigate(-1); // Navegar hacia atrás en el historial
  };

  // ⏳ **MOSTRAR LOADING - YA MANEJADO POR VercelLoadingHandler**
  if (isLoading) {
    return (
      <LoadingSpinner
        message="🔐 Verificando permisos de acceso..."
        size="large"
        fullScreen={true}
      />
    );
  }

  // 🚫 **REDIRIGIR SI NO ESTÁ AUTENTICADO (EMPLEADO O CLIENTE)**
  if (!finalIsAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si no tiene el rol apropiado, mostrar componente de acceso no autorizado
  if (showUnauthorized) {
    return (
      <UnauthorizedAccess
        message={`Tu perfil actual (${finalRol}) no tiene permisos para acceder a esta sección.`}
        requiredRoles={allowedRoles}
        onGoBack={handleGoBack}
      />
    );
  }

  // Si tiene permisos, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;
