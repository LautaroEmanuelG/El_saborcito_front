import { useSearch } from '../../hooks/useSearch';
import type { Categoria } from '../../utils/types';

type Props = {
  category: Categoria;
};

export const BtnCategoria = ({ category }: Props) => {
    const { handleSearch } = useSearch('');

  return (
    <button
      key={category.id}
      onClick={() => {
        handleSearch(category.nombre);
      }}
      className="text-xl font-bold hover:text-primary transition-colors">
      {category.nombre}
    </button>
  );
};
