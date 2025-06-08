import { useProductStore } from '../../../../shared/providers/ProductProvider';

/**
 * Componente que muestra la categoría actualmente seleccionada
 * y permite limpiar el filtro de categoría
 */
export const ActiveCategoryIndicator = () => {
  const { activeCategory, resetFilters } = useProductStore();

  // Si no hay categoría activa, no mostramos nada
  if (!activeCategory) return null;

  const categoryLabel = Array.isArray(activeCategory) ? activeCategory.join(', ') : activeCategory;

  return (
    <div className="flex items-center justify-center w-full my-2">
      <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-lg">
        <span className="mr-2 font-medium">Categoría activa: {categoryLabel}</span>
        <button
          onClick={resetFilters}
          className="text-sm bg-primary text-white px-2 py-1 rounded hover:bg-primarydark transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};
