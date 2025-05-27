import { useContext, useEffect, useState } from 'react';
import { ListaCategorias } from '../../HU9_PaginaPrincipalClientes/components/categorias/ListaCategorias';
import { ListaProductos } from './articulos/ListaProducto';
import { ModalProducto } from './articulos/ModalProducto';
import { ActiveSlider } from './carrusel/ActiveSlider';
import BtnFlotanteCarrito from '../../HU11_CarritoCompras/components/BtnFlotanteCarrito';
import { CarritoContext } from '../../../shared/providers/CarritoProvider';
import { getAllCategorias } from '../../../shared/services/categoriaService';
import type { Categoria, ProductoValor } from '../../../types/types';

interface PaginaPrincipalClientesProps {
  searchTerm: string;
  handleSearch: (term: string) => void;
  filteredProducts: ProductoValor[];
}

export const PaginaPrincipalClientes = ({
  searchTerm,
  handleSearch,
  filteredProducts,
}: PaginaPrincipalClientesProps) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productoModal, setProductoModal] = useState<ProductoValor | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const categoriasData = await getAllCategorias();
      setCategorias(categoriasData);
    }
    fetchData();
  }, []);

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
  const totalItems = carrito.reduce((total, product) => total + product.quantity, 0);

  return (
    <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col min-h-screen w-full">
      <ListaCategorias categorias={categorias} onSearch={handleSearch} />
      {searchTerm && filteredProducts.length === 0 ? (
        <p className="text-center text-xl">No se encontraron productos para "{searchTerm}"</p>
      ) : (
        <>
          {searchTerm ? null : <ActiveSlider setProductoModal={setProductoModal} />}
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
      {totalItems > 0 ? <BtnFlotanteCarrito productCount={totalItems} /> : null}
    </div>
  );
};
