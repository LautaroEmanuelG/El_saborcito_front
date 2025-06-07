import { useState, useMemo } from 'react';
import { BtnCategoria } from './BtnCategoria';
import type { Categoria } from '../../../../types/Categoria';

interface Props {
  categorias: Categoria[];
  onSearch: (query: string | string[]) => void; // Modificado para aceptar un array de queries para categorías padre
}

export const ListaCategorias = ({ onSearch, categorias: todasCategorias }: Props) => {
  const [termAnterior, setTermAnterior] = useState<string | string[]>(''); // Puede ser string o array

  const categoriasOrganizadas = useMemo(() => {
    const padres: Categoria[] = [];
    const hijosPorPadre: Record<number, Categoria[]> = {};

    todasCategorias.forEach((cat) => {
      // Asegurarse de que cat.id exista antes de usarlo como clave
      if (cat.id === undefined) return;

      if (cat.tipoCategoria && cat.tipoCategoria.id) {
        if (!hijosPorPadre[cat.tipoCategoria.id]) {
          hijosPorPadre[cat.tipoCategoria.id] = [];
        }
        hijosPorPadre[cat.tipoCategoria.id].push(cat);
      } else {
        padres.push(cat);
      }
    });
    return { padres, hijosPorPadre };
  }, [todasCategorias]);

  return (
    <div className="container mx-auto gap-2 sm:gap-6 py-4 flex w-full flex-wrap justify-center items-start">
      {categoriasOrganizadas.padres.map((categoriaPadre) => {
        // Asegurarse de que categoriaPadre.id exista antes de usarlo
        if (categoriaPadre.id === undefined) return null;
        return (
          <BtnCategoria
            termAnterior={termAnterior}
            setTermAnterior={setTermAnterior}
            key={categoriaPadre.id}
            onSearch={onSearch}
            category={categoriaPadre}
            subCategorias={categoriasOrganizadas.hijosPorPadre[categoriaPadre.id] ?? []}
          />
        );
      })}
    </div>
  );
};
