import { useState, useCallback } from 'react';

interface AutoAjusteInfo {
  productos: Array<{
    nombre: string;
    cantidadAnterior: number;
    cantidadNueva: number;
  }>;
  promociones: Array<{
    nombre: string;
    cantidadAnterior: number;
    cantidadNueva: number;
  }>;
}

// Hook para gestionar el modal de auto-ajuste
export const useAutoAjusteModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ajusteInfo, setAjusteInfo] = useState<AutoAjusteInfo>({ productos: [], promociones: [] });

  // Función para mostrar el modal con información de ajustes
  const mostrarModalAjuste = useCallback((info: AutoAjusteInfo) => {
    setAjusteInfo(info);
    setIsOpen(true);
  }, []);

  // Función para cerrar el modal
  const cerrarModal = useCallback(() => {
    setIsOpen(false);
    setAjusteInfo({ productos: [], promociones: [] });
  }, []);

  return {
    isOpen,
    ajusteInfo,
    mostrarModalAjuste,
    cerrarModal,
  };
};
