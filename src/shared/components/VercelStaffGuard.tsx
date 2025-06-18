// src/shared/components/VercelStaffGuard.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import { UnauthorizedAccess } from './UnauthorizedAccess';
import { Rol } from '../../types/Rol';

interface VercelStaffGuardProps {
  children: React.ReactNode;
  requiredRoles: Rol[];
}

/**
 * 🛡️ **GUARD ESPECÍFICO PARA RUTAS DE STAFF EN VERCEL**
 * Versión optimizada para roles de staff (cajero, delivery, cocinero)
 */
export const VercelStaffGuard = ({ children, requiredRoles }: VercelStaffGuardProps) => {
  const { rol, isLoading, isAuthenticated, hasRole } = useAuth();
  const [isVercelLoading, setIsVercelLoading] = useState(true);
  const [authAttempts, setAuthAttempts] = useState(0);

  useEffect(() => {
    // 🔄 **SISTEMA DE REINTENTOS PARA VERCEL - STAFF**
    const maxAttempts = 4;
    const baseDelay = 600;

    const checkAuth = () => {
      console.log('🔍 VercelStaffGuard - Checking auth:', {
        isLoading,
        isAuthenticated,
        rol,
        authAttempts,
        requiredRoles,
        hasRoleCheck: rol ? hasRole(requiredRoles) : false,
      });

      if (!isLoading) {
        if (isAuthenticated && rol && hasRole(requiredRoles)) {
          console.log('✅ VercelStaffGuard - Auth successful for staff role');
          setIsVercelLoading(false);
        } else if (authAttempts < maxAttempts) {
          const retryDelay = baseDelay * Math.pow(1.3, authAttempts);
          console.log(
            `🔄 VercelStaffGuard - Retry ${authAttempts + 1}/${maxAttempts} in ${retryDelay}ms`
          );
          setTimeout(() => {
            setAuthAttempts((prev) => prev + 1);
          }, retryDelay);
        } else {
          console.log('⏰ VercelStaffGuard - Max attempts reached');
          setIsVercelLoading(false);
        }
      }
    };

    const timer = setTimeout(checkAuth, 200);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, rol, authAttempts, hasRole, requiredRoles]);

  // 🔄 **LOADING STATE**
  if (isLoading || isVercelLoading) {
    return (
      <LoadingSpinner
        message="🔐 Verificando permisos de staff..."
        size="large"
        fullScreen={true}
      />
    );
  }

  // 🚫 **NO AUTENTICADO**
  if (!isAuthenticated) {
    return (
      <UnauthorizedAccess
        message="Debes iniciar sesión para acceder a esta sección"
        onGoBack={() => window.history.back()}
      />
    );
  }

  // 🚫 **SIN PERMISOS**
  if (!hasRole(requiredRoles)) {
    return (
      <UnauthorizedAccess
        message={`Tu rol actual (${rol}) no tiene permisos para acceder a esta sección`}
        requiredRoles={requiredRoles}
        onGoBack={() => window.history.back()}
      />
    );
  }

  // ✅ **ACCESO AUTORIZADO**
  return <>{children}</>;
};
