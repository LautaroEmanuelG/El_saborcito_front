// src/app/routes/ProtectedRoute.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Rol } from '../../types/Rol';
import { useAuth } from '../../shared/hooks/useAuth';
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
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && rol && !hasRole(allowedRoles)) {
      setShowUnauthorized(true);
    } else {
      setShowUnauthorized(false);
    }
  }, [isLoading, isAuthenticated, rol, allowedRoles, hasRole]);

  // Función para volver a la ruta anterior
  const handleGoBack = () => {
    navigate(-1); // Navegar hacia atrás en el historial
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <LoadingSpinner message="Verificando permisos de acceso..." size="large" fullScreen={true} />
    );
  }

  // Si no está autenticado, redirigir al home
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si no tiene el rol apropiado, mostrar componente de acceso no autorizado
  if (showUnauthorized) {
    return (
      <UnauthorizedAccess
        message={`Tu perfil actual (${rol}) no tiene permisos para acceder a esta sección.`}
        requiredRoles={allowedRoles}
        onGoBack={handleGoBack}
      />
    );
  }

  // Si tiene permisos, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;
