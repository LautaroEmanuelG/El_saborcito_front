// src/shared/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { Rol, AuthInfo } from '../../types/Rol';
import {
  fetchRol,
  getAuthInfoFromStorage,
  isAuthenticated,
  isFullyAuthenticated,
  clearAuthData,
  shouldClearAuth,
  logout as authLogout,
} from '../services/authService';

interface UseAuthReturn {
  rol: Rol | null;
  email: string | null;
  authInfo: AuthInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isFullyAuthenticated: boolean;
  hasRole: (allowedRoles: Rol[]) => boolean;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(getAuthInfoFromStorage());
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async (): Promise<void> => {
    // Verificar si hay token básico primero
    if (!isAuthenticated()) {
      setAuthInfo(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const newAuthInfo = await fetchRol();
      setAuthInfo(newAuthInfo);
      console.log(`🔐 Usuario autenticado: ${newAuthInfo.email} con rol ${newAuthInfo.rol}`);
    } catch (error) {
      console.error('❌ Error al obtener información de autenticación:', error);
      // Solo limpiar si es un error real de autenticación
      if (shouldClearAuth(error)) {
        console.log('🧹 Limpiando autenticación por error crítico');
        setAuthInfo(null);
        clearAuthData();
      } else {
        // Para otros errores, mantener el estado actual
        console.warn('🔄 Error temporal, manteniendo estado actual:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (allowedRoles: Rol[]): boolean => {
    return authInfo !== null && allowedRoles.includes(authInfo.rol);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return {
    rol: authInfo?.rol || null,
    email: authInfo?.email || null,
    authInfo,
    isLoading,
    isAuthenticated: isAuthenticated(),
    isFullyAuthenticated: isFullyAuthenticated(),
    hasRole,
    logout: authLogout, // Usar la función centralizada
    refreshAuth,
  };
};
