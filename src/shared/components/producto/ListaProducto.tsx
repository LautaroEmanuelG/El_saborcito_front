import { useEffect, useState } from 'react';
import { CardProducto } from './CardProducto';
import type { Categoria, ProductoValor } from '../../../types/types';
import { getAllCategorias } from '../../../shared/services/categoriaService';

type Props = {
  productos: ProductoValor[];
  onProductClick: (producto: ProductoValor) => void;
  setProductoModal: (producto: ProductoValor | null) => void;
};

export const ListaProductos = ({ productos, setProductoModal }: Props) => {
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

  return (
    <nav className="flex gap-4 md:gap-6 mb-6 flex-wrap">
      {categorias.map((categoria) => {
        const productosFiltrados = productos.filter(
          (producto) => producto.categoria.id === categoria.id
        );
        return productosFiltrados.length > 0 ? (
          <div key={categoria.id} className="w-full mt-4">
            <span className="w-full flex justify-between pb-4">
              <h2 className="text-lg sm:text-2xl font-bold">{categoria.nombre}</h2>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-wrap">
              {productosFiltrados.map((producto) => (
                <div className="" onClick={() => handleProductClick(producto)} key={producto.id}>
                  <CardProducto setProductoModal={setProductoModal} product={producto} />
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })}
    </nav>
  );
};
