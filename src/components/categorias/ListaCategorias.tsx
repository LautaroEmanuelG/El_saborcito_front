import listaCategorias from '../../data/ListaCategorias.json';
import type { Categoria } from '../../utils/types';
import { BtnCategoria } from './BtnCategoria';

export const ListaCategorias = () => {
  const categorias: Categoria[] = listaCategorias;
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
