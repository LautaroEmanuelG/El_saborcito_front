import { useState } from 'react';
import { Header } from '../../components/header/Header';
import { ListaCategorias } from '../../components/categorias/ListaCategorias';
import { ListaProductos } from '../../components/producto/ListaProducto';
import { ModalProducto } from '../../components/producto/ModalProducto';
import { ActiveSlider } from '../../components/carrusel/ActiveSlider';
import listaProductos from '../../data/ListaProductos.json';

// Datos de ejemplo para el modal
const exampleDish = {
  id: 1,
  image: 'https://via.placeholder.com/150', // URL de imagen de ejemplo
  title: 'Plato de Ejemplo',
  price: 10.99,
  description: 'Descripción del plato de ejemplo.',
};

export const Web = () => {
  const [isModalOpen, setModalOpen] = useState(true); // Modal siempre abierto para prueba
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda

  const handleCloseModal = () => {
    setModalOpen(false); // Cerrar el modal
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query); // Actualizar el término de búsqueda
  };

  const filteredProducts = listaProductos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full">
      <Header totalItems={0} onSearch={handleSearch} /> {/* Pasar la función de búsqueda al Header */}
      <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col min-h-screen w-full">
        <ActiveSlider />
        <ListaCategorias />
        {searchTerm && filteredProducts.length === 0 ? ( // No mostrar productos si no hay coincidencias
          <p className="text-center text-xl">No se encontraron productos para "{searchTerm}"</p>
        ) : (
          <ListaProductos productos={filteredProducts} /> // Pasar los productos filtrados
        )}
        <ModalProducto
          dishes={exampleDish} // Pasar datos de ejemplo
          isOpen={isModalOpen} // Mostrar el modal
          onClose={handleCloseModal} // Función para cerrar el modal
        />
      </div>
    </div>
  );
};
