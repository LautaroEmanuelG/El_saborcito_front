import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Usuario } from '../../types/Usuario';
import { logout as authLogout } from '../services/authService';
import { useAuth0 } from '@auth0/auth0-react';

interface UserContextType {
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
  logout: () => void;
  actualizarUltimaActividad: () => void;
  ultimaActividad: Date;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

const USER_STORAGE_KEY = 'user';
const ULTIMA_ACTIVIDAD_KEY = 'ultimaActividad';

export const UserProvider = ({ children }: UserProviderProps) => {
  const { logout: auth0Logout, isAuthenticated: isAuth0Authenticated } = useAuth0();
  const [user, setUserState] = useState<Usuario | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [ultimaActividad, setUltimaActividad] = useState<Date>(() => {
    const stored = localStorage.getItem(ULTIMA_ACTIVIDAD_KEY);
    return stored ? new Date(stored) : new Date();
  });

  const logout = useCallback(() => {
    // Limpiar datos del usuario local
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ULTIMA_ACTIVIDAD_KEY);
    setUserState(null);

    // Si el usuario está autenticado con Auth0, hacer logout de Auth0
    if (isAuth0Authenticated) {
      // No hacer redirección manual, Auth0 se encarga
      authLogout(true); // skipRedirect = true
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    } else {
      // Para usuarios no-Auth0, usar logout normal con redirección
      authLogout(false);
    }
  }, [auth0Logout, isAuth0Authenticated]);

  const setUser = useCallback((usuario: Usuario | null) => {
    setUserState(usuario);
    const ahora = new Date();
    setUltimaActividad(ahora);

    if (usuario) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
      localStorage.setItem(ULTIMA_ACTIVIDAD_KEY, ahora.toISOString());
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(ULTIMA_ACTIVIDAD_KEY);
    }
  }, []);

  const actualizarUltimaActividad = useCallback(() => {
    const ahora = new Date();
    setUltimaActividad(ahora);
    localStorage.setItem(ULTIMA_ACTIVIDAD_KEY, ahora.toISOString());
  }, []);

  // Auto logout por inactividad de 45 minutos
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const ahora = new Date();
      const tiempoInactividad = (ahora.getTime() - ultimaActividad.getTime()) / (1000 * 60); // minutos

      // Verificar inactividad (45 minutos para clientes)
      if (tiempoInactividad > 45) {
        logout();
        return;
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [user, ultimaActividad, logout]); // Sincronizar con el sistema de autenticación - solo observar, no limpiar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email'); // Corregido: usar 'email' en lugar de 'userEmail'

    // Solo informar si hay inconsistencias, pero NO hacer logout automático
    if (user && (!token || !storedEmail)) {
      console.warn('⚠️ Inconsistencia detectada en autenticación:', {
        hasUser: !!user,
        hasToken: !!token,
        hasEmail: !!storedEmail,
      });
      // NO hacer logout automático - dejar que el usuario o el sistema lo maneje
    }
  }, [user]);

  const value: UserContextType = {
    user,
    setUser,
    logout,
    actualizarUltimaActividad,
    ultimaActividad,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};
