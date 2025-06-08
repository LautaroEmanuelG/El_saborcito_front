import React, { useContext, useEffect, useState } from 'react';
import { CarritoContext } from '../../../shared/providers/CarritoProvider';
import type { Articulo } from '../../../types/Articulo';
import { useProductAvailability } from '../../../shared/hooks/useProductAvailability';
import { useNotificacionContext } from '../../../shared/providers/NotificacionProvider';

interface BtnAgregarCarritoProps {
  position?: 'left' | 'right';
  articulo: Articulo;
  cantidadProducto: number;
  setCantidadProducto: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Make onClick optional
  disabledOverride?: boolean; // Para forzar el estado deshabilitado en pruebas
}

export const BtnAgregarCarrito: React.FC<BtnAgregarCarritoProps> = ({
  position = 'right',
  articulo,
  cantidadProducto,
  setCantidadProducto,
  onClose,
  onClick, // Destructure onClick
  disabledOverride,
}) => {
  const carritoContext = useContext(CarritoContext);
  const { checkAvailability } = useProductAvailability();
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  if (!carritoContext) {
    throw new Error('BtnAgregarCarrito must be used within a CarritoProvider');
  }

  const { addToCarrito } = carritoContext;

  // Verificar disponibilidad al cargar el componente
  useEffect(() => {
    const checkProductAvailability = async () => {
      setIsChecking(true);
      const available = await checkAvailability(articulo);
      setIsAvailable(available);
      setIsChecking(false);
    };

    checkProductAvailability();
  }, [articulo, checkAvailability]);
  const { mostrarNotificacion } = useNotificacionContext();

  const handleAddToCarrito = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // Volver a verificar disponibilidad antes de agregar al carrito
    setIsChecking(true);
    const success = await addToCarrito(articulo, cantidadProducto || 1);
    setIsChecking(false);

    if (!success) {
      mostrarNotificacion(
        `No hay suficientes insumos para fabricar ${articulo.denominacion}`,
        'error',
        5000
      );
      return;
    }

    mostrarNotificacion(`${articulo.denominacion} añadido al carrito`, 'success', 2000);

    setCantidadProducto(1);
    onClose();
    if (onClick) {
      onClick(event); // Call onClick if it is provided
    }
  };

  // Determinar si el botón debe estar deshabilitado
  const isDisabled = disabledOverride || !isAvailable || isChecking;

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
      title={
        isDisabled ? 'No hay suficientes insumos para fabricar este producto' : 'Agregar al carrito'
      }
    >
      {isChecking ? 'Verificando...' : 'Agregar al carrito'}
    </button>
  );
};
