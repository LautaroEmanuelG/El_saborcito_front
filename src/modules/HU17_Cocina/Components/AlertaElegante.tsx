import React, { useEffect } from 'react';
import { AlertaTipo } from '../hooks/useKanbanLogic';

interface AlertaEleganteProps {
  mensaje: string;
  tipo: AlertaTipo;
  onClose: () => void;
}

/**
 * 🎨 Componente para alertas elegantes usando solo Tailwind
 */
export const AlertaElegante: React.FC<AlertaEleganteProps> = ({ mensaje, tipo, onClose }) => {
  const ESTILOS = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  } as const;

  const ICONOS = {
    error: '⚠️',
    warning: '⚡',
    success: '✅',
  } as const;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${ESTILOS[tipo]} border rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 ease-out`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{ICONOS[tipo]}</span>
        <div className="flex-1">
          <p className="font-medium text-sm">{mensaje}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          ✕
        </button>
      </div>
    </div>
  );
};
