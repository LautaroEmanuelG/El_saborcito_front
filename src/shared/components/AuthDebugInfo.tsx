// src/shared/components/AuthDebugInfo.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../providers/UserProvider';
import { useEmpleado } from '../providers/EmpleadoProvider';
import { useAuth } from '../hooks/useAuth';

export const AuthDebugInfo = () => {
  const {
    isAuthenticated: isAuth0Authenticated,
    user: auth0User,
    logout: auth0Logout,
    error: auth0Error,
  } = useAuth0();
  const { user, logout: userLogout } = useUser();
  const { empleadoAutenticado, logoutEmpleado } = useEmpleado();
  const { rol, email, isAuthenticated: hasToken } = useAuth();

  const handleForceLogout = () => {
    console.log('🔧 Forzando logout completo...');

    // Limpiar todo el localStorage
    localStorage.clear();

    // Logout de todos los sistemas
    try {
      userLogout();
    } catch (e) {
      console.error('Error en userLogout:', e);
    }

    try {
      logoutEmpleado();
    } catch (e) {
      console.error('Error en logoutEmpleado:', e);
    }

    try {
      if (isAuth0Authenticated) {
        auth0Logout({
          logoutParams: {
            returnTo: window.location.origin,
          },
        });
      }
    } catch (e) {
      console.error('Error en auth0Logout:', e);
    }

    // Redirección forzada como último recurso
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  if (import.meta.env.PROD) return null; // Solo en desarrollo

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs z-50">
      <h4 className="font-bold mb-2">🔍 Estado de Autenticación</h4>

      <div className="space-y-1">
        <div>
          <strong>Auth0:</strong> {isAuth0Authenticated ? '✅' : '❌'}
        </div>
        <div>
          <strong>Usuario App:</strong> {user ? '✅' : '❌'}
        </div>
        <div>
          <strong>Empleado:</strong> {empleadoAutenticado ? '✅' : '❌'}
        </div>
        <div>
          <strong>Token válido:</strong> {hasToken ? '✅' : '❌'}
        </div>
        <div>
          <strong>Rol:</strong> {rol || 'Sin rol'}
        </div>
        <div>
          <strong>Email:</strong> {email || 'Sin email'}
        </div>
      </div>

      {auth0Error && (
        <div className="mt-2 p-2 bg-red-600 rounded">
          <strong>Error Auth0:</strong> {auth0Error.message}
        </div>
      )}

      <div className="mt-3 space-y-1">
        <button
          onClick={handleForceLogout}
          className="w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          🚨 Forzar Logout Completo
        </button>

        <button
          onClick={() =>
            console.log({
              auth0User,
              user,
              empleadoAutenticado,
              localStorage: { ...localStorage },
            })
          }
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          📋 Log Estado Completo
        </button>
      </div>
    </div>
  );
};
