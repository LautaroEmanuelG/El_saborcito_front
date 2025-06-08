import { useCategoriesDebug } from '../../../shared/hooks/useCategoriesDebug';

export const CategoryDebug = () => {
  const { categorias, isLoading, error } = useCategoriesDebug();

  if (isLoading) return <div>Cargando categorías...</div>;
  if (error) return <div>Error: {error}</div>;

  // Organizamos categorías por tipo (padres e hijas)
  const padres: Record<number, string> = {};
  const hijas: Record<number, { id: number; nombre: string; padreId: number }[]> = {};
  const categoriasSinPadre: { id: number; nombre: string }[] = [];

  categorias.forEach((cat) => {
    if (cat.id === undefined) return;

    if (cat.tipoCategoria && cat.tipoCategoria.id !== undefined) {
      // Es una categoría hija
      const padreId = cat.tipoCategoria.id;
      if (!hijas[padreId]) {
        hijas[padreId] = [];
      }
      hijas[padreId].push({ id: cat.id, nombre: cat.denominacion, padreId });
    } else {
      // Es una categoría padre
      padres[cat.id] = cat.denominacion;
    }
  });

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">🔍 Debug de Categorías</h2>

      <div className="mb-4">
        <h3 className="font-bold">Categorías cargadas: {categorias.length}</h3>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">📑 Estructura de Categorías:</h3>
        <div className="bg-white p-4 rounded shadow">
          {Object.entries(padres).map(([padreId, padreNombre]) => (
            <div key={padreId} className="mb-4">
              <h4 className="font-semibold text-primary">
                {padreNombre} (ID: {padreId})
              </h4>
              <ul className="ml-4 mt-1">
                {hijas[Number(padreId)]?.map((hija) => (
                  <li key={hija.id} className="text-sm">
                    - {hija.nombre} (ID: {hija.id})
                  </li>
                )) || <li className="text-sm text-gray-500">Sin subcategorías</li>}
              </ul>
            </div>
          ))}

          {categoriasSinPadre.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Categorías sin padre:</h4>
              <ul className="ml-4">
                {categoriasSinPadre.map((cat) => (
                  <li key={cat.id} className="text-sm">
                    - {cat.nombre} (ID: {cat.id})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
