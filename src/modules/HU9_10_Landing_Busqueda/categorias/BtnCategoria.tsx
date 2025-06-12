import { useState, useRef, useEffect, useMemo } from 'react';
import type { Categoria } from '../../../types/Categoria';
import { IconoArrowDown } from '../../../assets/svgs/icons/IconoArrowDown';
import { useProductStore } from '../../../shared/providers/ProductProvider';

interface BtnCategoriaProps {
  category: Categoria;
  subCategorias?: Categoria[];
  onSearch: (query: string | string[]) => void; // Se mantiene por compatibilidad
  onCategoryFilter?: (query: string | string[]) => void; // Nuevo método para filtrar categorías
  termAnterior: string | string[];
  setTermAnterior: (term: string | string[]) => void;
}

export const BtnCategoria = ({
  category,
  subCategorias = [],
  onSearch,
  onCategoryFilter,
  termAnterior,
  setTermAnterior,
}: BtnCategoriaProps) => {
  const [showSubcategoriasDropdown, setShowSubcategoriasDropdown] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const esPadreConHijos = subCategorias.length > 0;

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearHoverTimeout();
    };
  }, []);

  // Ya no necesitamos esta función porque usamos activeCategory directamente del store

  // Acceder directamente a handleCategoryFilter para manipulaciones internas
  const { handleCategoryFilter: globalHandleCategoryFilter } = useProductStore();

  const handleClickPadre = () => {
    const searchTermForSearch = subCategorias.map((sub) => sub.denominacion);
    const { activeCategory } = useProductStore.getState();

    // Comprobar si esta categoría ya está activa
    const isCurrentlyActive =
      Array.isArray(activeCategory) &&
      activeCategory.length === searchTermForSearch.length &&
      [...activeCategory].sort().every((val, idx) => val === [...searchTermForSearch].sort()[idx]);

    if (isCurrentlyActive) {
      // Desactivar la categoría
      if (onCategoryFilter) {
        onCategoryFilter('');
      } else {
        onSearch('');
      }
      // También actualizar el estado global directamente
      globalHandleCategoryFilter('');
      setTermAnterior('');
    } else {
      // Activar la categoría
      if (onCategoryFilter) {
        onCategoryFilter(searchTermForSearch);
      } else {
        onSearch(searchTermForSearch);
      }
      // También actualizar el estado global directamente
      globalHandleCategoryFilter(searchTermForSearch);
      setTermAnterior(searchTermForSearch);
    }

    setShowSubcategoriasDropdown(false);
    clearHoverTimeout();
  };

  const handleClickHijoOSolo = () => {
    const { activeCategory } = useProductStore.getState();
    const isCurrentlyActive = activeCategory === category.denominacion;

    if (isCurrentlyActive) {
      // Desactivar la categoría
      if (onCategoryFilter) {
        onCategoryFilter('');
      } else {
        onSearch('');
      }
      // También actualizar el estado global directamente
      globalHandleCategoryFilter('');
      setTermAnterior('');
    } else {
      // Activar la categoría
      if (onCategoryFilter) {
        onCategoryFilter(category.denominacion);
      } else {
        onSearch(category.denominacion);
      }
      // También actualizar el estado global directamente
      globalHandleCategoryFilter(category.denominacion);
      setTermAnterior(category.denominacion);
    }

    clearHoverTimeout();
  };

  const handleSubCategoriaClick = (subCategoriaDenominacion: string, event: React.MouseEvent) => {
    event.stopPropagation();

    const { activeCategory } = useProductStore.getState();
    const isCurrentlyActive = activeCategory === subCategoriaDenominacion;

    if (isCurrentlyActive) {
      // Desactivar la categoría
      if (onCategoryFilter) {
        onCategoryFilter('');
      } else {
        onSearch('');
      }
      // También actualizar el estado global directamente
      globalHandleCategoryFilter('');
      setTermAnterior('');
    } else {
      // Activar la categoría
      if (onCategoryFilter) {
        onCategoryFilter(subCategoriaDenominacion);
      } else {
        onSearch(subCategoriaDenominacion);
      }
      // También actualizar el estado global directamente
      globalHandleCategoryFilter(subCategoriaDenominacion);
      setTermAnterior(subCategoriaDenominacion);
    }

    setShowSubcategoriasDropdown(false);
    clearHoverTimeout();
  };

  const handleMouseEnterContainer = () => {
    clearHoverTimeout();
    if (esPadreConHijos) {
      setShowSubcategoriasDropdown(true);
    }
  };

  const handleMouseLeaveContainer = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = window.setTimeout(() => {
      setShowSubcategoriasDropdown(false);
    }, 200);
  };

  // Obtener directamente del estado global si la categoría está activa
  const { activeCategory } = useProductStore();

  // Determinar si esta categoría está activa basándose en el estado global de activeCategory
  const isActive = useMemo(() => {
    // Si no hay categoría activa
    if (!activeCategory) return false;

    // Caso 1: activeCategory es un string (una única categoría está seleccionada)
    if (typeof activeCategory === 'string') {
      // Si el botón de la categoría actual coincide con la categoría activa
      if (category.denominacion === activeCategory) {
        return true;
      }
      // Si la categoría actual es un padre, y una de sus subcategorías coincide con la categoría activa
      if (esPadreConHijos && subCategorias.some((sub) => sub.denominacion === activeCategory)) {
        return true;
      }
    }
    // Caso 2: activeCategory es un array (se hizo clic en una categoría padre para mostrar todos sus hijos)
    else if (Array.isArray(activeCategory) && esPadreConHijos) {
      const currentCategorysChildrenDenominations = subCategorias.map((sub) => sub.denominacion);
      // Comprueba si activeCategory (array de hijos activos) coincide con los hijos de este padre
      if (activeCategory.length === currentCategorysChildrenDenominations.length) {
        const sortedActiveCategory = [...activeCategory].sort();
        const sortedCurrentCategorysChildren = [...currentCategorysChildrenDenominations].sort();
        if (
          sortedActiveCategory.every((val, index) => val === sortedCurrentCategorysChildren[index])
        ) {
          return true; // Esta categoría padre está activa
        }
      }
    }
    return false;
  }, [activeCategory, category.denominacion, subCategorias, esPadreConHijos]);

  const handleClick = () => {
    if (esPadreConHijos) {
      handleClickPadre();
    } else {
      handleClickHijoOSolo();
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnterContainer}
      onMouseLeave={handleMouseLeaveContainer}
    >
      <button
        onClick={handleClick}
        className={`px-3 py-1.5 flex gap-2 items-center md:px-4 md:py-2 rounded-md text-xl font-bold sm:text-md hover:scale-105 transition-all whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-primary text-blanco shadow-lg transform scale-105'
                        : 'bg-blanco text-negro hover:bg-blanco/80'
                    }`}
      >
        {category.denominacion}
        {esPadreConHijos ? <IconoArrowDown /> : ''}
      </button>
      {esPadreConHijos && showSubcategoriasDropdown && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 min-w-[160px] bg-blanco border border-gray-300 rounded-md shadow-xl z-20 py-1">
          <ul>
            {subCategorias.map((sub) => (
              <li
                key={sub.id}
                onClick={(e) => handleSubCategoriaClick(sub.denominacion, e)}
                className={`block w-full text-left px-4 py-2 text-sm text-negro hover:bg-primary/10 hover:text-primary cursor-pointer
                            ${termAnterior === sub.denominacion ? 'bg-primary/20 text-primary font-semibold' : ''}
                           `}
              >
                {sub.denominacion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
