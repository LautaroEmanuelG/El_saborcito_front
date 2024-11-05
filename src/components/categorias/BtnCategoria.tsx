import { useSearch } from '../../hooks/useSearch';
import type { Categoria } from '../../utils/types';

type Props = {
  category: Categoria;
  onSearch: (query: string) => void;
};

export const BtnCategoria = ({ category, onSearch }: Props) => {
  const { searchTerm, setSearchTerm } = useSearch('');

  const handleCategoryClick = (categoriaNombre: string) => {
    if (searchTerm === categoriaNombre) {
      setSearchTerm('');
      onSearch('');
    } else {
      setSearchTerm(categoriaNombre);
      onSearch(categoriaNombre);
    }
  };

  return (
    <button
      key={category.id}
      onClick={() => handleCategoryClick(category.nombre)}
      className="text-xl font-bold hover:text-primary transition-colors">
      {category.nombre}
    </button>
  );
};
