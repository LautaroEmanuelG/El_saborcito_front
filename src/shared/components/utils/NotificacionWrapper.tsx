import React from 'react';
import { useNotificacion } from '../../hooks/useNotificacion';
import { NotificacionContainer } from './NotificacionContainer';

export const NotificacionWrapper: React.FC = () => {
  const { notificaciones, cerrarNotificacion } = useNotificacion();

  return (
    <NotificacionContainer
      notificaciones={notificaciones}
      cerrarNotificacion={cerrarNotificacion}
    />
  );
};

export default NotificacionWrapper;
