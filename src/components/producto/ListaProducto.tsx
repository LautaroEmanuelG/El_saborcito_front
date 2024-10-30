import { useEffect, useState } from 'react';
import { CardProducto } from './CardProducto';
import type { Categoria, Producto } from '../../utils/types';
import { getAllProductos } from '../../utils/services/axios/productoService';
import { getAllCategorias } from '../../utils/services/axios/categoriaService';

type Props = {
  onProductClick: (producto: Producto) => void;
  setProductoModal: (producto: Producto | null) => void;
};

export const ListaProductos = ({ onProductClick, setProductoModal }: Props) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productosVisibles, setProductosVisibles] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function fetchProductos() {
      const productosData = await getAllProductos();
      console.log('productsData', productosData)
      setProductos(productosData);
    }
    async function fetchCategorias() {
      const categoriasData = await getAllCategorias();
      console.log('categoriasData', categoriasData)
      setCategorias(categoriasData);
    }
    fetchCategorias();
    fetchProductos();
  }, []);

  // useEffect(() => {
  //   const initialProductosVisibles = categorias.reduce((acc, categoria) => {
  //     acc[categoria.id] = 3; // Mostrar 3 productos inicialmente
  //     return acc;
  //   }, {} as { [key: string]: number });
  //   setProductosVisibles(initialProductosVisibles);
  // }, [categorias]);

  // const handleVerMas = (categoriaId: number) => {
  //   setProductosVisibles(prevState => {
  //     const totalProductos = productos.filter(
  //       producto => producto.categoria.id === categoriaId
  //     ).length;
  //     return {
  //       ...prevState,
  //       [categoriaId]: prevState[categoriaId] === 3 ? totalProductos : 3, // Alternar entre mostrar todos y mostrar 3
  //     };
  //   });
  // };

  const handleProductClick = (producto: Producto) => {
    setProductoModal(null); // Establecer a null para forzar la actualización
    setTimeout(() => {
      setProductoModal(producto); // Actualizar el producto modal y abrir el modal
    }, 0);
  };

  return (
    <nav className="flex gap-4 md:gap-6 mb-6 flex-wrap">
      {categorias.map((categoria) => (
        <div
          key={categoria.id}
          className="w-full">
          <span className="w-full flex justify-between pb-4">
            <h2 className="text-2xl font-bold">{categoria.nombre}</h2>
            {/* <button
              className="text-base font-normal hover:text-primary transition-colors"
              onClick={() => handleVerMas(categoria.id)}>
              {productosVisibles[categoria.id] === 3 ? 'Ver más' : 'Ver menos'}
            </button> */}
          </span>
          <div className="flex gap-4 md:gap-6 flex-wrap">
            {productos
              .filter(producto => producto.categoriaId === categoria.id)
              .slice(0, productosVisibles[categoria.id]) // Mostrar la cantidad de productos según el estado
              .map((producto) => (
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