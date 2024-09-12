import type { Categoria } from '../../utils/types';

type Props = {
  category: Categoria;
};

export const BtnCategoria = ({ category }: Props) => {
  return (
    <a
      key={category.id}
      href="#"
      className="text-xl font-bold hover:text-primary transition-colors">
      {category.nombre}
    </a>
  );
};
