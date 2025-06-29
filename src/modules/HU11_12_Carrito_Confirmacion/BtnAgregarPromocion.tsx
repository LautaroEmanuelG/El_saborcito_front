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

  const {
    addPromocionToCarrito,
    canIncreasePromocion,
    isAnalyzing,
    promocionesProblematicas,
    carrito,
    promocionesEnCarrito,
  } = carritoContext;

  // Obtener disponibilidad del estado centralizado
  const isAvailable = promocionAvailability[promocion.id] ?? true;

  const handleAddToCarrito = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // 🎯 **USAR SOLO VALIDACIÓN CENTRALIZADA DEL CONTEXTO**
    const yaExisteEnCarrito = promocionesEnCarrito.some(
      (item) => item.promocion.id === promocion.id
    );
    const carritoVacio = carrito.length === 0 && promocionesEnCarrito.length === 0;

    // Si el carrito está vacío o la promoción no existe, permitir agregar
    if (!carritoVacio && yaExisteEnCarrito && !canIncreasePromocion(promocion.id)) {
      mostrarNotificacion(
        `❌ No se puede agregar más de la promoción ${promocion.denominacion} - limitaciones de stock`,
        'warning',
        3000
      );
      return;
    }

    const success = await addPromocionToCarrito(promocion, 1);

    if (success) {
      mostrarNotificacion(`${promocion.denominacion} añadida al carrito`, 'success', 2000);
      onClose();
      if (onClick) {
        onClick(event);
      }
    }
  };

  // 🎯 **DETERMINAR ESTADO DEL BOTÓN (SIMPLIFICADO)**
  const yaExisteEnCarrito = promocionesEnCarrito.some((item) => item.promocion.id === promocion.id);
  const carritoVacio = carrito.length === 0 && promocionesEnCarrito.length === 0;
  const esProblematica = promocionesProblematicas.has(promocion.id);

  const isDisabled =
    disabledOverride ||
    !isAvailable ||
    isAnalyzing ||
    (!carritoVacio && yaExisteEnCarrito && (esProblematica || !canIncreasePromocion(promocion.id)));

  // 📝 **TEXTO DEL TOOLTIP SIMPLIFICADO**
  const getTooltipText = (): string => {
    if (disabledOverride) return 'Promoción deshabilitada';
    if (!isAvailable) return 'No hay suficientes insumos para esta promoción';
    if (isAnalyzing) return 'Verificando disponibilidad...';
    if (esProblematica) return 'Esta promoción tiene limitaciones de stock';
    if (!carritoVacio && yaExisteEnCarrito && !canIncreasePromocion(promocion.id)) {
      return 'Se alcanzó el límite de stock para esta promoción';
    }
    return 'Agregar al carrito';
  };

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
      title={getTooltipText()}
    >
      {isAnalyzing ? <>⏳ Verificando...</> : <>🎁 Agregar promoción</>}
    </button>
  );
};
