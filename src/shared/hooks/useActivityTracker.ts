import { useEffect } from 'react';

// Hook para detectar actividad del usuario y actualizar la última actividad
export const useActivityTracker = (actualizarActividad: () => void, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return;

    // Eventos que consideramos como actividad del usuario
    const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Throttle para evitar demasiadas actualizaciones
    let ultimaActualizacion = 0;
    const throttleMs = 30000; // Actualizar máximo cada 30 segundos

    const manejarActividad = () => {
      const ahora = Date.now();
      if (ahora - ultimaActualizacion > throttleMs) {
        actualizarActividad();
        ultimaActualizacion = ahora;
      }
    };

    // Agregar listeners
    eventos.forEach((evento) => {
      document.addEventListener(evento, manejarActividad, true);
    });

    // Cleanup
    return () => {
      eventos.forEach((evento) => {
        document.removeEventListener(evento, manejarActividad, true);
      });
    };
  }, [actualizarActividad, isActive]);
};
