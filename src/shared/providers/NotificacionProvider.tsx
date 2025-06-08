import React, { createContext, ReactNode, useContext } from 'react';
import { useNotificacion } from '../hooks/useNotificacion';
import { NotificacionContainer } from '../components/utils/NotificacionContainer';

// Definir el tipo para el contexto
type NotificacionContextType = {
  mostrarNotificacion: (
    mensaje: string,
    tipo?: 'error' | 'warning' | 'success' | 'info',
    duracion?: number
  ) => number;
  cerrarNotificacion: (id: number) => void;
  cerrarTodas: () => void;
};

// Crear el contexto
const NotificacionContext = createContext<NotificacionContextType | undefined>(undefined);

// Props para el proveedor
interface NotificacionProviderProps {
  children: ReactNode;
}

// Componente proveedor
export const NotificacionProvider: React.FC<NotificacionProviderProps> = ({ children }) => {
  const { notificaciones, mostrarNotificacion, cerrarNotificacion, cerrarTodas } =
    useNotificacion();

  return (
    <NotificacionContext.Provider
      value={{
        mostrarNotificacion,
        cerrarNotificacion,
        cerrarTodas,
      }}
    >
      {children}
      <NotificacionContainer
        notificaciones={notificaciones}
        cerrarNotificacion={cerrarNotificacion}
      />
    </NotificacionContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useNotificacionContext = (): NotificacionContextType => {
  const context = useContext(NotificacionContext);
  if (context === undefined) {
    throw new Error('useNotificacionContext debe ser usado dentro de un NotificacionProvider');
  }
  return context;
};
