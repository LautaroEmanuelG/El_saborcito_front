import { useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';

/**
 * Hook personalizado para búsqueda que utiliza el ProductStore de Zustand
 * @param initialValue - Valor inicial para la búsqueda (opcional)
 */
export const useProductSearch = (initialValue: string = '') => {
  const {
    searchTerm,
    filteredProducts,
    setSearchTerm,
    handleSearch,
    fetchAllData,
    allProducts,
    allCategorias,
    isLoading,
    error,
  } = useProductStore();

  // Cargar datos al montar el componente si aún no están cargados
  useEffect(() => {
    if (allProducts.length === 0) {
      fetchAllData();
    }
  }, [allProducts.length, fetchAllData]);

  // Aplicar valor inicial si existe y los productos ya están cargados
  useEffect(() => {
    if (initialValue && allProducts.length > 0) {
      handleSearch(initialValue);
    }
  }, [initialValue, allProducts, handleSearch]);

  // Función para manejar cambios en el input de búsqueda
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(event.target.value);
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredProducts,
    allProducts,
    allCategorias,
    handleSearch,
    handleSearchInputChange,
    isLoading,
    error,
  };
};
