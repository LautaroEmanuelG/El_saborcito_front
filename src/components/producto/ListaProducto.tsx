import React, { useState } from 'react';
import { CardProducto } from './CardProducto';
import { Producto } from '../../utils/types';
import listaProductos from '../../data/ListaProductos.json';

export const ListaProductos = () => {
  const categorias = [
    ...new Set(listaProductos.map(producto => producto.categoria)),
  ];

  // Estado para manejar la cantidad de productos visibles por categoría
  const [productosVisibles, setProductosVisibles] = useState<{ [key: string]: number }>(
    categorias.reduce((acc, categoria) => {
      acc[categoria] = 3; // Mostrar 3 productos inicialmente
      return acc;
    }, {} as { [key: string]: number })
  );

  const handleVerMas = (categoria: string) => {
    setProductosVisibles(prevState => {
      const totalProductos = listaProductos.filter(producto => producto.categoria === categoria).length;
      return {
        ...prevState,
        [categoria]: prevState[categoria] === 3 ? totalProductos : 3, // Alternar entre mostrar todos y mostrar 3
      };
    });
  };

  return (
    <nav className="flex gap-4 md:gap-6 mb-6 flex-wrap">
      {categorias.map((categoria, catIndex) => (
        <div
          key={catIndex}
          className="w-full">
          <span className='w-full flex justify-between pb-4'>
            <h2 className="text-2xl font-bold">{categoria}</h2>
            <button
              className="text-base font-normal hover:text-primary transition-colors"
              onClick={() => handleVerMas(categoria)}>
              {productosVisibles[categoria] === 3 ? 'Ver más' : 'Ver menos'}
            </button>
          </span>
          <div className="flex gap-4 md:gap-6 flex-wrap">
            {listaProductos
              .filter(producto => producto.categoria === categoria)
              .slice(0, productosVisibles[categoria]) // Mostrar la cantidad de productos según el estado
              .map((producto, prodIndex) => (
                <CardProducto
                  key={prodIndex}
                  product={producto}
                />
              ))}
          </div>
        </div>
      ))}
    </nav>
  );
};