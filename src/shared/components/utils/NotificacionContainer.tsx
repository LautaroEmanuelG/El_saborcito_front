import React from 'react';
import { Notificacion } from './Notificacion';

interface NotificacionContainerProps {
  notificaciones: Array<{
    id: number;
    mensaje: string;
    tipo: 'error' | 'warning' | 'success' | 'info';
    duracion?: number;
  }>;
  cerrarNotificacion: (id: number) => void;
}

export const NotificacionContainer: React.FC<NotificacionContainerProps> = ({
  notificaciones,
  cerrarNotificacion,
}) => {
  if (notificaciones.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-4">
      {notificaciones.map((notificacion) => (
        <Notificacion
          key={notificacion.id}
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
          onClose={() => cerrarNotificacion(notificacion.id)}
          duracion={notificacion.duracion}
        />
      ))}
    </div>
  );
};
