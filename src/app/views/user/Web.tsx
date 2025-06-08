import { PaginaPrincipalClientes } from '../../../modules/HU9_PaginaPrincipalClientes/components/PaginaPrincipalClientes';
import { Header } from './header/Header';
import { useProductSearch } from '../../../shared/hooks/useProductSearch';

export const Web = () => {
  // Usamos el hook personalizado para la funcionalidad de búsqueda
  // El ProductProvider ya se encarga de cargar los datos en el montaje
  const { searchTerm, handleSearch, handleCategoryFilter, filteredProducts } = useProductSearch('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 max-w-full">
      <Header onSearch={handleSearch} />
      <PaginaPrincipalClientes
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        handleCategoryFilter={handleCategoryFilter}
        filteredProducts={filteredProducts}
      />
    </div>
  );
};
