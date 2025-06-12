import { useState, useMemo } from 'react';
import { BtnCategoria } from './BtnCategoria';
import type { Categoria } from '../../../types/Categoria';

interface Props {
  categorias: Categoria[];
  onSearch: (query: string | string[]) => void; // Se mantiene para compatibilidad
  onCategoryFilter?: (query: string | string[]) => void; // Nueva prop para filtrar por categoría sin afectar el search term
  categoriasConProductosIds: Set<number>; // Agregamos esta prop
}

export const ListaCategorias = ({
  onSearch,
  onCategoryFilter,
  categorias: todasCategorias,
  categoriasConProductosIds,
}: Props) => {
  const [termAnterior, setTermAnterior] = useState<string | string[]>(''); // Puede ser string o array

  const categoriasOrganizadas = useMemo(() => {
    // Primer paso: mapeo inicial para identificar todas las categorías padre e hijas
    const todasLasCategoriasPadre: Categoria[] = [];
    const todasLasCategoriasHijas: Categoria[] = [];
    const padresDeHijosConProductos = new Set<number>();

    // Identificamos todas las categorías padre e hijas
    todasCategorias.forEach((cat) => {
      if (cat.id === undefined) return;

      if (cat.tipoCategoria && cat.tipoCategoria.id) {
        // Es una categoría hijo
        todasLasCategoriasHijas.push(cat);

        // Si esta categoría hijo tiene productos, marcamos a su padre como relevante
        if (categoriasConProductosIds.has(cat.id)) {
          padresDeHijosConProductos.add(cat.tipoCategoria.id);
        }
      } else {
        // Es una categoría padre
        todasLasCategoriasPadre.push(cat);
      }
    });

    // Mostrar todas las categorías padre que tengan productos o que sean relevantes
    const padres = todasLasCategoriasPadre.filter((padre) => {
      if (padre.id === undefined) return false;

      // Siempre mostrar todas las categorías padre, sin importar si tienen hijos o no
      // Esto corrige el problema donde categorías como "Pizza" no se mostraban
      return true;
    });

    // Organizamos las subcategorías por padre
    const hijosPorPadre: Record<number, Categoria[]> = {};
    todasLasCategoriasHijas.forEach((hijo) => {
      if (hijo.id === undefined || !hijo.tipoCategoria?.id) return;

      // Incluimos todas las subcategorías para todos los padres
      // Sin filtrar por si tienen productos o no
      const padreId = hijo.tipoCategoria.id;

      if (!hijosPorPadre[padreId]) {
        hijosPorPadre[padreId] = [];
      }
      hijosPorPadre[padreId].push(hijo);
    });

    return { padres, hijosPorPadre };
  }, [todasCategorias, categoriasConProductosIds]);

  return (
    <div className="container gap-2 sm:gap-6 py-4 flex w-full flex-wrap justify-start items-start">
      {categoriasOrganizadas.padres.map((categoriaPadre) => {
        // Asegurarse de que categoriaPadre.id exista antes de usarlo
        if (categoriaPadre.id === undefined) return null;

        // Obtener las subcategorías para este padre
        const subCategoriasConProductos =
          categoriasOrganizadas.hijosPorPadre[categoriaPadre.id] ?? [];

        return (
          <BtnCategoria
            termAnterior={termAnterior}
            setTermAnterior={setTermAnterior}
            key={categoriaPadre.id}
            onSearch={onSearch}
            onCategoryFilter={onCategoryFilter}
            category={categoriaPadre}
            subCategorias={subCategoriasConProductos}
          />
        );
      })}
    </div>
  );
};
