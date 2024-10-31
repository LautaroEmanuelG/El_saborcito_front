import { useContext, useEffect, useState } from 'react';
import { Header } from '../../components/header/Header';
import { ListaCategorias } from '../../components/categorias/ListaCategorias';
import { ListaProductos } from '../../components/producto/ListaProducto';
import { ModalProducto } from '../../components/producto/ModalProducto';
import { ActiveSlider } from '../../components/carrusel/ActiveSlider';
import {
  Categoria,
  type Producto,
  type ProductoValor,
} from '../../utils/types';
import BtnFlotanteCarrito from '../../components/carrito/BtnFlotanteCarrito';
import { CarritoContext } from '../../components/carrito/CarritoProvider';
import { getAllProductos } from '../../utils/services/axios/productoService';
import { getAllCategorias } from '../../utils/services/axios/categoriaService';

export const Web = () => {
  const [productos, setProductos] = useState<ProductoValor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productoModal, setProductoModal] = useState<ProductoValor | null>(
    null
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [filteredProducts, setFilteredProducts] = useState<ProductoValor[]>([]);

  useEffect(() => {
    async function fetchData() {
      const productosData = await getAllProductos();
      const categoriasData = await getAllCategorias();
      setProductos(productosData);
      setCategorias(categoriasData);
      setFilteredProducts(productosData as ProductoValor[]); // Inicialmente, mostrar todos los productos
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

  const handleSearch = (query: string) => {
    setSearchTerm(query); // Actualizar el término de búsqueda
    if (query === '') {
      setFilteredProducts(productos); // Mostrar todos los productos si el término de búsqueda está vacío
    } else {
      setFilteredProducts(
        productos.filter(producto =>
          producto.nombre.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
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
        <ListaCategorias categorias={categorias} />
        {searchTerm && filteredProducts.length === 0 ? (
          <p className="text-center text-xl">
            No se encontraron productos para "{searchTerm}"
          </p>
        ) : (
          <>
            <ActiveSlider
              products={productos}
              setProductoModal={setProductoModal}
            />
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
