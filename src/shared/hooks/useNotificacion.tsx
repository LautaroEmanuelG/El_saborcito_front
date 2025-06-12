import { useState, useCallback } from 'react';

type NotificationType = 'error' | 'warning' | 'success' | 'info';

interface Notification {
  id: number;
  mensaje: string;
  tipo: NotificationType;
  duracion?: number;
}

// Hook para gestionar notificaciones
export const useNotificacion = () => {
  const [notificaciones, setNotificaciones] = useState<Notification[]>([]);

  // Contador para generar IDs únicos
  const [counter, setCounter] = useState(0);

  // Función para mostrar una nueva notificación
  const mostrarNotificacion = useCallback(
    (mensaje: string, tipo: NotificationType = 'info', duracion: number = 3000) => {
      const id = counter;
      setCounter((prev) => prev + 1);

      const nuevaNotificacion: Notification = {
        id,
        mensaje,
        tipo,
        duracion,
      };

      setNotificaciones((prev) => [...prev, nuevaNotificacion]);

      // Retirar la notificación automáticamente después de la duración
      setTimeout(() => {
        cerrarNotificacion(id);
      }, duracion);

      return id;
    },
    [counter]
  );

  // Función para cerrar una notificación específica
  const cerrarNotificacion = useCallback((id: number) => {
    setNotificaciones((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  // Función para cerrar todas las notificaciones
  const cerrarTodas = useCallback(() => {
    setNotificaciones([]);
  }, []);

  return {
    notificaciones,
    mostrarNotificacion,
    cerrarNotificacion,
    cerrarTodas,
  };
};
