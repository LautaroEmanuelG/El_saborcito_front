import React, { useContext } from 'react';
import { CarritoContext } from '../../../shared/providers/CarritoProvider';
import { useProductStore } from '../../../shared/providers/ProductProvider';
import type { Articulo } from '../../../types/Articulo';
import { useNotificacion } from '../../../shared/hooks/useNotificacion';

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
  cantidadProducto: _, // Mantenido por compatibilidad pero no se usa
  setCantidadProducto,
  onClose,
  onClick,
  disabledOverride,
}) => {
  const carritoContext = useContext(CarritoContext);
  const productAvailability = useProductStore((state) => state.productAvailability);
  const { mostrarNotificacion } = useNotificacion();

  if (!carritoContext) {
    throw new Error('BtnAgregarCarrito must be used within a CarritoProvider');
  }

  const { addToCarrito } = carritoContext;

  // Obtener disponibilidad del estado centralizado
  const isAvailable = productAvailability[articulo.id] ?? true; // Por defecto disponible si no está en el estado
  const handleAddToCarrito = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // BtnAgregarCarrito siempre agrega solo 1 unidad
    // Si el usuario quiere más cantidad, debe usar BtnCantidadProducto en VistaCarrito
    await addToCarrito(articulo, 1);

    // Como usamos estrategia optimista, siempre mostramos el mensaje de éxito
    // Si hay problemas, el CarritoProvider se encarga de notificar y quitar el producto
    mostrarNotificacion(`${articulo.denominacion} añadido al carrito`, 'success', 2000);

    setCantidadProducto(1);
    onClose();
    if (onClick) {
      onClick(event);
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
      title={
        isDisabled ? 'No hay suficientes insumos para fabricar este producto' : 'Agregar al carrito'
      }
    >
      Agregar al carrito
    </button>
  );
};
