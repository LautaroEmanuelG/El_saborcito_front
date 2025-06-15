import React, { useContext } from 'react';
import { CarritoContext } from '../../shared/providers/CarritoProvider';
import { useProductStore } from '../../shared/providers/ProductProvider';
import type { Promocion } from '../../types/Promocion';
import { useNotificacion } from '../../shared/hooks/useNotificacion';

interface BtnAgregarPromocionProps {
  position?: 'left' | 'right';
  promocion: Promocion;
  onClose: () => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabledOverride?: boolean;
}

export const BtnAgregarPromocion: React.FC<BtnAgregarPromocionProps> = ({
  position = 'right',
  promocion,
  onClose,
  onClick,
  disabledOverride,
}) => {
  const carritoContext = useContext(CarritoContext);
  const promocionAvailability = useProductStore((state) => state.promocionAvailability);
  const { mostrarNotificacion } = useNotificacion();

  if (!carritoContext) {
    throw new Error('BtnAgregarPromocion must be used within a CarritoProvider');
  }

  const { addPromocionToCarrito } = carritoContext;

  // Obtener disponibilidad del estado centralizado
  const isAvailable = promocionAvailability[promocion.id] ?? true;

  const handleAddToCarrito = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // BtnAgregarPromocion siempre agrega solo 1 unidad
    // Si el usuario quiere más cantidad, debe usar los controles en VistaCarrito
    const success = await addPromocionToCarrito(promocion, 1);

    if (success) {
      mostrarNotificacion(`${promocion.denominacion} añadida al carrito`, 'success', 2000);
      onClose();
      if (onClick) {
        onClick(event);
      }
    }
  };

  // Determinar si el botón debe estar deshabilitado
  const isDisabled = disabledOverride || !isAvailable;

  return (
    <button
      className={`absolute ${
        isDisabled
          ? 'bg-gris cursor-not-allowed'
          : 'bg-primary hover:bg-blanco hover:text-primary hover:font-bold hover:text-lg'
      } bottom-3 ${
        position === 'right' ? 'right-3' : 'left-3'
      } text-white rounded-xl font-semibold transition-all duration-100 ease-in-out transform ${
        !isDisabled ? 'hover:scale-105' : ''
      }`}
      style={{
        width: '200px',
        height: '50px',
      }}
      onClick={handleAddToCarrito}
      disabled={isDisabled}
      title={isDisabled ? 'No hay suficientes insumos para esta promoción' : 'Agregar al carrito'}
    >
      🎁 Agregar promoción
    </button>
  );
};
