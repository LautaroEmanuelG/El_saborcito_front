import { useState } from 'react';
import { CardProducto } from './CardProducto';
import listaProductos from '../../data/ListaProductos.json';
import type { Producto } from '../../utils/types';

type Props = {
  onProductClick: (producto: Producto) => void;
  productos: typeof listaProductos; // Definimos el tipo de productos como el de listaProductos
  setProductoModal: (producto: Producto | null) => void;
};

export const ListaProductos = ({
  productos = listaProductos,
  setProductoModal,
}: Props) => {
  const categorias = [
    ...new Set(productos.map(producto => producto.categoriaId)),
  ];

  // Estado para manejar la cantidad de productos visibles por categoría
  const [productosVisibles, setProductosVisibles] = useState<{
    [key: string]: number;
  }>(
    categorias.reduce((acc, categoria) => {
      acc[categoria] = 3; // Mostrar 3 productos inicialmente
      return acc;
    }, {} as { [key: string]: number })
  );

  const handleVerMas = (categoria: string) => {
    setProductosVisibles(prevState => {
      const totalProductos = productos.filter(
        producto => producto.categoriaId === categoria
      ).length;
      return {
        ...prevState,
        [categoria]: prevState[categoria] === 3 ? totalProductos : 3, // Alternar entre mostrar todos y mostrar 3
      };
    });
  };

  const handleProductClick = (producto: Producto) => {
    setProductoModal(null); // Establecer a null para forzar la actualización
    setTimeout(() => {
      setProductoModal(producto); // Actualizar el producto modal y abrir el modal
    }, 0);
  };

  return (
    <nav className="flex gap-4 md:gap-6 mb-6 flex-wrap">
      {categorias.map((categoria, catIndex) => (
        <div
          key={catIndex}
          className="w-full">
          <span className="w-full flex justify-between pb-4">
            <h2 className="text-2xl font-bold">{categoria}</h2>
            <button
              className="text-base font-normal hover:text-primary transition-colors"
              onClick={() => handleVerMas(categoria)}>
              {productosVisibles[categoria] === 3 ? 'Ver más' : 'Ver menos'}
            </button>
          </span>
          <div className="flex gap-4 md:gap-6 flex-wrap">
            {productos
              .filter(producto => producto.categoriaId === categoria)
              .slice(0, productosVisibles[categoria]) // Mostrar la cantidad de productos según el estado
              .map((producto, prodIndex) => (
                <div
                  onClick={() => handleProductClick(producto)}
                  key={prodIndex}>
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
