import { useEffect } from 'react';
import { useProductStore } from '../providers/ProductProvider';

/**
 * Hook personalizado para búsqueda que utiliza el ProductStore de Zustand
 * @param initialValue - Valor inicial para la búsqueda (opcional)
 */
export const useProductSearch = (initialValue: string = '') => {
  // Obtenemos el estado y las acciones directamente del store
  const {
    searchTerm,
    filteredProducts,
    allProducts,
    allCategorias,
    activeCategory,
    isLoading,
    error,
    handleSearch,
    handleCategoryFilter,
    setSearchTerm,
    resetFilters,
  } = useProductStore();

  // Aplicar valor inicial si existe y los productos ya están cargados
  useEffect(() => {
    if (initialValue && allProducts.length > 0) {
      handleSearch(initialValue);
    }
  }, [initialValue, allProducts.length, handleSearch]);

  // Función para manejar cambios en el input de búsqueda
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(event.target.value);
  };

  return {
    searchTerm,
    activeCategory,
    setSearchTerm,
    filteredProducts,
    allProducts,
    allCategorias,
    handleSearch,
    handleCategoryFilter,
    handleSearchInputChange,
    resetFilters,
    isLoading,
    error,
  };
};
