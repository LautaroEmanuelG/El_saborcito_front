import { useState } from 'react';

interface UseColumnVisibilityReturn {
  showPendiente: boolean;
  showListo: boolean;
  togglePendienteVisibility: () => void;
  toggleListoVisibility: () => void;
  setShowPendiente: (show: boolean) => void;
  setShowListo: (show: boolean) => void;
}

/**
 * 👁️ Hook personalizado para manejar la visibilidad de columnas en el Kanban
 */
export const useColumnVisibility = (): UseColumnVisibilityReturn => {
  const [showPendiente, setShowPendiente] = useState(true);
  const [showListo, setShowListo] = useState(true);

  const togglePendienteVisibility = () => {
    setShowPendiente(!showPendiente);
  };

  const toggleListoVisibility = () => {
    setShowListo(!showListo);
  };

  return {
    showPendiente,
    showListo,
    togglePendienteVisibility,
    toggleListoVisibility,
    setShowPendiente,
    setShowListo,
  };
};
