import { ReactNode, createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';
import type { ArticuloManufacturado, ArticuloInsumo } from '../../types/Articulo';
import type { Categoria } from '../../types/Categoria';
import { getAllCategorias } from '../services/categoriaService';
import {
  getAllArticuloManufacturados,
  canBeManufactured,
} from '../services/articuloManufacturadoService';
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

// Definición del tipo de estado para el store
type ProductState = {
  // Estados
  allProducts: (ArticuloManufacturado | ArticuloInsumo)[];
  filteredProducts: (ArticuloManufacturado | ArticuloInsumo)[];
  allCategorias: Categoria[];
  searchTerm: string;
  activeCategory: string | string[] | null;
  isLoading: boolean;
  error: string | null;
  // Nuevo: Estado de disponibilidad centralizado
  productAvailability: Record<number, boolean>;

  // Acciones
  fetchAllData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  handleSearch: (query: string | string[]) => void;
  handleCategoryFilter: (category: string | string[]) => void;
  resetFilters: () => void;
  // Nuevas acciones para manejar disponibilidad
  updateProductAvailability: (productId: number, available: boolean) => void;
  checkSingleProductAvailability: (productId: number) => Promise<void>;
  getArticuloCategoriaId: (articulo: ArticuloManufacturado | ArticuloInsumo) => number | undefined;
};

// Creación del store de Zustand
export const useProductStore = create<ProductState>((set, get) => ({
  // Estados iniciales
  allProducts: [],
  filteredProducts: [],
  allCategorias: [],
  searchTerm: '',
  activeCategory: null,
  isLoading: false,
  error: null,
  productAvailability: {},

  // Incluimos la función en el store
  getArticuloCategoriaId,

  // Nueva función para actualizar disponibilidad de un producto específico
  updateProductAvailability: (productId: number, available: boolean) => {
    set((state) => ({
      productAvailability: {
        ...state.productAvailability,
        [productId]: available,
      },
    }));
  },

  // Nueva función para verificar disponibilidad de un producto específico en background
  checkSingleProductAvailability: async (productId: number) => {
    try {
      const available = await canBeManufactured(productId);
      get().updateProductAvailability(productId, available);
    } catch (error) {
      console.error(`Error checking availability for product ${productId}:`, error);
      // En caso de error, marcamos como no disponible
      get().updateProductAvailability(productId, false);
    }
  },
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

      // Verificar disponibilidad inicial para todos los productos manufacturados
      const initialAvailability: Record<number, boolean> = {};
      // Primero marcamos todos los insumos como disponibles
      insumosData.forEach((insumo: ArticuloInsumo) => {
        if (insumo.id) {
          initialAvailability[insumo.id] = true;
        }
      });

      // Verificar disponibilidad de manufacturados en paralelo
      const manufacturadosChecks = manufacturadosData.map(
        async (manufacturado: ArticuloManufacturado) => {
          if (manufacturado.id) {
            try {
              const available = await canBeManufactured(manufacturado.id);
              initialAvailability[manufacturado.id] = available;
            } catch (error) {
              console.error(`Error checking availability for product ${manufacturado.id}:`, error);
              initialAvailability[manufacturado.id] = false;
            }
          }
        }
      );

      // Esperar todas las verificaciones
      await Promise.all(manufacturadosChecks); // Ordenar productos por disponibilidad dentro de cada categoría
      const sortedProducts = [...combinedProducts].sort((a, b) => {
        const catA = getArticuloCategoriaId(a);
        const catB = getArticuloCategoriaId(b);

        // Solo ordenar dentro de la misma categoría
        if (catA !== catB) return 0;

        const availableA = initialAvailability[a.id] ? 1 : 0;
        const availableB = initialAvailability[b.id] ? 1 : 0;

        // Productos disponibles primero
        return availableB - availableA;
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

      // Extraer IDs de categoría únicos de los productos cargados
      const categoriaIdsEnProductos = new Set<number>();
      combinedProducts.forEach((producto) => {
        const catId = getArticuloCategoriaId(producto);
        if (catId !== undefined) {
          categoriaIdsEnProductos.add(catId);
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
        allProducts: sortedProducts,
        filteredProducts: sortedProducts, // Inicialmente mostrar todos los productos
        allCategorias: categoriasRelevantes, // Ahora incluye padres de categorías con productos
        productAvailability: initialAvailability,
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
  // Resetear filtros para mostrar todos los productos
  resetFilters: () => {
    const { allProducts } = get();
    set({
      filteredProducts: allProducts,
      searchTerm: '',
      activeCategory: null,
    });
  },

  // Nueva función para filtrar por categorías sin modificar el searchTerm
  handleCategoryFilter: (category) => {
    const { allProducts, allCategorias } = get();

    // Guardar la categoría activa
    set({ activeCategory: category });

    // Si la categoría está vacía, mostrar todos los productos
    if (category === '' || (Array.isArray(category) && category.length === 0)) {
      set({ filteredProducts: allProducts });
      return;
    }

    let newFilteredList: (ArticuloManufacturado | ArticuloInsumo)[] = [];

    // Lógica de filtrado similar a handleSearch pero sin modificar searchTerm
    if (Array.isArray(category)) {
      // Categoría padre (múltiples subcategorías)
      const lowerCaseCategoriasDenominaciones = category.map((c) => c.toLowerCase().trim());

      const categoriaIdsHijas = allCategorias
        .filter(
          (cat) =>
            cat.id !== undefined &&
            lowerCaseCategoriasDenominaciones.includes(cat.denominacion.toLowerCase())
        )
        .map((cat) => cat.id!);

      if (categoriaIdsHijas.length > 0) {
        newFilteredList = allProducts.filter((producto) => {
          const productoCatId = getArticuloCategoriaId(producto);
          return productoCatId !== undefined && categoriaIdsHijas.includes(productoCatId);
        });
      }
    } else {
      // Categoría individual
      const lowerCaseCategory = category.toLowerCase().trim();

      const categoriaSeleccionada = allCategorias.find(
        (cat) => cat.denominacion.toLowerCase() === lowerCaseCategory
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

        // Filtrar productos por todas las categorías relevantes
        newFilteredList = allProducts.filter((producto) => {
          const productoCatId = getArticuloCategoriaId(producto);
          return productoCatId !== undefined && categoriasRelevantesIds.has(productoCatId);
        });
      }
    }

    set({ filteredProducts: newFilteredList });
  },

  // Manejar la búsqueda (por texto)
  handleSearch: (query) => {
    const { allProducts, allCategorias } = get();

    // Actualizar el término de búsqueda visible
    set({ searchTerm: query.toString(), activeCategory: null });

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
    }
    // Caso 2: Búsqueda por texto o categoría individual
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

// Crear contexto para el Provider
type ProductContextType = {
  store: typeof useProductStore;
};

const ProductContext = createContext<ProductContextType | null>(null);

// Props para el Provider
interface ProductProviderProps {
  children: ReactNode;
}

// Provider Component
export const ProductProvider = ({ children }: ProductProviderProps) => {
  // Cargar datos cuando se monte el componente
  useEffect(() => {
    useProductStore.getState().fetchAllData();
  }, []);

  return (
    <ProductContext.Provider value={{ store: useProductStore }}>{children}</ProductContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
