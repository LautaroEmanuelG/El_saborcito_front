import { useEffect, useState } from 'react';
import { CardProducto } from './CardProducto';
import type { Categoria, Producto, ProductoValor } from '../../utils/types';
import { getAllCategorias } from '../../utils/services/axios/categoriaService';

type Props = {
  productos: ProductoValor[];
  onProductClick: (producto: ProductoValor) => void;
  setProductoModal: (producto: ProductoValor | null) => void;
};

export const ListaProductos = ({
  productos,
  onProductClick,
  setProductoModal,
}: Props) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    async function fetchCategorias() {
      const categoriasData = await getAllCategorias();
      console.log('categoriasData', categoriasData);
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

  console.log('productos', productos);
  return (
    <nav className="flex gap-4 md:gap-6 mb-6 flex-wrap">
      {categorias.map(categoria => (
        <div
          key={categoria.id}
          className="w-full">
          <span className="w-full flex justify-between pb-4">
            <h2 className="text-2xl font-bold">{categoria.nombre}</h2>
          </span>
          <div className="flex gap-4 md:gap-6 flex-wrap">
            {productos
              .filter(producto => producto.categoria.id === categoria.id)
              .map(producto => (
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
      ))}
    </nav>
  );
};
