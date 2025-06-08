import { create } from 'zustand';
import type { ArticuloManufacturado, ArticuloInsumo } from '../../types/Articulo';
import type { Categoria } from '../../types/Categoria';
import { getAllCategorias } from '../services/categoriaService';
import { getAllArticuloManufacturados } from '../services/articuloManufacturadoService';
import { getAllArticuloInsumoNoEsParaElaborar } from '../services/articuloInsumoService';

// Helper para obtener el ID de categoría de manera consistente
export const getArticuloCategoriaId = (
  articulo: ArticuloManufacturado | ArticuloInsumo
): number | undefined => {
  if ('categoriaId' in articulo && typeof articulo.categoriaId === 'number') {
    return articulo.categoriaId;
  }
  if (
    'categoria' in articulo &&
    typeof articulo.categoria === 'object' &&
    articulo.categoria !== null &&
    typeof articulo.categoria.id === 'number'
  ) {
    return articulo.categoria.id;
  }
  return undefined;
};

type ProductState = {
  // Estados
  allProducts: (ArticuloManufacturado | ArticuloInsumo)[];
  filteredProducts: (ArticuloManufacturado | ArticuloInsumo)[];
  allCategorias: Categoria[];
  searchTerm: string;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchAllData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  handleSearch: (query: string | string[]) => void;
  // Añadimos getArticuloCategoriaId como parte de la interfaz del store
  getArticuloCategoriaId: (articulo: ArticuloManufacturado | ArticuloInsumo) => number | undefined;
};

