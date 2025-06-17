import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { EmpleadoDTO, ActualizarEmpleadoAdminDTO } from '../../modules/HU4_Registro_Empleado/model';
import {
  getAllEmpleados,
  cambiarEstadoEmpleado,
  updateEmpleado,
} from '../services/empleadoService';
import { Empleado } from '../../modules/HU5_Login_Empleado/model';

interface EmpleadoContextType {
  empleados: EmpleadoDTO[];
  loading: boolean;
  error: string | null;
  cargarEmpleados: () => Promise<void>;
  actualizarEstadoEmpleado: (id: number, estado: boolean) => Promise<void>;
  agregarEmpleado: (empleado: EmpleadoDTO) => void;
  setEmpleados: (empleados: EmpleadoDTO[]) => void;
  actualizarEmpleado: (id: number, data: ActualizarEmpleadoAdminDTO) => Promise<void>;
  // Auth empleados
  empleadoAutenticado: Empleado | null;
  isAuthenticated: boolean;
  setEmpleado: (empleado: Empleado | null) => void;
  logoutEmpleado: () => void;
  actualizarUltimaActividad: () => void;
  ultimaActividad: Date;
}

const EmpleadoContext = createContext<EmpleadoContextType | undefined>(undefined);

interface EmpleadoProviderProps {
  children: ReactNode;
}

export const EmpleadoProvider = ({ children }: EmpleadoProviderProps) => {
  const [empleados, setEmpleados] = useState<EmpleadoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Auth empleados
  const [empleadoAutenticado, setEmpleadoAutenticado] = useState<Empleado | null>(null);
  const [ultimaActividad, setUltimaActividad] = useState<Date>(new Date());

  const cargarEmpleados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllEmpleados();
      setEmpleados(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarEstadoEmpleado = useCallback(async (id: number, estado: boolean) => {
    try {
      const empleadoActualizado = await cambiarEstadoEmpleado(id, estado);
      setEmpleados((prev) => prev.map((emp) => (emp.id === id ? empleadoActualizado : emp)));
    } catch (err: any) {
      throw new Error(err.message || 'Error al cambiar estado del empleado');
    }
  }, []);

  const agregarEmpleado = useCallback((empleado: EmpleadoDTO) => {
    setEmpleados((prev) => [...prev, empleado]);
  }, []);
  const actualizarEmpleado = useCallback(async (id: number, data: ActualizarEmpleadoAdminDTO) => {
    try {
      const empleadoActualizado = await updateEmpleado(id, data);
      setEmpleados((prev) => prev.map((emp) => (emp.id === id ? empleadoActualizado : emp)));
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar el empleado');
    }
  }, []);

  // Funciones de autenticación
  const setEmpleado = useCallback((nuevoEmpleado: Empleado | null) => {
    setEmpleadoAutenticado(nuevoEmpleado);
    if (nuevoEmpleado) {
      setUltimaActividad(new Date());
      localStorage.setItem('empleadoData', JSON.stringify(nuevoEmpleado));
    } else {
      localStorage.removeItem('empleadoData');
    }
  }, []);

  const logoutEmpleado = useCallback(() => {
    setEmpleadoAutenticado(null);
    localStorage.removeItem('empleadoToken');
    localStorage.removeItem('empleadoData');
  }, []);

  const actualizarUltimaActividad = useCallback(() => {
    setUltimaActividad(new Date());
  }, []);

  // Persistencia del empleado autenticado
  useEffect(() => {
    const token = localStorage.getItem('empleadoToken');
    const empleadoData = localStorage.getItem('empleadoData');

    if (token && empleadoData) {
      try {
        const empleadoParsed = JSON.parse(empleadoData);
        setEmpleadoAutenticado(empleadoParsed);
      } catch (error) {
        console.error('Error al parsear datos de empleado:', error);
        logoutEmpleado();
      }
    }
  }, [logoutEmpleado]);

  // Auto logout por inactividad y horario
  useEffect(() => {
    if (!empleadoAutenticado) return;

    const interval = setInterval(() => {
      const ahora = new Date();
      const tiempoInactividad = (ahora.getTime() - ultimaActividad.getTime()) / (1000 * 60); // minutos
      const horaActual = ahora.getHours();

      // Verificar inactividad (30 minutos)
      if (tiempoInactividad > 30) {
        console.log('Sesión de empleado cerrada por inactividad');
        logoutEmpleado();
        return;
      }

      // Verificar horario de atención (ejemplo: 8:00 - 22:00)
      if (horaActual < 8 || horaActual > 22) {
        console.log('Sesión de empleado cerrada por horario');
        logoutEmpleado();
        return;
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [empleadoAutenticado, ultimaActividad, logoutEmpleado]);

  const value: EmpleadoContextType = {
    empleados,
    loading,
    error,
    cargarEmpleados,
    actualizarEstadoEmpleado,
    agregarEmpleado,
    setEmpleados,
    actualizarEmpleado,
    // Auth empleados
    empleadoAutenticado,
    isAuthenticated: !!empleadoAutenticado,
    setEmpleado,
    logoutEmpleado,
    actualizarUltimaActividad,
    ultimaActividad,
  };

  return <EmpleadoContext.Provider value={value}>{children}</EmpleadoContext.Provider>;
};

export const useEmpleado = () => {
  const context = useContext(EmpleadoContext);
  if (context === undefined) {
    throw new Error('useEmpleado debe ser usado dentro de un EmpleadoProvider');
  }
  return context;
};
