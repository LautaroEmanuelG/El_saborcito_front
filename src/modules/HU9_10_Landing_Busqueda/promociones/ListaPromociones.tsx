import type { Promocion } from '../../../types/Promocion';
import { CardPromocion } from '../../HU11_12_Carrito_Confirmacion/CardPromocion';

interface Props {
  promociones: Promocion[];
  onPromocionClick: (promocion: Promocion | null) => void;
}

export const ListaPromociones = ({ promociones, onPromocionClick }: Props) => {
  if (promociones.length === 0) {
    return (
      <p className="text-center text-gray-500 text-xl mt-10">
        No hay promociones disponibles en este momento.
      </p>
    );
  }

  return (
    <div className="container pt-0 mx-auto p-4 px-0 flex flex-wrap md:gap-6 mb-6">
      <div className="mb-4 w-full">
        <h2 className="text-2xl font-bold mb-4 text-negro border-b-2 border-primary pb-2">
          Promociones Especiales
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 flex-wrap">
          {promociones.map((promocion) => (
            <CardPromocion
              key={promocion.id}
              promocion={promocion}
              setPromocionModal={onPromocionClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
