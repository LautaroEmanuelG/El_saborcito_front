import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { Empleado } from '../../modules/HU5_Login_Empleado/model';

interface AuthEmpleadoContextType {
  empleado: Empleado | null;
  isAuthenticated: boolean;
  loading: boolean;
  setEmpleado: (empleado: Empleado | null) => void;
  logout: () => void;
  actualizarUltimaActividad: () => void;
  ultimaActividad: Date;
}

const AuthEmpleadoContext = createContext<AuthEmpleadoContextType | undefined>(undefined);

interface AuthEmpleadoProviderProps {
  children: ReactNode;
}

export const AuthEmpleadoProvider: React.FC<AuthEmpleadoProviderProps> = ({ children }) => {
  const [empleado, setEmpleadoState] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(true);
  const [ultimaActividad, setUltimaActividad] = useState<Date>(new Date());

  const setEmpleado = useCallback((nuevoEmpleado: Empleado | null) => {
    setEmpleadoState(nuevoEmpleado);
    if (nuevoEmpleado) {
      setUltimaActividad(new Date());
    }
  }, []);

  const logout = useCallback(() => {
    setEmpleadoState(null);
    localStorage.removeItem('empleadoToken');
    localStorage.removeItem('empleadoData');
  }, []);

  const actualizarUltimaActividad = useCallback(() => {
    setUltimaActividad(new Date());
  }, []);

  // Verificar si hay datos de empleado guardados al cargar
  useEffect(() => {
    const token = localStorage.getItem('empleadoToken');
    const empleadoData = localStorage.getItem('empleadoData');

    if (token && empleadoData) {
      try {
        const empleadoParsed = JSON.parse(empleadoData);
        setEmpleadoState(empleadoParsed);
      } catch (error) {
        console.error('Error al parsear datos de empleado:', error);
        logout();
      }
    }
    setLoading(false);
  }, [logout]);

  // Guardar datos del empleado en localStorage cuando cambie
  useEffect(() => {
    if (empleado) {
      localStorage.setItem('empleadoData', JSON.stringify(empleado));
    } else {
      localStorage.removeItem('empleadoData');
    }
  }, [empleado]);

  // Auto logout por inactividad y horario
  useEffect(() => {
    if (!empleado) return;

    const interval = setInterval(() => {
      const ahora = new Date();
      const tiempoInactividad = (ahora.getTime() - ultimaActividad.getTime()) / (1000 * 60); // minutos
      const horaActual = ahora.getHours();

      // Verificar inactividad (30 minutos)
      if (tiempoInactividad > 30) {
        console.log('Sesión cerrada por inactividad');
        logout();
        return;
      }

      // Verificar horario de atención (ejemplo: 8:00 - 22:00)
      if (horaActual < 8 || horaActual > 22) {
        console.log('Sesión cerrada por horario');
        logout();
        return;
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [empleado, ultimaActividad, logout]);

  const value: AuthEmpleadoContextType = {
    empleado,
    isAuthenticated: !!empleado,
    loading,
    setEmpleado,
    logout,
    actualizarUltimaActividad,
    ultimaActividad,
  };

  return <AuthEmpleadoContext.Provider value={value}>{children}</AuthEmpleadoContext.Provider>;
};

export const useAuthEmpleado = () => {
  const context = useContext(AuthEmpleadoContext);
  if (context === undefined) {
    throw new Error('useAuthEmpleado debe ser usado dentro de un AuthEmpleadoProvider');
  }
  return context;
};
