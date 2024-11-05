import { useEffect, useState } from 'react';
import type { Categoria, ProductoValor } from '../../utils/types';
import { CardProducto } from './CardProducto';
import { getAllCategorias } from '../../utils/services/axios/categoriaService';
import { useSearch } from '../../hooks/useSearch';

interface Props {
  productos: ProductoValor[];
  searchCategory: string;
  setSearchCategory: (value: string) => void;
  setProductoModal: (producto: ProductoValor | null) => void;
  onSearch: (query: string) => void;
}

export const ListaCategoria = ({
  onSearch,
  productos,
  setProductoModal,
}: Props) => {
  const { setSearchTerm } = useSearch('');

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  useEffect(() => {
    async function fetchCategorias() {
      const categoriasData = await getAllCategorias();
      setCategorias(categoriasData);
    }
    fetchCategorias();
  }, []);

  const handleProductClick = (producto: ProductoValor) => {
    setProductoModal(null); // Establecer a null para forzar la actualización
    setTimeout(() => {
      setProductoModal(producto); // Actualizar el producto modal y abrir el modal
    }, 0);
  };

  const handleCategoryClick = (categoriaNombre: string) => {
    setSearchTerm(categoriaNombre); // Actualizar el término de búsqueda en el hook
    onSearch(categoriaNombre); // Llamar a la función de búsqueda con el nombre de la categoría
  };

  return (
    <nav className="flex gap-4 md:gap-6 mb-6 flex-wrap">
      {categorias.map(categoria => {
        const productosFiltrados = productos.filter(
          producto => producto.categoria.id === categoria.id
        );
        return productosFiltrados.length > 0 ? (
          <div
            key={categoria.id}
            className="w-full">
            <button
              onClick={() => handleCategoryClick(categoria.nombre)}
              className="w-full flex justify-between pb-4">
              <h2 className="text-2xl font-bold">{categoria.nombre}</h2>
            </button>
            <div className="flex gap-4 md:gap-6 flex-wrap">
              {productosFiltrados.map(producto => (
                <div
                  onClick={() => handleProductClick(producto)}
                  key={producto.id}>
                  <CardProducto
                    setProductoModal={setProductoModal}
                    product={producto}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })}
    </nav>
  );
};
