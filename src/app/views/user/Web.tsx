import { PaginaPrincipalClientes } from '../../../modules/HU9_PaginaPrincipalClientes/components/PaginaPrincipalClientes';
import { Header } from './header/Header';
import { useSearch } from '../../../shared/hooks/useSearch';

export const Web = () => {
  const { searchTerm, handleSearch, filteredProducts } = useSearch(''); // Estado para el término de búsqueda

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full">
      <Header onSearch={handleSearch} />
      <PaginaPrincipalClientes
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        filteredProducts={filteredProducts}
      />
    </div>
  );
};
