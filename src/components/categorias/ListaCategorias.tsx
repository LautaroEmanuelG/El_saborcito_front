import { useState } from 'react';
import type { Categoria } from '../../utils/types';
import { BtnCategoria } from './BtnCategoria';

interface Props {
  categorias: Categoria[];
  onSearch: (query: string) => void;
}

export const ListaCategorias = ({ onSearch, categorias }: Props) => {
  const [termAnterior, setTermAnterior] = useState('');
  return (
    <div className="container mx-auto gap-6 py-4 flex w-full">
      {categorias.map(category => (
        <BtnCategoria
          termAnterior={termAnterior}
          setTermAnterior={setTermAnterior}
          key={category.id}
          onSearch={onSearch}
          category={category}
        />
      ))}
    </div>
  );
};
