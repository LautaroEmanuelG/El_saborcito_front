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
import { isPublicRoute } from '../config/routes';

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
    } catch (error) {
      console.error('❌ Error al obtener información de autenticación:', error);
      // Solo limpiar si es un error real de autenticación Y estamos en una ruta protegida
      const currentPath = window.location.pathname;

      if (shouldClearAuth(error) && !isPublicRoute(currentPath)) {
        setAuthInfo(null);
        clearAuthData();
      } else {
        // Para otros errores o rutas públicas, mantener el estado actual
        console.warn('🔄 Error temporal o ruta pública, manteniendo estado actual:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (allowedRoles: Rol[]): boolean => {
    return authInfo !== null && allowedRoles.includes(authInfo.rol);
  };

  useEffect(() => {
    // 🚀 **LÓGICA OPTIMIZADA PARA VERCEL**
    const currentPath = window.location.pathname;

    // Agregar delay adicional en rutas admin para Vercel
    const isAdminRoute = currentPath.startsWith('/admin');
    const delay = isAdminRoute ? 1500 : 500; // Más tiempo para rutas admin

    const timer = setTimeout(() => {
      if (!isPublicRoute(currentPath) || isAuthenticated()) {
        refreshAuth();
      } else {
        // En rutas públicas sin token, solo marcar como no cargando
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
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
