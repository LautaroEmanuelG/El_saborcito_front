import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Usuario } from '../../types/Usuario';
import { logout as authLogout } from '../services/authService';

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
  const [user, setUserState] = useState<Usuario | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [ultimaActividad, setUltimaActividad] = useState<Date>(() => {
    const stored = localStorage.getItem(ULTIMA_ACTIVIDAD_KEY);
    return stored ? new Date(stored) : new Date();
  });

  const logout = useCallback(() => {
    // Limpiar datos del usuario (pero NO el token - eso lo hace authLogout)
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ULTIMA_ACTIVIDAD_KEY);
    setUserState(null);

    // Usar la función de logout centralizada que maneja token y rol
    authLogout();

    // Auth0 logout se hace en authLogout, no aquí para evitar conflictos
  }, []);

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
