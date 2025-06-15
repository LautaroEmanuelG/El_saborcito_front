import React, { useEffect } from 'react';
import type { Promocion } from '../../types/Promocion';
import { useProductStore } from '../../shared/providers/ProductProvider';
import { BtnAgregarPromocion } from './BtnAgregarPromocion';

type Props = {
  promocion: Promocion | null;
  isOpen: boolean;
  onClose: () => void;
};

export const ModalPromocion: React.FC<Props> = ({ promocion = null, isOpen, onClose }) => {
  if (!isOpen || !promocion) return null;

  const promocionAvailability = useProductStore((state) => state.promocionAvailability);
  const checkPromocionAvailability = useProductStore((state) => state.checkPromocionAvailability);

  // Verificar disponibilidad en background al abrir el modal
  useEffect(() => {
    if (promocion?.id) {
      checkPromocionAvailability(promocion.id);
    }
  }, [promocion, checkPromocionAvailability]);

  // Obtener disponibilidad del estado centralizado
  const isAvailable = promocionAvailability[promocion.id] ?? true;

  // Calcular precios
  const precioNormal = promocion.promocionDetalles.reduce((suma, detalle) => {
    return suma + detalle.articulo.precioVenta * detalle.cantidadRequerida;
  }, 0);

  const ahorro = precioNormal - promocion.precioPromocional;
  const porcentajeAhorro = Math.round((ahorro / precioNormal) * 100);

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <article className="relative flex flex-row bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Imagen de la promoción */}
        <div className="w-full flex">
          <picture className="w-1/2 h-auto object-cover rounded-lg">
            <source type="image/webp" />
            <img
              src={promocion.imagen?.url ?? '/img/Default.png'}
              alt={promocion.denominacion ?? 'Promoción El Saborcito'}
              className="object-cover w-full h-full rounded-lg"
            />
          </picture>

          <aside className="relative w-1/2 h-auto">
            {/* Detalles de la promoción */}
            <div className="pl-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary text-white text-sm px-3 py-1 rounded-full font-bold">
                  🎁 PROMOCIÓN
                </span>
                {ahorro > 0 && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                    -{porcentajeAhorro}% OFF
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-semibold mb-4">{promocion.denominacion}</h2>
              {/* Precios */}
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl text-primary font-bold">
                    ${promocion.precioPromocional}
                  </span>
                  {ahorro > 0 && (
                    <span className="text-xl text-gray-500 line-through">${precioNormal}</span>
                  )}
                </div>
                {ahorro > 0 && (
                  <p className="text-green-600 text-lg font-semibold mt-1">¡Ahorrás ${ahorro}!</p>
                )}
              </div>
              {/* Productos incluidos */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">📦 Incluye:</h3>
                <div className="space-y-3">
                  {promocion.promocionDetalles.map((detalle) => (
                    <div
                      key={detalle.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={detalle.articulo.imagen?.url ?? '/img/Default.png'}
                        alt={detalle.articulo.denominacion}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{detalle.articulo.denominacion}</p>
                        <p className="text-gray-600">
                          Cantidad: {detalle.cantidadRequerida} x ${detalle.articulo.precioVenta}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Validación de horarios si aplica */}
              {(promocion.horaDesde || promocion.horaHasta) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⏰ Disponible de {promocion.horaDesde || '00:00'} a{' '}
                    {promocion.horaHasta || '23:59'}
                  </p>
                </div>
              )}{' '}
              {/* Control de cantidad y botones */}
              <div className="mt-auto relative">
                {/* Información sobre el precio */}
                <div className="mb-4">
                  <p className="text-lg font-semibold">
                    Precio promocional:{' '}
                    <span className="text-primary">${promocion.precioPromocional}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    💡 Puedes ajustar la cantidad desde el carrito
                  </p>
                </div>

                {/* Botón volver */}
                <button
                  className="absolute bottom-3 left-3 px-6 py-3 bg-gray-300 text-black rounded-xl hover:bg-gray-400 transition-colors font-semibold"
                  style={{
                    width: '150px',
                    height: '50px',
                  }}
                  onClick={onClose}
                >
                  Volver
                </button>

                {/* Estado sin stock */}
                {!isAvailable && (
                  <div
                    className="absolute bottom-3 right-3 bg-gray-200 text-gray-600 px-6 py-3 rounded-xl"
                    style={{
                      width: '200px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Sin stock de insumos
                  </div>
                )}

                {/* Botón agregar promoción */}
                <BtnAgregarPromocion
                  promocion={promocion}
                  onClose={onClose}
                  disabledOverride={!isAvailable}
                />
              </div>
            </div>
          </aside>
        </div>
      </article>
    </section>
  );
};
