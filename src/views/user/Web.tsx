import { useContext, useEffect, useState } from 'react';
import { Header } from '../../components/header/Header';
import { ListaCategorias } from '../../components/categorias/ListaCategorias';
import { ListaProductos } from '../../components/producto/ListaProducto';
import { ModalProducto } from '../../components/producto/ModalProducto';
import { ActiveSlider } from '../../components/carrusel/ActiveSlider';
import { Categoria, type ProductoValor } from '../../utils/types';
import BtnFlotanteCarrito from '../../components/carrito/BtnFlotanteCarrito';
import { CarritoContext } from '../../components/carrito/CarritoProvider';
import { getAllCategorias } from '../../utils/services/axios/categoriaService';
import { useSearch } from '../../hooks/useSearch';

export const Web = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productoModal, setProductoModal] = useState<ProductoValor | null>(
    null
  );
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const categoriasData = await getAllCategorias();
      setCategorias(categoriasData);
    }
    fetchData();
  }, []);

  const { searchTerm, handleSearch, filteredProducts } = useSearch(''); // Estado para el término de búsqueda

  useEffect(() => {
    if (productoModal) {
      setModalOpen(true); // Abrir el modal cuando se cambia el producto
    }
  }, [productoModal]);

  const handleCloseModal = () => {
    setModalOpen(false); // Cerrar el modal
  };

  const handleProductClick = (producto: ProductoValor) => {
    setProductoModal(producto); // Actualizar el producto modal y abrir el modal
  };

  const carritoContext = useContext(CarritoContext);
  if (!carritoContext) {
    throw new Error('Header must be used within a CarritoProvider');
  }
  const { carrito } = carritoContext;
  // Calculate total items in the cart
  const totalItems = carrito.reduce(
    (total, product) => total + product.quantity,
    0
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full">
      <Header onSearch={handleSearch} />
      <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col min-h-screen w-full">
        <ListaCategorias
          categorias={categorias}
          onSearch={handleSearch}
        />
        {searchTerm && filteredProducts.length === 0 ? (
          <p className="text-center text-xl">
            No se encontraron productos para "{searchTerm}"
          </p>
        ) : (
          <>
            {searchTerm ? null : (
              <ActiveSlider setProductoModal={setProductoModal} />
            )}
            <ListaProductos
              productos={filteredProducts}
              setProductoModal={setProductoModal}
              onProductClick={handleProductClick}
            />
          </>
        )}
        <ModalProducto
          product={productoModal ?? null}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
        {totalItems > 0 ? (
          <BtnFlotanteCarrito productCount={totalItems} />
        ) : null}
      </div>
    </div>
  );
};
