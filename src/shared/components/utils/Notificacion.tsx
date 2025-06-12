import React from 'react';

interface NotificacionProps {
  mensaje: string;
  tipo: 'error' | 'warning' | 'success' | 'info';
  onClose: () => void;
  duracion?: number; // en milisegundos
}

export const Notificacion: React.FC<NotificacionProps> = ({
  mensaje,
  tipo,
  onClose,
  // No necesitamos usar duracion aquí ya que el cierre automático lo maneja
  // el contenedor padre ahora
}) => {
  // Determinar el color del fondo según el tipo
  const getBgColor = () => {
    switch (tipo) {
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'success':
        return 'bg-green-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Determinar el icono según el tipo
  const getIcon = () => {
    switch (tipo) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={`fixed top-5 right-5 ${getBgColor()} text-white p-4 rounded-md shadow-lg max-w-md z-50 flex items-center`}
    >
      <span className="mr-2 text-xl">{getIcon()}</span>
      <p className="flex-1">{mensaje}</p>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};
