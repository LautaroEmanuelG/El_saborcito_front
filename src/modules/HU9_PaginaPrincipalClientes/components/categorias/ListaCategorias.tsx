import { useState, useMemo } from 'react';
import { BtnCategoria } from './BtnCategoria';
import type { Categoria } from '../../../../types/Categoria';

interface Props {
  categorias: Categoria[];
  onSearch: (query: string | string[]) => void; // Modificado para aceptar un array de queries para categorías padre
  categoriasConProductosIds: Set<number>; // Agregamos esta prop
}

export const ListaCategorias = ({
  onSearch,
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

    // En el caso de que estemos en una vista filtrada (búsqueda, etc.), solo mostramos categorías relevantes
    const padres = todasLasCategoriasPadre.filter((padre) => {
      if (padre.id === undefined) return false;

      // Siempre mostrar un padre si:
      // 1. Tiene productos directamente, o
      // 2. Al menos uno de sus hijos tiene productos, o
      // 3. Tiene subcategorías (siempre mostrar categorías padre como Sandwiches, Lomos, etc.)
      const tieneHijos = todasLasCategoriasHijas.some(
        (hijo) => hijo.tipoCategoria && hijo.tipoCategoria.id === padre.id
      );

      return (
        categoriasConProductosIds.has(padre.id) || // El padre tiene productos directamente
        padresDeHijosConProductos.has(padre.id) || // Algún hijo tiene productos
        tieneHijos // Tiene hijos (subcategorías)
      );
    });

    // Organizamos las subcategorías por padre
    const hijosPorPadre: Record<number, Categoria[]> = {};
    todasLasCategoriasHijas.forEach((hijo) => {
      if (hijo.id === undefined || !hijo.tipoCategoria?.id) return;

      // Solo incluimos esta subcategoría si:
      // 1. Su padre es relevante (ya lo filtramos en el paso anterior), o
      // 2. Esta subcategoría específica tiene productos
      const padreId = hijo.tipoCategoria.id;
      const padreEsRelevante = padres.some((p) => p.id === padreId);

      if (padreEsRelevante || categoriasConProductosIds.has(hijo.id)) {
        if (!hijosPorPadre[padreId]) {
          hijosPorPadre[padreId] = [];
        }
        hijosPorPadre[padreId].push(hijo);
      }
    });

    return { padres, hijosPorPadre };
  }, [todasCategorias, categoriasConProductosIds]);

  return (
    <div className="container mx-auto gap-2 sm:gap-6 py-4 flex w-full flex-wrap justify-center items-start">
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
            category={categoriaPadre}
            subCategorias={subCategoriasConProductos}
          />
        );
      })}
    </div>
  );
};
