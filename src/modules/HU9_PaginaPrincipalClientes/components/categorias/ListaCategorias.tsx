import { useState } from 'react';
import { BtnCategoria } from './BtnCategoria';
import type { Categoria } from '../../../../types/Categoria';

interface Props {
  categorias: Categoria[];
  onSearch: (query: string) => void;
}

export const ListaCategorias = ({ onSearch, categorias }: Props) => {
  const [termAnterior, setTermAnterior] = useState('');
  return (
    <div className="container mx-auto gap-2 sm:gap-6 py-4 flex w-full flex-wrap justify-center">
      {categorias.map((category) => (
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
