import { useEffect, useState, useCallback } from 'react';
import type { ArticuloInsumo, ArticuloManufacturado } from '../../types/Articulo';
import { getAllCategorias } from '../services/categoriaService'; // Importar getAllCategorias
import { getAllArticuloManufacturados } from '../services/articuloManufacturadoService';
import { getAllArticuloInsumoNoEsParaElaborar } from '../services/articuloInsumoService';
import type { Categoria } from '../../types/Categoria';

// Helper para obtener el ID de categoría de manera consistente
const getArticuloCategoriaId = (
  articulo: ArticuloManufacturado | ArticuloInsumo
): number | undefined => {
  if ('categoriaId' in articulo && typeof articulo.categoriaId === 'number') {
    // Es ArticuloManufacturado
    return articulo.categoriaId;
  }
  if (
    'categoria' in articulo &&
    typeof articulo.categoria === 'object' &&
    articulo.categoria !== null &&
    typeof articulo.categoria.id === 'number'
  ) {
    // Es ArticuloInsumo
    return articulo.categoria.id;
  }
  return undefined;
};

export const useSearch = (initialValue: string = '') => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [allProducts, setAllProducts] = useState<(ArticuloManufacturado | ArticuloInsumo)[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<
    (ArticuloManufacturado | ArticuloInsumo)[]
  >([]);
  const [allCategorias, setAllCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [manufacturadosData, insumosData, categoriasData] = await Promise.all([
          getAllArticuloManufacturados(),
          getAllArticuloInsumoNoEsParaElaborar(),
          getAllCategorias(),
        ]);
        const combinedProducts = [...manufacturadosData, ...insumosData] as (
          | ArticuloManufacturado
          | ArticuloInsumo
        )[];
        setAllProducts(combinedProducts);
        setFilteredProducts(combinedProducts);
        setAllCategorias(categoriasData);
      } catch (error) {
        console.error('Error al cargar datos iniciales en useSearch:', error);
        setAllProducts([]);
        setFilteredProducts([]);
        setAllCategorias([]);
      }
    };
    fetchData();
  }, []);

  const handleSearch = useCallback(
    (query: string | string[]) => {
      const currentSearchTermDisplay = Array.isArray(query)
        ? query.join(', ') // Para visualización o logging
        : query;
      setSearchTerm(currentSearchTermDisplay);

      if (query === '' || (Array.isArray(query) && query.length === 0)) {
        setFilteredProducts(allProducts);
        return;
      }

      let newFilteredList: (ArticuloManufacturado | ArticuloInsumo)[] = [];

      if (Array.isArray(query)) {
        const lowerCaseQueryCategoriasDenominaciones = query.map((q) => q.toLowerCase().trim());

        const categoriaIdsHijas = allCategorias
          .filter(
            (cat) =>
              cat.id !== undefined &&
              lowerCaseQueryCategoriasDenominaciones.includes(cat.denominacion.toLowerCase())
          )
          .map((cat) => cat.id!); // Usamos non-null assertion porque ya filtramos undefined

        if (categoriaIdsHijas.length > 0) {
          newFilteredList = allProducts.filter((producto) => {
            const productoCatId = getArticuloCategoriaId(producto);
            return productoCatId !== undefined && categoriaIdsHijas.includes(productoCatId);
          });
        } else {
          newFilteredList = [];
        }
      } else {
        const lowerCaseQuery = query.toLowerCase().trim();
        const categoriaSeleccionada = allCategorias.find(
          (cat) => cat.denominacion.toLowerCase() === lowerCaseQuery
        );

        if (categoriaSeleccionada?.id) {
          newFilteredList = allProducts.filter(
            (producto) => getArticuloCategoriaId(producto) === categoriaSeleccionada.id
          );
        } else {
          newFilteredList = allProducts.filter((producto) => {
            const matchesDenominacion = producto.denominacion
              ?.toLowerCase()
              .includes(lowerCaseQuery);
            const matchesDescripcion =
              'descripcion' in producto && typeof producto.descripcion === 'string'
                ? producto.descripcion?.toLowerCase().includes(lowerCaseQuery)
                : false;
            return matchesDenominacion || matchesDescripcion;
          });
        }
      }
      setFilteredProducts(newFilteredList);
    },
    [allProducts, allCategorias]
  );

  useEffect(() => {
    // Si el initialValue cambia o si el searchTerm actual difiere del initialValue (y no es la carga inicial)
    // Esto es para manejar cambios externos a searchTerm o la carga inicial.
    // La condición original `searchTerm !== initialValue || initialValue === ''` puede ser compleja.
    // Simplificamos: si el hook se usa con un valor inicial, se filtra con ese valor.
    // Los cambios posteriores a searchTerm (desde input o clic) ya llaman a handleSearch.
    if (initialValue && allProducts.length > 0) {
      // Solo si hay valor inicial y productos cargados
      handleSearch(initialValue);
    } else if (!initialValue && allProducts.length > 0) {
      // Si no hay valor inicial, mostrar todos
      handleSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, allProducts, allCategorias]); // No incluir handleSearch aquí para evitar bucles si no es estable

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(event.target.value);
  };

  return {
    searchTerm,
    setSearchTerm, // Exponer para limpieza externa si es necesario
    handleSearchInputChange, // Para el input de búsqueda
    filteredProducts,
    // setFilteredProducts, // Generalmente no se necesita exponer si el hook maneja el filtrado
    handleSearch, // Para búsquedas programáticas (ej. click en categoría)
  };
};
