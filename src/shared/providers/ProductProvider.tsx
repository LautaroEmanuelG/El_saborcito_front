import { ReactNode, createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';
import type { ArticuloManufacturado, ArticuloInsumo } from '../../types/Articulo';
import type { Categoria } from '../../types/Categoria';
import type { Promocion, PromocionNormalizada } from '../../types/Promocion';
import { getAllCategorias } from '../services/categoriaService';
import {
  getAllArticuloManufacturados,
  canBeManufactured,
} from '../services/articuloManufacturadoService';
import { getAllArticuloInsumoNoEsParaElaborar, canBeSold } from '../services/articuloInsumoService';
import {
  getAllPromocionesVigentes,
  normalizePromociones,
  analizarPromocionAvailability,
} from '../../modules/HU11_12_Carrito_Confirmacion/service/Logic';

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

// 🔄 Helper para detectar si un item es una promoción normalizada
export const isPromocionNormalizada = (
  item: ArticuloManufacturado | ArticuloInsumo | PromocionNormalizada
): item is PromocionNormalizada => {
  return 'tipo' in item && item.tipo === 'promocion';
};

// 🔄 Helper para obtener ID de cualquier item (producto o promoción)
export const getItemId = (
  item: ArticuloManufacturado | ArticuloInsumo | PromocionNormalizada
): number => {
  return item.id;
};

// 🔄 Helper para combinar productos y promociones cuando están activas
export const combineProductsAndPromociones = (
  products: (ArticuloManufacturado | ArticuloInsumo)[],
  promociones: PromocionNormalizada[],
  showPromociones: boolean
): (ArticuloManufacturado | ArticuloInsumo | PromocionNormalizada)[] => {
  if (showPromociones) {
    return [...promociones]; // Solo promociones cuando están activas
  }
  return [...products]; // Solo productos cuando no están activas las promociones
};

// Definición del tipo de estado para el store
type ProductState = {
  // Estados existentes
  allProducts: (ArticuloManufacturado | ArticuloInsumo)[];
  filteredProducts: (ArticuloManufacturado | ArticuloInsumo)[];
  allCategorias: Categoria[];
  searchTerm: string;
  activeCategory: string | string[] | null;
  isLoading: boolean;
  error: string | null;
  // Estado de disponibilidad centralizado
  productAvailability: Record<number, boolean>;

  // 🎁 Nuevos estados para promociones (integradas como productos especiales)
  allPromociones: Promocion[];
  filteredPromociones: PromocionNormalizada[];
  promocionesVigentes: Promocion[];
  promocionAvailability: Record<number, boolean>;
  showPromociones: boolean;
  // 🔄 Nuevo: productos combinados (productos + promociones normalizadas)
  allItemsIncludingPromociones: (ArticuloManufacturado | ArticuloInsumo | PromocionNormalizada)[];
  filteredItemsIncludingPromociones: (
    | ArticuloManufacturado
    | ArticuloInsumo
    | PromocionNormalizada
  )[];

  // Acciones existentes
  fetchAllData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  handleSearch: (query: string | string[]) => void;
  handleCategoryFilter: (category: string | string[]) => void;
  resetFilters: () => void;
  // Acciones para manejar disponibilidad de productos
  updateProductAvailability: (productId: number, available: boolean) => void;
  checkSingleProductAvailability: (productId: number) => Promise<void>;
  getArticuloCategoriaId: (articulo: ArticuloManufacturado | ArticuloInsumo) => number | undefined;

  // 🎁 Nuevas acciones para promociones
  fetchPromociones: () => Promise<void>;
  updatePromocionAvailability: (promocionId: number, available: boolean) => void;
  checkPromocionAvailability: (promocionId: number) => Promise<void>;
  toggleShowPromociones: () => void;
};

// Creación del store de Zustand
export const useProductStore = create<ProductState>((set, get) => ({
  // Estados iniciales de productos
  allProducts: [],
  filteredProducts: [],
  allCategorias: [],
  searchTerm: '',
  activeCategory: null,
  isLoading: false,
  error: null,
  productAvailability: {},
  // 🎁 Estados iniciales de promociones
  allPromociones: [],
  filteredPromociones: [],
  promocionesVigentes: [],
  promocionAvailability: {},
  showPromociones: false,
  // 🔄 Estados combinados (productos + promociones)
  allItemsIncludingPromociones: [],
  filteredItemsIncludingPromociones: [],

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
  }, // Nueva función para verificar disponibilidad de un producto específico en background
  checkSingleProductAvailability: async (productId: number) => {
    try {
      // Buscar si es un artículo manufacturado
      const { allProducts } = get();
      const product = allProducts.find((p) => p.id === productId);

      let available = false;

      if (product) {
        // Verificar si es ArticuloInsumo (tiene stockActual)
        if ('stockActual' in product) {
          // Es un insumo, verificar stock
          available = await canBeSold(productId);
        } else {
          // Es un manufacturado, verificar si puede fabricarse
          available = await canBeManufactured(productId);
        }
      } else {
        // Si no encontramos el producto, intentar ambos endpoints
        try {
          available = await canBeManufactured(productId);
        } catch {
          try {
            available = await canBeSold(productId);
          } catch {
            available = false;
          }
        }
      }

      get().updateProductAvailability(productId, available);
    } catch (error) {
      console.error(`Error checking availability for product ${productId}:`, error);
      // En caso de error, marcamos como no disponible
      get().updateProductAvailability(productId, false);
    }
  },

  // 🎁 **NUEVAS FUNCIONES PARA PROMOCIONES**

  // Cargar promociones vigentes
  fetchPromociones: async () => {
    try {
      // Usar sucursal hardcodeada temporalmente
      const SUCURSAL_ID = 1;
      const promocionesData = await getAllPromocionesVigentes(SUCURSAL_ID);
      const promocionesNormalizadas = normalizePromociones(promocionesData);

      // Verificar disponibilidad inicial de promociones
      const initialPromocionAvailability: Record<number, boolean> = {};
      const promocionChecks = promocionesData.map(async (promocion) => {
        try {
          const available = await analizarPromocionAvailability(promocion);
          initialPromocionAvailability[promocion.id] = available;
        } catch (error) {
          console.error(`Error checking availability for promocion ${promocion.id}:`, error);
          initialPromocionAvailability[promocion.id] = false;
        }
      });
      await Promise.all(promocionChecks);

      // 🔄 Actualizar items combinados después de cargar promociones
      const { allProducts, showPromociones } = get();
      const combinedItems = combineProductsAndPromociones(
        allProducts,
        promocionesNormalizadas,
        showPromociones
      );

      set({
        allPromociones: promocionesData,
        promocionesVigentes: promocionesData,
        filteredPromociones: promocionesNormalizadas,
        promocionAvailability: initialPromocionAvailability,
        // 🔄 Actualizar items combinados
        allItemsIncludingPromociones: combinedItems,
        filteredItemsIncludingPromociones: combinedItems,
      });
    } catch (error) {
      console.error('Error al cargar promociones:', error);
    }
  },

  // Actualizar disponibilidad de una promoción específica
  updatePromocionAvailability: (promocionId: number, available: boolean) => {
    set((state) => ({
      promocionAvailability: {
        ...state.promocionAvailability,
        [promocionId]: available,
      },
    }));
  },

  // Verificar disponibilidad de una promoción específica en background
  checkPromocionAvailability: async (promocionId: number) => {
    try {
      const { allPromociones } = get();
      const promocion = allPromociones.find((p) => p.id === promocionId);
      if (promocion) {
        const available = await analizarPromocionAvailability(promocion);
        get().updatePromocionAvailability(promocionId, available);
      }
    } catch (error) {
      console.error(`Error checking availability for promocion ${promocionId}:`, error);
      get().updatePromocionAvailability(promocionId, false);
    }
  }, // Toggle para mostrar/ocultar promociones
  toggleShowPromociones: () => {
    const { allProducts, filteredPromociones } = get();
    const newShowPromociones = !get().showPromociones;

    // Combinar items según el nuevo estado
    const combinedItems = combineProductsAndPromociones(
      allProducts,
      filteredPromociones,
      newShowPromociones
    );

    set((state) => ({
      showPromociones: newShowPromociones,
      // Cuando se activan promociones, resetear filtros de productos
      searchTerm: newShowPromociones ? '' : state.searchTerm,
      activeCategory: newShowPromociones ? 'promociones' : null, // Marcar promociones como categoría activa
      filteredProducts: newShowPromociones ? allProducts : state.filteredProducts,
      // 🔄 Actualizar items combinados
      allItemsIncludingPromociones: combinedItems,
      filteredItemsIncludingPromociones: combinedItems,
    }));
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
      )[]; // Verificar disponibilidad inicial para todos los productos
      const initialAvailability: Record<number, boolean> = {};

      // Verificar disponibilidad de manufacturados e insumos en paralelo
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

      // Verificar disponibilidad de insumos en paralelo
      const insumosChecks = insumosData.map(async (insumo: ArticuloInsumo) => {
        if (insumo.id) {
          try {
            const available = await canBeSold(insumo.id);
            initialAvailability[insumo.id] = available;
          } catch (error) {
            console.error(`Error checking availability for insumo ${insumo.id}:`, error);
            initialAvailability[insumo.id] = false;
          }
        }
      });

      // Esperar todas las verificaciones
      await Promise.all([...manufacturadosChecks, ...insumosChecks]); // Ordenar productos por disponibilidad dentro de cada categoría
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
        // 🔄 Inicializar items combinados (solo productos al inicio)
        allItemsIncludingPromociones: sortedProducts,
        filteredItemsIncludingPromociones: sortedProducts,
        isLoading: false,
      });

      // 🎁 Cargar promociones después de cargar productos
      await get().fetchPromociones();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      set({ error: 'Error al cargar productos y categorías', isLoading: false });
    }
  },

  // Establecer el término de búsqueda
  setSearchTerm: (term) => {
    set({ searchTerm: term });
  }, // Resetear filtros para mostrar todos los productos
  resetFilters: () => {
    const { allProducts, filteredPromociones } = get();
    const combinedItems = combineProductsAndPromociones(allProducts, filteredPromociones, false);

    set({
      filteredProducts: allProducts,
      searchTerm: '',
      activeCategory: null,
      showPromociones: false, // También resetear promociones
      // 🔄 Resetear items combinados a solo productos
      allItemsIncludingPromociones: combinedItems,
      filteredItemsIncludingPromociones: combinedItems,
    });
  }, // Nueva función para filtrar por categorías sin modificar el searchTerm
  handleCategoryFilter: (category) => {
    const { allProducts, allCategorias, filteredPromociones } = get();

    // 🎁 Caso especial: filtro por promociones
    if (category === 'promociones') {
      const combinedItems = combineProductsAndPromociones(allProducts, filteredPromociones, true);
      set({
        activeCategory: category,
        showPromociones: true,
        allItemsIncludingPromociones: combinedItems,
        filteredItemsIncludingPromociones: combinedItems,
      });
      return;
    }

    // Para cualquier otra categoría, desactivar promociones
    const combinedItems = combineProductsAndPromociones(allProducts, filteredPromociones, false);
    set({
      activeCategory: category,
      showPromociones: false, // Desactivar promociones cuando se selecciona una categoría
      allItemsIncludingPromociones: combinedItems,
    });

    // Si la categoría está vacía, mostrar todos los productos
    if (category === '' || (Array.isArray(category) && category.length === 0)) {
      set({
        filteredProducts: allProducts,
        filteredItemsIncludingPromociones: combinedItems,
      });
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

    set({
      filteredProducts: newFilteredList,
      filteredItemsIncludingPromociones: combineProductsAndPromociones(
        newFilteredList,
        filteredPromociones,
        false
      ),
    });
  },
  // Manejar la búsqueda (por texto)
  handleSearch: (query) => {
    const { allProducts, allCategorias, filteredPromociones } = get();

    // Actualizar el término de búsqueda visible y desactivar promociones
    const combinedItems = combineProductsAndPromociones(allProducts, filteredPromociones, false);
    set({
      searchTerm: query.toString(),
      activeCategory: null,
      showPromociones: false, // Desactivar promociones cuando se hace una búsqueda
      allItemsIncludingPromociones: combinedItems,
    }); // Si la query está vacía, mostrar todos los productos
    if (query === '' || (Array.isArray(query) && query.length === 0)) {
      set({
        filteredProducts: allProducts,
        filteredItemsIncludingPromociones: combinedItems,
      });
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
    set({
      filteredProducts: newFilteredList,
      filteredItemsIncludingPromociones: combineProductsAndPromociones(
        newFilteredList,
        filteredPromociones,
        false
      ),
    });
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
