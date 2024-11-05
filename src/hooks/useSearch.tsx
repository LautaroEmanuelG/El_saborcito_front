import { useEffect, useState } from 'react';
import type { ProductoValor } from '../utils/types';
import { getAllProductos } from '../utils/services/axios/productoService';

export const useSearch = (initialValue: string = '') => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [filteredProducts, setFilteredProducts] = useState<ProductoValor[]>([]);
  const [productos, setProductos] = useState<ProductoValor[]>([]);
  useEffect(() => {
    async function fetchData() {
      const productosData = await getAllProductos();
      setProductos(productosData);
      setFilteredProducts(productosData as ProductoValor[]);
    }
    fetchData();
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query); // Actualizar el término de búsqueda
    if (query === '') {
      setFilteredProducts(productos); // Mostrar todos los productos si el término de búsqueda está vacío
    } else {
      setFilteredProducts(
        productos.filter(
          producto =>
            producto.nombre.toLowerCase().includes(query.toLowerCase()) ||
            producto.descripcion?.toLowerCase().includes(query.toLowerCase()) ||
            producto.categoria.nombre
              .toLowerCase()
              .includes(query.toLowerCase())
        )
      );
    }
  };
  return {
    searchTerm,
    setSearchTerm,
    handleSearchChange,
    filteredProducts,
    setFilteredProducts,
    handleSearch,
  };
};
