import { useEffect, useState } from 'react';
import { getAllArticulos } from '../services/articuloService';
import type { ArticuloManufacturado } from '../../types/Articulo';
import { getCategoriaById } from '../services/categoriaService';

export const useSearch = (initialValue: string = '') => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [filteredProducts, setFilteredProducts] = useState<ArticuloManufacturado[]>([]);
  const [productos, setProductos] = useState<ArticuloManufacturado[]>([]);
  useEffect(() => {
    async function fetchData() {
      const productosData = await getAllArticulos();
      console.log('productosData', productosData);
      setProductos(productosData);
      setFilteredProducts(productosData as ArticuloManufacturado[]);
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
      const fetchFilteredProducts = async () => {
        const filtered = await Promise.all(
          productos.map(async (producto) => {
            const matchesDenominacion = producto.denominacion
              ?.toLowerCase()
              .includes(query.toLowerCase());
            const matchesDescripcion = producto.descripcion
              ?.toLowerCase()
              .includes(query.toLowerCase());
            let matchesCategoria = false;
            if (producto.categoriaId) {
              try {
                const categoria = await getCategoriaById?.(producto.categoriaId);
                matchesCategoria =
                  categoria?.nombre?.toLowerCase().includes(query.toLowerCase()) ?? false;
              } catch {
                matchesCategoria = false;
              }
            }
            if (matchesDenominacion || matchesDescripcion || matchesCategoria) {
              return producto;
            }
            return null;
          })
        );
        setFilteredProducts(filtered.filter((p): p is ArticuloManufacturado => p !== null));
      };
      fetchFilteredProducts();
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
