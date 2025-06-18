import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';

interface VercelLoadingHandlerProps {
  children: React.ReactNode;
  isAuthLoading: boolean;
}

/**
 * 🚀 **COMPONENTE OPTIMIZADO PARA VERCEL**
 * Maneja los tiempos de carga específicos de Vercel
 * donde las rutas necesitan tiempo adicional para resolver
 */
export const VercelLoadingHandler = ({ children, isAuthLoading }: VercelLoadingHandlerProps) => {
  const location = useLocation();
  const [showExtendedLoading, setShowExtendedLoading] = useState(false);

  useEffect(() => {
    // 🎯 **DETECTAR RUTAS ADMIN QUE NECESITAN MÁS TIEMPO EN VERCEL**
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isProtectedRoute =
      location.pathname !== '/' &&
      location.pathname !== '/carrito' &&
      location.pathname !== '/callback' &&
      location.pathname !== '/pedido-exitoso';

    if (isAdminRoute || isProtectedRoute) {
      setShowExtendedLoading(true);

      // ⏱️ **TIMEOUT PROGRESIVO PARA VERCEL**
      const timer = setTimeout(
        () => {
          setShowExtendedLoading(false);
        },
        isAdminRoute ? 2000 : 1000
      );

      return () => clearTimeout(timer);
    } else {
      setShowExtendedLoading(false);
    }
  }, [location.pathname]);

  // 🔄 **MOSTRAR LOADING EXTENDIDO PARA VERCEL**
  if (isAuthLoading || showExtendedLoading) {
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
      <LoadingSpinner
        message={
          isAdminRoute ? '🔐 Cargando panel administrativo...' : '⚡ Inicializando aplicación...'
        }
        size="large"
        fullScreen={true}
      />
    );
  }

  return <>{children}</>;
};
