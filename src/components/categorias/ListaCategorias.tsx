import type { Categoria } from '../../utils/types';
import { BtnCategoria } from './BtnCategoria';

interface Props {
  categorias: Categoria[];
}

export const ListaCategorias = ({ categorias }: Props) => {
  return (
    <div className="container mx-auto gap-6 py-4 flex w-full">
      {categorias.map(category => (
        <BtnCategoria
          key={category.id}
          category={category}
        />
      ))}
    </div>
  );
};
