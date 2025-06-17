import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { EmpleadoDTO } from '../../modules/HU4_Registro_Empleado/model';
import { getAllEmpleados, cambiarEstadoEmpleado } from '../services/empleadoService';

interface EmpleadoContextType {
  empleados: EmpleadoDTO[];
  loading: boolean;
  error: string | null;
  cargarEmpleados: () => Promise<void>;
  actualizarEstadoEmpleado: (id: number, estado: boolean) => Promise<void>;
  agregarEmpleado: (empleado: EmpleadoDTO) => void;
  setEmpleados: (empleados: EmpleadoDTO[]) => void;
}

const EmpleadoContext = createContext<EmpleadoContextType | undefined>(undefined);

interface EmpleadoProviderProps {
  children: ReactNode;
}

export const EmpleadoProvider: React.FC<EmpleadoProviderProps> = ({ children }) => {
  const [empleados, setEmpleados] = useState<EmpleadoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const value: EmpleadoContextType = {
    empleados,
    loading,
    error,
    cargarEmpleados,
    actualizarEstadoEmpleado,
    agregarEmpleado,
    setEmpleados,
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
