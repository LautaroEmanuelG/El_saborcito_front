import { useProductStore } from '../../../shared/providers/ProductProvider';

/**
 * Componente que muestra la categoría actualmente seleccionada
 * y permite limpiar el filtro de categoría
 */
export const ActiveCategoryIndicator = () => {
  const { activeCategory, resetFilters } = useProductStore();

  // Si no hay categoría activa, no mostramos nada
  if (!activeCategory) return null;

  const categoryLabel = Array.isArray(activeCategory) ? activeCategory.join(', ') : activeCategory;

  const handleClearCategory = () => {
    // Limpiar filtros y asegurarnos de que la categoría activa se resetee
    resetFilters();
    // Para asegurar que se actualice la UI correctamente, también llamamos a handleCategoryFilter
    useProductStore.getState().handleCategoryFilter('');
  };

  return (
    <div className="flex items-center justify-start w-full my-2">
      <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-lg">
        <span className="mr-2 font-medium">
          Categoría activa: {categoryLabel === 'promociones' ? '🎁 Promociones' : categoryLabel}
        </span>
        <button
          onClick={handleClearCategory}
          className="text-sm bg-primary text-white px-2 py-1 rounded hover:bg-primarydark transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};
