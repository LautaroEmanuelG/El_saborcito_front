import { useEffect, useState } from 'react';
import { ArticuloManufacturado, ArticuloInsumo } from '../../../../types/Articulo';
import { Categoria } from '../../../../types/Categoria';
import { getAllCategorias } from '../../../../shared/services/categoriaService'; // Corregido
import { CardProducto } from './CardProducto';

interface Props {
  articulos: (ArticuloManufacturado | ArticuloInsumo)[];
  onProductClick: (articulo: ArticuloManufacturado | ArticuloInsumo | null) => void; // Modificado para aceptar null
}

export const ListaProductos = ({ articulos, onProductClick }: Props) => {
  const [todasLasCategorias, setTodasLasCategorias] = useState<Categoria[]>([]);

  const getArticuloCategoriaId = (
    articulo: ArticuloManufacturado | ArticuloInsumo
  ): number | undefined => {
    if ('categoriaId' in articulo && typeof articulo.categoriaId === 'number') {
      return articulo.categoriaId;
    } else if (
      'categoria' in articulo &&
      articulo.categoria &&
      typeof articulo.categoria.id === 'number'
    ) {
      return articulo.categoria.id;
    }
    return undefined;
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getAllCategorias();
        setTodasLasCategorias(data);
      } catch (error) {
        console.error('Error fetching categorias:', error);
      }
    };
    fetchCategorias();
  }, []);

  const categoriasConProductos = todasLasCategorias.filter((categoria) =>
    articulos.some((articulo) => getArticuloCategoriaId(articulo) === categoria.id)
  );

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
          <div key={categoria.id} className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-negro border-b-2 border-primary pb-2">
              {categoria.denominacion}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 md:gap-6 flex-wrap">
              {productosFiltrados.map((articulo: ArticuloManufacturado | ArticuloInsumo) => (
                <CardProducto
                  key={articulo.id}
                  articulo={articulo}
                  setProductoModal={onProductClick} // onProductClick ahora es compatible
                />
              ))}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
};
