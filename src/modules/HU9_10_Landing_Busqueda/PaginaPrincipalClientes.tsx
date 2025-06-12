import { useContext, useEffect, useMemo, useState } from 'react';
import { ListaProductos } from './articulos/ListaProducto';
import { ModalProducto } from './articulos/ModalProducto';
import { ActiveSlider } from './carrusel/ActiveSlider';
import { ActiveCategoryIndicator } from './categorias/ActiveCategoryIndicator';
import { CarritoContext } from '../../shared/providers/CarritoProvider';
import { useProductStore, getArticuloCategoriaId } from '../../shared/providers/ProductProvider';
import type { ArticuloInsumo, ArticuloManufacturado } from '../../types/Articulo';
import { ListaCategorias } from './categorias/ListaCategorias';
import BtnFlotanteCarrito from '../HU11_12_Carrito_Confirmacion/BtnFlotanteCarrito';

interface PaginaPrincipalClientesProps {
  searchTerm: string;
  handleSearch: (term: string | string[]) => void; // Modificado para aceptar string o string[]
  handleCategoryFilter?: (category: string | string[]) => void; // Nueva prop para filtrar por categoría
  filteredProducts: (ArticuloManufacturado | ArticuloInsumo)[];
}

export const PaginaPrincipalClientes = ({
  searchTerm,
  handleSearch,
  handleCategoryFilter,
  filteredProducts,
}: PaginaPrincipalClientesProps) => {
  const { allCategorias } = useProductStore(); // Obtenemos categorías del store
  const [articuloModal, setArticuloModal] = useState<ArticuloManufacturado | ArticuloInsumo | null>(
    null
  );
  const [isModalOpen, setModalOpen] = useState(false);

  // Calcular las categorías que tienen productos
  const categoriasConProductos = useMemo(() => {
    const ids = new Set<number>();

    // Si hay un término de búsqueda activo que es una categoría, mostraremos todas las categorías
    // para que el usuario pueda cambiar fácilmente entre ellas
    if (searchTerm && allCategorias.some((cat) => cat.denominacion === searchTerm)) {
      // Si estamos filtrando por una categoría específica, incluir todas las categorías
      allCategorias.forEach((cat) => {
        if (cat.id !== undefined) {
          ids.add(cat.id);
        }
      });
      return ids;
    }

    // Caso 1: Añade IDs de categorías que tienen productos directamente
    filteredProducts.forEach((producto) => {
      const categoriaId = getArticuloCategoriaId(producto);
      if (categoriaId !== undefined) {
        ids.add(categoriaId);
      }
    });

    // Caso 2: También incluye las categorías padre de las categorías que tienen productos
    // Esto asegura que categorías como "Sandwiches" aparezcan incluso si solo sus hijas tienen productos
    const categoriasHijo = new Set<number>();
    const categoriasPadre = new Map<number, number>(); // Map de hijo->padre

    // Construimos un mapa de relaciones hijo->padre
    allCategorias.forEach((cat) => {
      if (cat.id !== undefined && cat.tipoCategoria && cat.tipoCategoria.id !== undefined) {
        categoriasHijo.add(cat.id);
        categoriasPadre.set(cat.id, cat.tipoCategoria.id);
      }
    });

    // Ahora añadimos todos los IDs de padres para cada categoría con productos
    ids.forEach((id) => {
      if (categoriasHijo.has(id) && categoriasPadre.has(id)) {
        ids.add(categoriasPadre.get(id)!);
      }
    });

    // Si no hay filtros aplicados o estamos en la vista inicial, mostrar todas las categorías
    if (
      filteredProducts.length === 0 ||
      filteredProducts.length === useProductStore.getState().allProducts.length
    ) {
      allCategorias.forEach((cat) => {
        if (cat.id !== undefined) {
          ids.add(cat.id);
        }
      });
    }

    return ids;
  }, [filteredProducts, searchTerm, allCategorias]);
  useEffect(() => {
    if (articuloModal) {
      setModalOpen(true); // Abrir el modal cuando se cambia el artículo
    }
  }, [articuloModal]);

  const handleCloseModal = () => {
    setModalOpen(false); // Cerrar el modal
    setArticuloModal(null); // Resetear el artículo modal para permitir abrir el mismo producto nuevamente
  };

  const handleProductClick = (articulo: ArticuloManufacturado | ArticuloInsumo | null) => {
    setArticuloModal(articulo); // Actualizar el producto modal y abrir el modal
  };

  const carritoContext = useContext(CarritoContext);
  if (!carritoContext) {
    throw new Error('Header must be used within a CarritoProvider');
  }
  const { carrito } = carritoContext;
  // Calculate total items in the cart
  const totalItems = carrito.reduce((total, articulo) => total + articulo.cantidad, 0);

  // Obtenemos la categoría activa para saber si mostrar o no el slider
  const { activeCategory } = useProductStore();
  const showSlider = !searchTerm && !activeCategory;
  const noResults = filteredProducts.length === 0;

  return (
    <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col min-h-screen w-full">
      {showSlider && <ActiveSlider setArticuloModal={setArticuloModal} />}
      <ListaCategorias
        categorias={allCategorias}
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        categoriasConProductosIds={categoriasConProductos}
      />
      <ActiveCategoryIndicator />
      {noResults ? (
        <p className="text-center text-xl mt-8">
          {searchTerm
            ? `No se encontraron productos para "${searchTerm}"`
            : activeCategory
              ? `No hay productos disponibles en esta categoría`
              : null}
        </p>
      ) : (
        <ListaProductos articulos={filteredProducts} onProductClick={handleProductClick} />
      )}
      <ModalProducto
        articulo={articuloModal ?? null}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      {totalItems > 0 ? <BtnFlotanteCarrito productCount={totalItems} /> : null}
    </div>
  );
};
