import { useEffect } from 'react';
import type { Promocion } from '../../types/Promocion';
import { useProductStore } from '../../shared/providers/ProductProvider';
import { BtnAgregarPromocion } from './BtnAgregarPromocion';

interface Props {
  promocion: Promocion | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ModalPromocion = ({ promocion = null, isOpen, onClose }: Props) => {
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
  const ahorro = precioNormal - (promocion.precioPromocional ?? 0);
  const porcentajeAhorro = Math.round((ahorro / precioNormal) * 100);

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 min-h-full">
      <article className="relative flex flex-row bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full">
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
                <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">
                  🎁 PROMOCIÓN
                </span>
                {ahorro > 0 && (
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                    -{porcentajeAhorro}% OFF
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-semibold mb-4">{promocion.denominacion}</h2>
              {/* Precios */}
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-primary font-bold">
                    ${promocion.precioPromocional}
                  </span>
                  {ahorro > 0 && (
                    <span className="text-md text-gray-500 line-through">${precioNormal}</span>
                  )}
                </div>
                {ahorro > 0 && (
                  <p className="text-green-600 text-md font-semibold mt-1">¡Ahorrás ${ahorro}!</p>
                )}
              </div>
              {/* Productos incluidos */}
              <div className="mb-4 ">
                <h3 className="text-lg font-semibold">Incluye:</h3>
                <div className="">
                  {promocion.promocionDetalles.map((detalle) => (
                    <div key={detalle.id} className="flex items-center gap-3 py-2 rounded-lg">
                      <img
                        src={detalle.articulo.imagen?.url ?? '/img/Default.png'}
                        alt={detalle.articulo.denominacion}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{detalle.articulo.denominacion}</p>
                        <p className="text-gray-600">Llevas: {detalle.cantidadRequerida}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-16"></div>
              </div>
              <div className="mt-auto relative">
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
