import { ReactNode } from 'react';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { useUser } from '../providers/UserProvider';
import { useEmpleado } from '../providers/EmpleadoProvider';

interface ActivityTrackerProps {
  children: ReactNode;
}

export const ActivityTracker = ({ children }: ActivityTrackerProps) => {
  const { user, actualizarUltimaActividad: actualizarActividadCliente } = useUser();
  const { empleadoAutenticado, actualizarUltimaActividad: actualizarActividadEmpleado } =
    useEmpleado();

  // Detectar actividad para clientes
  useActivityTracker(actualizarActividadCliente, !!user);

  // Detectar actividad para empleados
  useActivityTracker(actualizarActividadEmpleado, !!empleadoAutenticado);

  return <>{children}</>;
};
