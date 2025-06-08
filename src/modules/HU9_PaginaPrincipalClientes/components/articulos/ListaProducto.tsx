import { useMemo } from 'react';
import { ArticuloManufacturado, ArticuloInsumo } from '../../../../types/Articulo';
import { useProductStore, getArticuloCategoriaId } from '../../../../shared/store/useProductStore';
import { CardProducto } from './CardProducto';

interface Props {
  articulos: (ArticuloManufacturado | ArticuloInsumo)[];
  onProductClick: (articulo: ArticuloManufacturado | ArticuloInsumo | null) => void;
}

export const ListaProductos = ({ articulos, onProductClick }: Props) => {
  // Usar el store para obtener las categorías
  const { allCategorias } = useProductStore();

  // Filtrar categorías que tienen productos en la lista actual
  const categoriasConProductos = useMemo(() => {
    return allCategorias.filter((categoria) =>
      articulos.some((articulo) => getArticuloCategoriaId(articulo) === categoria.id)
    );
  }, [articulos, allCategorias]);

  if (articulos.length === 0) {
    return (
      <p className="text-center text-gray-500 text-xl mt-10">
        No se encontraron productos para esta búsqueda.
      </p>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-wrap md:gap-6 mb-6">
      {categoriasConProductos.map((categoria) => {
        const productosFiltrados = articulos.filter(
          (articulo: ArticuloManufacturado | ArticuloInsumo) =>
            getArticuloCategoriaId(articulo) === categoria.id
        );
        return productosFiltrados.length > 0 ? (
          <div key={categoria.id} className="mb-12 w-full">
            <h2 className="text-3xl font-bold mb-6 text-negro border-b-2 border-primary pb-2">
              {categoria.denominacion}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 md:gap-6 flex-wrap">
              {productosFiltrados.map((articulo: ArticuloManufacturado | ArticuloInsumo) => (
                <CardProducto
                  key={articulo.id}
                  articulo={articulo}
                  setProductoModal={onProductClick}
                />
              ))}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
};
