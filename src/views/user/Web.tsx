import { useEffect, useState } from 'react';
import { Header } from '../../components/header/Header';
import { ListaCategorias } from '../../components/categorias/ListaCategorias';
import { ListaProductos } from '../../components/producto/ListaProducto';
import { ModalProducto } from '../../components/producto/ModalProducto';
import { ActiveSlider } from '../../components/carrusel/ActiveSlider';
import listaProductos from '../../data/ListaProductos.json';
import type { Producto } from '../../utils/types';

//Oferta de un producto al azar
const productRandom =
  listaProductos[Math.floor(Math.random() * listaProductos.length)];

export const Web = () => {
  const [productoModal, setProductoModal] = useState<Producto | null>(productRandom);
  const [isModalOpen, setModalOpen] = useState(true); // Modal siempre abierto para prueba
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda

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
  };

  const filteredProducts = listaProductos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (producto: Producto) => {
    setProductoModal(producto); // Actualizar el producto modal y abrir el modal
  };
  // const [products] = useState(productsData);
  // const { filterProducts } = useFilters();

  // const filteredProducts = filterProducts(products);
  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full">
        <Header onSearch={handleSearch} />
        <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col min-h-screen w-full">
          <ListaCategorias />
          {searchTerm && filteredProducts.length === 0 ? (
            <p className="text-center text-xl">
              No se encontraron productos para "{searchTerm}"
            </p>
          ) : (
            <>
              <ActiveSlider setProductoModal={setProductoModal} />
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
        </div>
      </div>
  );
};
