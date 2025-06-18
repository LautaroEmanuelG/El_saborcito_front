// src/shared/components/VercelAdminGuard.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import { UnauthorizedAccess } from './UnauthorizedAccess';
import { Rol } from '../../types/Rol';

interface VercelAdminGuardProps {
  children: React.ReactNode;
  requiredRoles: Rol[];
}

/**
 * 🛡️ **GUARD ESPECÍFICO PARA RUTAS ADMIN EN VERCEL**
 * Maneja la carga progresiva y validación de permisos
 * con timing optimizado para el entorno de Vercel
 */
export const VercelAdminGuard = ({ children, requiredRoles }: VercelAdminGuardProps) => {
  const { rol, isLoading, isAuthenticated, hasRole } = useAuth();
  const [isVercelLoading, setIsVercelLoading] = useState(true);
  const [authAttempts, setAuthAttempts] = useState(0);

  useEffect(() => {
    // 🔄 **SISTEMA DE REINTENTOS PARA VERCEL**
    const maxAttempts = 5; // Aumentado para Vercel
    const baseDelay = 800; // Reducido para mejor UX

    const checkAuth = () => {
      console.log('🔍 VercelAdminGuard - Checking auth:', {
        isLoading,
        isAuthenticated,
        rol,
        authAttempts,
        hasRoleCheck: rol ? hasRole(requiredRoles) : false,
      });

      if (!isLoading) {
        if (isAuthenticated && rol && hasRole(requiredRoles)) {
          console.log('✅ VercelAdminGuard - Auth successful');
          setIsVercelLoading(false);
        } else if (authAttempts < maxAttempts) {
          // Reintentar con delay exponencial
          const retryDelay = baseDelay * Math.pow(1.5, authAttempts);
          console.log(
            `🔄 VercelAdminGuard - Retry ${authAttempts + 1}/${maxAttempts} in ${retryDelay}ms`
          );
          setTimeout(() => {
            setAuthAttempts((prev) => prev + 1);
          }, retryDelay);
        } else {
          // Máximo de intentos alcanzado
          console.log('⏰ VercelAdminGuard - Max attempts reached');
          setIsVercelLoading(false);
        }
      }
    };

    const timer = setTimeout(checkAuth, 300);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, rol, authAttempts, hasRole, requiredRoles]);

  // 🔄 **LOADING STATE**
  if (isLoading || isVercelLoading) {
    return (
      <LoadingSpinner
        message="🔐 Verificando permisos de administrador..."
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
