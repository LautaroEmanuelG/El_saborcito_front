// views/TicketManager.tsx
import React, { useEffect, useState } from 'react';
import { createTicket, getAllTickets } from '../../utils/services/axios/ticketService';
import { getAllProductos, saveProduct } from '../../utils/services/axios/productoService';
import { getAllCategorias, saveCategoria } from '../../utils/services/axios/categoriaService';

interface Producto {
  productoId: number;
  cantidad: number;
}

interface Ticket {
  productos: Producto[];
}

const TicketManager: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [newTicket, setNewTicket] = useState<Ticket>({ productos: [] });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Función para obtener datos iniciales de tickets, productos y categorías
  const fetchInitialData = async () => {
    const ticketsData = await getAllTickets();
    const productosData = await getAllProductos();
    const categoriasData = await getAllCategorias();
    
    console.log('Tickets:', ticketsData);
    console.log('Productos:', productosData);
    console.log('Categorías:', categoriasData);
    
    setTickets(ticketsData);
    setProductos(productosData);
    setCategorias(categoriasData);
  };

  // Función para crear un nuevo ticket
  const handleCreateTicket = async () => {
    await createTicket(newTicket.productos);
    fetchInitialData(); // Refresca los datos después de la creación
  };

  // Función para agregar un producto al ticket
  const handleAddProductoToTicket = (productoId: number, cantidad: number) => {
    setNewTicket((prevTicket) => ({
      ...prevTicket,
      productos: [...prevTicket.productos, { productoId, cantidad }],
    }));
  };

  // Función para crear un nuevo producto
  const handleCreateProduct = async () => {
    const newProduct = {
      nombre: 'Nuevo Producto',
      descripcion: 'Descripción del producto',
      stock: 10,
      categoria: { id: categorias[0]?.id || 1 }, // Asigna la primera categoría disponible
      valor: { precio: 100, costo: 50 },
    };
    await saveProduct(newProduct);
    fetchInitialData(); // Refresca los datos después de la creación
  };

  // Función para crear una nueva categoría
  const handleCreateCategoria = async () => {
    const newCategoria = { nombre: 'Nueva Categoría', descripcion: 'Descripción de la categoría' };
    await saveCategoria(newCategoria);
    fetchInitialData(); // Refresca los datos después de la creación
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Gestión de Tickets</h1>

      {/* Botones para crear productos y categorías */}
      <div className="mb-4">
        <button onClick={handleCreateProduct} className="mr-4 bg-blue-500 text-white px-4 py-2 rounded">
          Crear Producto
        </button>
        <button onClick={handleCreateCategoria} className="bg-green-500 text-white px-4 py-2 rounded">
          Crear Categoría
        </button>
      </div>

      {/* Mostrar productos y permitir agregarlos al ticket */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Productos</h2>
        {productos.map((producto) => (
          <div key={producto.id} className="flex justify-between items-center my-2 p-2 border">
            <span>{producto.nombre}</span>
            <button onClick={() => handleAddProductoToTicket(producto.id, 1)} className="bg-gray-800 text-white px-4 py-2 rounded">
              Agregar al ticket
            </button>
          </div>
        ))}
      </div>

      {/* Botón para crear ticket */}
      <div className="mb-4">
        <button onClick={handleCreateTicket} className="bg-red-500 text-white px-4 py-2 rounded">
          Crear Ticket
        </button>
      </div>

      {/* Mostrar tickets */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Tickets</h2>
        {tickets.map((ticket) => (
          <div key={ticket.id} className="p-2 border my-2">
            <span>Ticket ID: {ticket.id} - Total: {ticket.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketManager;
