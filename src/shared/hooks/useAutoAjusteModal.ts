import { useState, useCallback } from 'react';

export interface AjusteInfo {
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

export const useAutoAjusteModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ajusteInfo, setAjusteInfo] = useState<AjusteInfo>({
    productos: [],
    promociones: [],
  });

  const mostrarModalAjuste = useCallback((info: AjusteInfo) => {
    setAjusteInfo(info);
    setIsOpen(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setIsOpen(false);
    setAjusteInfo({
      productos: [],
      promociones: [],
    });
  }, []);

  return {
    isOpen,
    ajusteInfo,
    mostrarModalAjuste,
    cerrarModal,
  };
};
