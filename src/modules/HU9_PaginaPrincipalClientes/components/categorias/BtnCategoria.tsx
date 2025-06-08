import { useState, useRef, useEffect, useMemo } from 'react';
import type { Categoria } from '../../../../types/Categoria';
import { IconoArrowDown } from '../../../../assets/svgs/icons/IconoArrowDown';

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

  const esTermAnteriorIgual = (actual: string | string[]): boolean => {
    if (Array.isArray(actual) && Array.isArray(termAnterior)) {
      if (actual.length !== termAnterior.length) return false;
      const sortedActual = [...actual].sort();
      const sortedTermAnterior = [...termAnterior].sort();
      return sortedActual.every((val, index) => val === sortedTermAnterior[index]);
    }
    return actual === termAnterior;
  };

  const handleClickPadre = () => {
    let searchTermForSearch: string[];
    searchTermForSearch = subCategorias.map((sub) => sub.denominacion);

    if (esTermAnteriorIgual(searchTermForSearch)) {
      // Si hay un filtro de categoría disponible, úsalo
      if (onCategoryFilter) {
        onCategoryFilter('');
      } else {
        // Compatibilidad: usar onSearch si onCategoryFilter no está disponible
        onSearch('');
      }
      setTermAnterior('');
    } else {
      if (onCategoryFilter) {
        onCategoryFilter(searchTermForSearch);
      } else {
        onSearch(searchTermForSearch);
      }
      setTermAnterior(searchTermForSearch);
    }
    setShowSubcategoriasDropdown(false);
    clearHoverTimeout();
  };

  const handleClickHijoOSolo = () => {
    if (esTermAnteriorIgual(category.denominacion)) {
      if (onCategoryFilter) {
        onCategoryFilter('');
      } else {
        onSearch('');
      }
      setTermAnterior('');
    } else {
      if (onCategoryFilter) {
        onCategoryFilter(category.denominacion);
      } else {
        onSearch(category.denominacion);
      }
      setTermAnterior(category.denominacion);
    }
    clearHoverTimeout();
  };

  const handleSubCategoriaClick = (subCategoriaDenominacion: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (esTermAnteriorIgual(subCategoriaDenominacion)) {
      if (onCategoryFilter) {
        onCategoryFilter('');
      } else {
        onSearch('');
      }
      setTermAnterior('');
    } else {
      if (onCategoryFilter) {
        onCategoryFilter(subCategoriaDenominacion);
      } else {
        onSearch(subCategoriaDenominacion);
      }
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

  const isActive = useMemo(() => {
    // Caso 1: termAnterior es un string (una única categoría está seleccionada)
    if (typeof termAnterior === 'string' && termAnterior !== '') {
      // Si el botón de la categoría actual coincide con el término seleccionado
      if (category.denominacion === termAnterior) {
        return true;
      }
      // Si la categoría actual es un padre, y una de sus subcategorías coincide con el término seleccionado
      if (esPadreConHijos && subCategorias.some((sub) => sub.denominacion === termAnterior)) {
        return true;
      }
    }
    // Caso 2: termAnterior es un array (se hizo clic en una categoría padre para mostrar todos sus hijos)
    else if (Array.isArray(termAnterior) && esPadreConHijos) {
      const currentCategorysChildrenDenominations = subCategorias.map((sub) => sub.denominacion);
      // Comprueba si termAnterior (array de hijos activos) coincide con los hijos de este padre
      if (termAnterior.length === currentCategorysChildrenDenominations.length) {
        const sortedTermAnterior = [...termAnterior].sort();
        const sortedCurrentCategorysChildren = [...currentCategorysChildrenDenominations].sort();
        if (
          sortedTermAnterior.every((val, index) => val === sortedCurrentCategorysChildren[index])
        ) {
          return true; // Esta categoría padre está activa
        }
      }
    }
    return false;
  }, [termAnterior, category.denominacion, subCategorias, esPadreConHijos]);

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
        className={`px-3 py-1.5 flex gap-2 items-center md:px-4 md:py-2 rounded-md text-xl font-bold sm:text-md hover:text-negro hover:scale-105 transition-all whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-primary text-blanco shadow-lg transform scale-105 hover:text-negro'
                        : 'bg-blanco text-negro hover:text-blanco hover:bg-blanco/80'
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
