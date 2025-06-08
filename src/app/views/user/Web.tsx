import { PaginaPrincipalClientes } from '../../../modules/HU9_PaginaPrincipalClientes/components/PaginaPrincipalClientes';
import { Header } from './header/Header';
import { useProductSearch } from '../../../shared/hooks/useProductSearch';
import { useEffect } from 'react';
import { useProductStore } from '../../../shared/store/useProductStore';

export const Web = () => {
  // Obtenemos el método fetchAllData del store para cargar los datos una sola vez
  const fetchAllData = useProductStore((state) => state.fetchAllData);

  // Usamos el hook personalizado para la funcionalidad de búsqueda
  const { searchTerm, handleSearch, filteredProducts } = useProductSearch('');

  // Cargamos los datos cuando se monta el componente
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 max-w-full">
      <Header onSearch={handleSearch} />
      <PaginaPrincipalClientes
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        filteredProducts={filteredProducts}
      />
    </div>
  );
};
