import { useContext, useEffect, useState } from 'react';
import { ListaCategorias } from '../../HU9_PaginaPrincipalClientes/components/categorias/ListaCategorias';
import { ListaProductos } from './articulos/ListaProducto';
import { ModalProducto } from './articulos/ModalProducto';
import { ActiveSlider } from './carrusel/ActiveSlider';
import BtnFlotanteCarrito from '../../HU11_CarritoCompras/components/BtnFlotanteCarrito';
import { CarritoContext } from '../../../shared/providers/CarritoProvider';
import { getAllCategorias } from '../../../shared/services/categoriaService';
import type { ArticuloInsumo, ArticuloManufacturado } from '../../../types/Articulo';
import type { Categoria } from '../../../types/Categoria';

interface PaginaPrincipalClientesProps {
  searchTerm: string;
  handleSearch: (term: string | string[]) => void; // Modificado para aceptar string o string[]
  filteredProducts: (ArticuloManufacturado | ArticuloInsumo)[];
}

export const PaginaPrincipalClientes = ({
  searchTerm,
  handleSearch,
  filteredProducts,
}: PaginaPrincipalClientesProps) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [articuloModal, setArticuloModal] = useState<ArticuloManufacturado | ArticuloInsumo | null>(
    null
  );
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const categoriasData = await getAllCategorias();
      console.log('categoriasData :>> ', categoriasData);
      setCategorias(categoriasData);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (articuloModal) {
      setModalOpen(true); // Abrir el modal cuando se cambia el artículo
    }
  }, [articuloModal]);

  const handleCloseModal = () => {
    setModalOpen(false); // Cerrar el modal
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

  return (
    <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col min-h-screen w-full">
      {searchTerm ? null : <ActiveSlider setArticuloModal={setArticuloModal} />}
      <ListaCategorias categorias={categorias} onSearch={handleSearch} />
      {searchTerm && filteredProducts.length === 0 ? (
        <p className="text-center text-xl">No se encontraron productos para "{searchTerm}"</p>
      ) : (
        <>
          <ListaProductos articulos={filteredProducts} onProductClick={handleProductClick} />
        </>
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
