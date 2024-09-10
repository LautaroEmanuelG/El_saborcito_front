import categorias from '../../data/ListaCategorias.json';
import { BtnCategoria } from './BtnCategoria';

type Props = {};

export const ListaCategorias = ({}: Props) => {
  return (
    <nav className="flex gap-4 md:gap-6 mb-6">
      {categorias.map(category => (
        <BtnCategoria
          key={category.id}
          category={category}
        />
      ))}
    </nav>
  );
};
