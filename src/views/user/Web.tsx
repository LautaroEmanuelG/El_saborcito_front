import { useState } from 'react';
import { Header } from '../../components/header/Header';
import { ListaCategorias } from '../../components/categorias/ListaCategorias';
import { ListaProductos } from '../../components/producto/ListaProducto';
import { ModalProducto } from '../../components/producto/ModalProducto';
import ActiveSlider from '../../components/carrusel/ActiveSlider';  // Importa el carrusel

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

  const handleCloseModal = () => {
    setModalOpen(false); // Cerrar el modal
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full">
      <Header totalItems={0} />
      <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col min-h-screen w-full">
        <ActiveSlider />
        <ListaCategorias />
        <ListaProductos />
        <ModalProducto
          dishes={exampleDish} // Pasar datos de ejemplo
          isOpen={isModalOpen} // Mostrar el modal
          onClose={handleCloseModal} // Función para cerrar el modal
        />
      </div>
    </div>
  );
};