export const useProductStore = create<ProductState>((set, get) => ({
  // Estados iniciales
  allProducts: [],
  filteredProducts: [],
  allCategorias: [],
  searchTerm: '',
  isLoading: false,
  error: null,

  // Incluimos la función en el store
  getArticuloCategoriaId,
  // Acción para cargar todos los datos
  fetchAllData: async () => {
    try {
      set({ isLoading: true, error: null });

      const [manufacturadosData, insumosData, todasLasCategoriasDesdeServicio] = await Promise.all([
        getAllArticuloManufacturados(),
        getAllArticuloInsumoNoEsParaElaborar(),
        getAllCategorias(),
      ]);

      const combinedProducts = [...manufacturadosData, ...insumosData] as (
        | ArticuloManufacturado
        | ArticuloInsumo
      )[];

      // Extraer IDs de categoría únicos de los productos cargados
      const categoriaIdsEnProductos = new Set<number>();
      combinedProducts.forEach((producto) => {
        const catId = getArticuloCategoriaId(producto);
        if (catId !== undefined) {
          categoriaIdsEnProductos.add(catId);
        }
      });

      // Construir un mapa para identificar fácilmente la relación hijo -> padre
      const categoriaIdMap = new Map<number, Categoria>();
      const padresACategorias = new Map<number, number[]>(); // padreId -> [hijosIds]

      // Paso 1: Creamos un mapa de IDs a objetos categoría
      todasLasCategoriasDesdeServicio.forEach((cat: Categoria) => {
        if (cat.id !== undefined) {
          categoriaIdMap.set(cat.id, cat);
        }
      });

      // Paso 2: Organizamos las categorías en una estructura jerárquica
      todasLasCategoriasDesdeServicio.forEach((cat: Categoria) => {
        if (cat.id === undefined) return;

        // Si esta categoría tiene un padre
        if (cat.tipoCategoria && cat.tipoCategoria.id !== undefined) {
          const padreId = cat.tipoCategoria.id;
          if (!padresACategorias.has(padreId)) {
            padresACategorias.set(padreId, []);
          }
          padresACategorias.get(padreId)?.push(cat.id);
        }
      });

      // Paso 3: Calculamos todas las categorías relevantes incluyendo padres de categorías con productos
      const todasLasCategoriasRelevantesIds = new Set<number>();

      // Añadir todas las categorías con productos directamente
      categoriaIdsEnProductos.forEach((id) => todasLasCategoriasRelevantesIds.add(id));

      // Añadir todas las categorías padre que tengan hijos con productos
      categoriaIdsEnProductos.forEach((id) => {
        // Obtener la categoría
        const categoria = categoriaIdMap.get(id);
        if (categoria && categoria.tipoCategoria && categoria.tipoCategoria.id !== undefined) {
          // Añadir el padre de esta categoría
          todasLasCategoriasRelevantesIds.add(categoria.tipoCategoria.id);
        }
      });

      // Filtrar las categorías para incluir solo las relevantes
      const categoriasRelevantes = todasLasCategoriasDesdeServicio.filter(
        (categoria: Categoria) =>
          categoria.id !== undefined &&
          // La categoría tiene productos directamente
          (categoriaIdsEnProductos.has(categoria.id) ||
            // O la categoría es padre de otra categoría que tiene productos
            todasLasCategoriasRelevantesIds.has(categoria.id))
      );

      set({
        allProducts: combinedProducts,
        filteredProducts: combinedProducts, // Inicialmente mostrar todos los productos
        allCategorias: categoriasRelevantes, // Ahora incluye padres de categorías con productos
        isLoading: false,
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
      set({ error: 'Error al cargar productos y categorías', isLoading: false });
    }
  },

  // Establecer el término de búsqueda
  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  // Manejar la búsqueda (por texto o por categoría)
  handleSearch: (query) => {
    const { allProducts, allCategorias } = get();

    const currentSearchTermDisplay = Array.isArray(query) ? query.join(', ') : query;
    set({ searchTerm: currentSearchTermDisplay });

    // Si la query está vacía, mostrar todos los productos
    if (query === '' || (Array.isArray(query) && query.length === 0)) {
      set({ filteredProducts: allProducts });
      return;
    }

    let newFilteredList: (ArticuloManufacturado | ArticuloInsumo)[] = [];

    // Caso 1: Búsqueda por múltiples categorías (cuando se hace clic en categoría padre)
    if (Array.isArray(query)) {
      const lowerCaseQueryCategoriasDenominaciones = query.map((q) => q.toLowerCase().trim());

      const categoriaIdsHijas = allCategorias
        .filter(
          (cat) =>
            cat.id !== undefined &&
            lowerCaseQueryCategoriasDenominaciones.includes(cat.denominacion.toLowerCase())
        )
        .map((cat) => cat.id!);

      if (categoriaIdsHijas.length > 0) {
        newFilteredList = allProducts.filter((producto) => {
          const productoCatId = getArticuloCategoriaId(producto);
          return productoCatId !== undefined && categoriaIdsHijas.includes(productoCatId);
        });
      }
    } // Caso 2: Búsqueda por texto o categoría individual
    else {
      const lowerCaseQuery = query.toLowerCase().trim();

      // Primero intentar buscar exactamente por nombre de categoría
      const categoriaSeleccionada = allCategorias.find(
        (cat) => cat.denominacion.toLowerCase() === lowerCaseQuery
      );

      if (categoriaSeleccionada?.id) {
        // Preparamos para almacenar todos los IDs de categoría relevantes
        const categoriasRelevantesIds = new Set<number>();
        categoriasRelevantesIds.add(categoriaSeleccionada.id);

        // Buscar si esta categoría es padre de otras categorías
        const subcategoriasIds = allCategorias
          .filter((cat) => cat.tipoCategoria && cat.tipoCategoria.id === categoriaSeleccionada.id)
          .map((cat) => cat.id)
          .filter((id): id is number => id !== undefined);

        // Añadir subcategorías encontradas al conjunto de IDs
        subcategoriasIds.forEach((id) => categoriasRelevantesIds.add(id));

        // Filtrar productos por todas las categorías relevantes (la seleccionada y sus hijas)
        newFilteredList = allProducts.filter((producto) => {
          const productoCatId = getArticuloCategoriaId(producto);
          return productoCatId !== undefined && categoriasRelevantesIds.has(productoCatId);
        });
      } else {
        // Si no, buscar por texto en denominación o descripción
        newFilteredList = allProducts.filter((producto) => {
          const matchesDenominacion = producto.denominacion?.toLowerCase().includes(lowerCaseQuery);

          const matchesDescripcion =
            'descripcion' in producto && typeof producto.descripcion === 'string'
              ? producto.descripcion?.toLowerCase().includes(lowerCaseQuery)
              : false;

          return matchesDenominacion || matchesDescripcion;
        });
      }
    }

    set({ filteredProducts: newFilteredList });
  },
}));
