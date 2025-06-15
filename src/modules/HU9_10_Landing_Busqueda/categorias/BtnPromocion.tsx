import { useMemo } from 'react';
import { useProductStore } from '../../../shared/providers/ProductProvider';

interface BtnPromocionProps {
  onCategoryFilter?: (query: string | string[]) => void;
  termAnterior: string | string[]; // Mantenido por compatibilidad
  setTermAnterior: (term: string | string[]) => void;
}

export const BtnPromocion = ({
  onCategoryFilter,
  termAnterior: _, // Mantenido por compatibilidad pero no se usa
  setTermAnterior,
}: BtnPromocionProps) => {
  // Acceder directamente a las funciones del store
  const { toggleShowPromociones, handleCategoryFilter: globalHandleCategoryFilter } =
    useProductStore();

  const handleClick = () => {
    const { activeCategory } = useProductStore.getState();
    const isCurrentlyActive = activeCategory === 'promociones';

    if (isCurrentlyActive) {
      // Desactivar promociones
      if (onCategoryFilter) {
        onCategoryFilter('');
      }
      globalHandleCategoryFilter('');
      setTermAnterior('');
      // Si ya están activas, las desactivamos
      if (useProductStore.getState().showPromociones) {
        toggleShowPromociones();
      }
    } else {
      // Activar promociones
      if (onCategoryFilter) {
        onCategoryFilter('promociones');
      }
      globalHandleCategoryFilter('promociones');
      setTermAnterior('promociones');
      // Si no están activas, las activamos
      if (!useProductStore.getState().showPromociones) {
        toggleShowPromociones();
      }
    }
  };

  // Obtener directamente del estado global si las promociones están activas
  const { activeCategory } = useProductStore();

  // Determinar si las promociones están activas
  const isActive = useMemo(() => {
    return activeCategory === 'promociones';
  }, [activeCategory]);

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1.5 flex gap-2 items-center md:px-4 md:py-2 rounded-md text-xl font-bold sm:text-md hover:scale-105 transition-all whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-primary text-blanco shadow-lg transform scale-105'
                      : 'bg-blanco text-negro hover:bg-blanco/80'
                  }`}
    >
      Promociones
    </button>
  );
};
