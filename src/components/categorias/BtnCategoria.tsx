import type { Categoria } from '../../utils/types';

type Props = {
  category: Categoria;
  onSearch: (query: string) => void;
  termAnterior: string;
  setTermAnterior: (term: string) => void;
};

export const BtnCategoria = ({
  category,
  onSearch,
  termAnterior,
  setTermAnterior,
}: Props) => {
  const handleCategoryClick = (categoriaNombre: string) => {
    setTermAnterior(categoriaNombre);
    if (categoriaNombre === termAnterior) {
      onSearch('');
      console.log('borrado el nombre');
      setTermAnterior('');
    } else {
      onSearch(categoriaNombre);
      console.log('colocado el nombre');
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
