import React, { useContext } from 'react';
import type { Promocion } from '../../types/Promocion';
import { useProductStore } from '../../shared/providers/ProductProvider';
import { CarritoContext } from '../../shared/providers/CarritoProvider';
import { useNotificacion } from '../../shared/hooks/useNotificacion';

type PromocionProps = {
  promocion: Promocion;
  setPromocionModal: (promocion: Promocion | null) => void;
};

export const CardPromocion = ({ promocion, setPromocionModal }: PromocionProps) => {
  const promocionAvailability = useProductStore((state) => state.promocionAvailability);
  const carritoContext = useContext(CarritoContext);
  const { mostrarNotificacion } = useNotificacion();

  if (!carritoContext) {
    throw new Error('CardPromocion must be used within a CarritoProvider');
  }

  const { addPromocionToCarrito } = carritoContext;

  // Obtener disponibilidad del estado centralizado
  const isAvailable = promocionAvailability[promocion.id] ?? true;

  // Handle Promocion modal
  const handlePromocionModal = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setPromocionModal(promocion);
  };

  // Handle agregar promoción directamente desde la card
  const handleAddPromocion = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const success = await addPromocionToCarrito(promocion, 1);
    if (success) {
      mostrarNotificacion(`🎁 ${promocion.denominacion} añadida al carrito`, 'success', 2000);
    }
  };

  // Calcular precio normal (suma de precios individuales)
  const precioNormal = promocion.promocionDetalles.reduce((suma, detalle) => {
    return suma + detalle.articulo.precioVenta * detalle.cantidadRequerida;
  }, 0);

  const ahorro = precioNormal - (promocion.precioPromocional ?? 0);
  const porcentajeAhorro = Math.round((ahorro / precioNormal) * 100);

  return (
    <div
      onClick={handlePromocionModal}
      className="bg-white flex-1 rounded-xl shadow-lg overflow-hidden border cursor-pointer relative"
    >
      {/* Badge de descuento */}
      {ahorro > 0 && (
        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold z-10">
          -{porcentajeAhorro}%
        </div>
      )}

      <div className="relative flex justify-end items-end w-full bg-red-900">
        <div className="bg-primarydark h-64 w-full relative">
          <picture>
            <source type="image/webp" />
            <img
              src={promocion.imagen?.url ?? '/img/Default.png'}
              alt={promocion.denominacion ?? 'Promoción El Saborcito'}
              className="object-cover w-full h-full"
            />
          </picture>

          {/* Mostrar productos incluidos como overlay */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-2">
            <div className="text-white text-xs">
              <span className="font-semibold">Incluye:</span>
              <div className="flex flex-wrap flex-col gap-1 mt-1">
                {promocion.promocionDetalles.map((detalle, index) => (
                  <span
                    key={detalle.id}
                    className="bg-white/20 px-1 rounded text-xs inline-block w-auto max-w-full"
                    style={{ width: 'fit-content' }}
                  >
                    {detalle.cantidadRequerida}x {detalle.articulo.denominacion}
                    {index < promocion.promocionDetalles.length - 1 ? '' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {!isAvailable && (
            <div className="absolute bottom-16 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Sin stock de insumos
            </div>
          )}
        </div>

        {/* Botón agregar al carrito */}
        <button
          className={`absolute ${
            !isAvailable
              ? 'bg-gris cursor-not-allowed'
              : 'bg-primary hover:bg-blanco hover:text-primary hover:font-bold hover:text-lg'
          } bottom-3 right-3 text-white rounded-xl font-semibold transition-all duration-100 ease-in-out transform ${
            isAvailable ? 'hover:scale-105' : ''
          }`}
          style={{
            width: '200px',
            height: '50px',
          }}
          onClick={handleAddPromocion}
          disabled={!isAvailable}
          title={
            !isAvailable ? 'No hay suficientes insumos para esta promoción' : 'Agregar al carrito'
          }
        >
          Agregar al carrito
        </button>
      </div>

      {/* Información de la promoción */}
      <div className="p-4 text-left">
        <h3 className="text-lg font-bold">{promocion.denominacion}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-primary text-xl font-bold">${promocion.precioPromocional}</span>
          {ahorro > 0 && (
            <span className="text-gray-500 line-through text-sm">${precioNormal}</span>
          )}
        </div>
        {ahorro > 0 && <p className="text-green-600 text-sm font-semibold">¡Ahorrás ${ahorro}!</p>}
      </div>

      {/* Badge de promoción */}
      <div className="absolute bottom-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold z-10">
        PROMO
      </div>
    </div>
  );
};
