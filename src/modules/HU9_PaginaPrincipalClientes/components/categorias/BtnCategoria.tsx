import type { Categoria } from '../../../../types/Categoria';

type Props = {
  category: Categoria;
  onSearch: (query: string) => void;
  termAnterior: string;
  setTermAnterior: (term: string) => void;
};

export const BtnCategoria = ({ category, onSearch, termAnterior, setTermAnterior }: Props) => {
  const handleCategoryClick = (categoriaNombre: string) => {
    setTermAnterior(categoriaNombre);
    if (categoriaNombre === termAnterior) {
      onSearch('');
      setTermAnterior('');
    } else {
      onSearch(categoriaNombre);
    }
  };

  return (
    <button
      key={category.id}
      onClick={() => handleCategoryClick(category.denominacion)}
      className="text-lg sm:text-xl font-bold hover:text-primary transition-colors"
    >
      {category.denominacion}
    </button>
  );
};
