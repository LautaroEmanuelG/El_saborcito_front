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
    // 🎯 **DETECTAR RUTAS QUE NECESITAN MÁS TIEMPO EN VERCEL**
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isEmployeeRoute = location.pathname.startsWith('/empleado');
    const isProtectedRoute =
      location.pathname !== '/' &&
      location.pathname !== '/carrito' &&
      location.pathname !== '/callback' &&
      location.pathname !== '/pedido-exitoso';

    if (isAdminRoute || isEmployeeRoute || isProtectedRoute) {
      setShowExtendedLoading(true);

      // ⏱️ **TIMEOUT ESPECÍFICO PARA CADA TIPO DE RUTA EN VERCEL**
      let delay = 1000; // Default para rutas protegidas

      if (isAdminRoute) {
        delay = 2500; // Más tiempo para rutas admin que requieren autenticación compleja
      } else if (isEmployeeRoute) {
        delay = 1500; // Tiempo moderado para empleados
      } else if (location.pathname === '/perfil') {
        delay = 800; // Menos tiempo para perfil de cliente
      }

      const timer = setTimeout(() => {
        setShowExtendedLoading(false);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setShowExtendedLoading(false);
    }
  }, [location.pathname]);
  // 🔄 **MOSTRAR LOADING EXTENDIDO PARA VERCEL**
  if (isAuthLoading || showExtendedLoading) {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isEmployeeRoute = location.pathname.startsWith('/empleado');

    let message = '⚡ Inicializando aplicación...';

    if (isAdminRoute) {
      message = '🔐 Verificando permisos de administrador...';
    } else if (isEmployeeRoute) {
      message = '👨‍💼 Cargando perfil de empleado...';
    } else if (location.pathname === '/perfil') {
      message = '👤 Cargando perfil de usuario...';
    }

    return <LoadingSpinner message={message} size="large" fullScreen={true} />;
  }

  return <>{children}</>;
};
