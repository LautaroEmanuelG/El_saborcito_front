import { useState, useCallback } from 'react';
import { Pedido } from '../Model';

export interface ModalTiempoState {
  isOpen: boolean;
  pedidoId: number | null;
  pedidoData: Pedido | null;
}

/**
 * 🕒 Hook para manejar el modal de agregar tiempo
 */
export const useModalTiempo = () => {
  const [modalState, setModalState] = useState<ModalTiempoState>({
    isOpen: false,
    pedidoId: null,
    pedidoData: null,
  });

  const abrirModal = useCallback((pedidoId: number, pedidoData: Pedido) => {
    setModalState({
      isOpen: true,
      pedidoId,
      pedidoData,
    });
  }, []);

  const cerrarModal = useCallback(() => {
    setModalState({
      isOpen: false,
      pedidoId: null,
      pedidoData: null,
    });
  }, []);

  return {
    modalState,
    abrirModal,
    cerrarModal,
  };
};
