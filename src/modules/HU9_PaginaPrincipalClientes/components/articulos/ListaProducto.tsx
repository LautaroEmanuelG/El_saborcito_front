import { useEffect, useState } from 'react';
import { CardProducto } from './CardProducto';
import { getAllCategorias } from '../../../../shared/services/categoriaService';
import type { ArticuloManufacturado } from '../../../../types/Articulo';
import type { Categoria } from '../../../../types/Categoria';

type Props = {
  articulos: ArticuloManufacturado[];
  setArticuloModal: (articulo: ArticuloManufacturado | null) => void;
  onProductClick: (articulo: ArticuloManufacturado) => void;
};

export const ListaProductos = ({ articulos, setArticuloModal, onProductClick }: Props) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    async function fetchCategorias() {
      const categoriasData = await getAllCategorias();
      setCategorias(categoriasData);
    }
    fetchCategorias();
  }, []);

  const handleProductClick = (articulo: ArticuloManufacturado) => {
    setArticuloModal(null); // Establecer a null para forzar la actualización
    setTimeout(() => {
      setArticuloModal(articulo); // Actualizar el producto modal y abrir el modal
    }, 0);
  };

  return (
    <nav className="flex gap-4 md:gap-6 mb-6 flex-wrap">
      {categorias.map((categoria) => {
        const productosFiltrados = articulos.filter(
          (articulo) => articulo.categoriaId === categoria.id
        );
        return productosFiltrados.length > 0 ? (
          <div key={categoria.id} className="w-full mt-4">
            <span className="w-full flex justify-between pb-4">
              <h2 className="text-lg sm:text-2xl font-bold">{categoria.denominacion}</h2>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-wrap">
              {productosFiltrados.map((articulo) => (
                <div className="" onClick={() => handleProductClick(articulo)} key={articulo.id}>
                  <CardProducto setProductoModal={setArticuloModal} articulo={articulo} />
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })}
    </nav>
  );
};
