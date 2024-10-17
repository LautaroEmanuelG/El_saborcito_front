import React, { useEffect, useState } from 'react';
import {
  createTicket,
  getAllTickets,
} from '../../utils/services/axios/ticketService';
import {
  getAllProductos,
  saveProduct,
} from '../../utils/services/axios/productoService';
import {
  getAllCategorias,
  saveCategoria,
} from '../../utils/services/axios/categoriaService';
import { Link } from 'react-router-dom';

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

  // Estados para controlar la visibilidad de los modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Estados para almacenar los datos del formulario
  const [productForm, setProductForm] = useState({
    nombre: '',
    descripcion: '',
    stock: 0,
    precio: 0,
    costo: 0,
    categoriaId: 1,
  });

  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const ticketsData = await getAllTickets();
    const productosData = await getAllProductos();
    const categoriasData = await getAllCategorias();

    setTickets(ticketsData);
    setProductos(productosData);
    setCategorias(categoriasData);
  };

  const handleCreateTicket = async () => {
    try {
      // Asegurarse de que el formato de los productos sea correcto
      const ticketToCreate = newTicket.productos.map(p => ({
        productoId: p.productoId,
        cantidad: p.cantidad,
      }));

      await createTicket(ticketToCreate);
      fetchInitialData(); // Refresca los datos después de la creación

      // Limpiar el ticket después de crearlo
      setNewTicket({ productos: [] });
    } catch (error) {
      console.error('Error al crear ticket:', error);
    }
  };

  const handleCreateProduct = async () => {
    const newProduct = {
      nombre: productForm.nombre,
      descripcion: productForm.descripcion,
      stock: productForm.stock,
      categoria: { id: productForm.categoriaId },
      valor: { precio: productForm.precio, costo: productForm.costo },
    };
    await saveProduct(newProduct);
    setIsProductModalOpen(false); // Cierra el modal
    fetchInitialData(); // Refresca los datos después de la creación
  };

  const handleCreateCategoria = async () => {
    const newCategoria = {
      nombre: categoryForm.nombre,
      descripcion: categoryForm.descripcion,
    };
    await saveCategoria(newCategoria);
    setIsCategoryModalOpen(false); // Cierra el modal
    fetchInitialData(); // Refresca los datos después de la creación
  };

  // Función para restar un producto del ticket
  const handleRemoveProductoFromTicket = (productoId: number) => {
    setNewTicket(prevTicket => {
      const existingProduct = prevTicket.productos.find(
        p => p.productoId === productoId
      );
      if (existingProduct && existingProduct.cantidad > 1) {
        // Reducir la cantidad si es mayor que 1
        return {
          ...prevTicket,
          productos: prevTicket.productos.map(p =>
            p.productoId === productoId ? { ...p, cantidad: p.cantidad - 1 } : p
          ),
        };
      } else {
        // Eliminar el producto si la cantidad es 1
        return {
          ...prevTicket,
          productos: prevTicket.productos.filter(
            p => p.productoId !== productoId
          ),
        };
      }
    });
  };

  // Función para agregar un producto al ticket
  const handleAddProductoToTicket = (productoId: number) => {
    setNewTicket(prevTicket => {
      const existingProduct = prevTicket.productos.find(
        p => p.productoId === productoId
      );
      if (existingProduct) {
        // Incrementar la cantidad si el producto ya está en el ticket
        return {
          ...prevTicket,
          productos: prevTicket.productos.map(p =>
            p.productoId === productoId ? { ...p, cantidad: p.cantidad + 1 } : p
          ),
        };
      } else {
        // Agregar el producto si no está en el ticket
        return {
          ...prevTicket,
          productos: [...prevTicket.productos, { productoId, cantidad: 1 }],
        };
      }
    });
  };

  // Función para obtener la cantidad de un producto en el ticket
  const getProductQuantity = (productoId: number) => {
    const productInTicket = newTicket.productos.find(
      p => p.productoId === productoId
    );
    return productInTicket ? productInTicket.cantidad : 0;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Gestión Administrador</h1>

      {/* Volver Atras */}
<div className="fixed top-4 right-4 bg-primary/80 text-white px-4 py-2 rounded">
  <Link to="/">Atras</Link>
</div>

      {/* Botones para crear productos y categorías */}
      <div className="mb-4">
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="bg-primary/80 text-white px-4 py-2 rounded mr-4">
          Crear Categoría
        </button>
        <button
          onClick={() => setIsProductModalOpen(true)}
          className="mr-4 bg-primary/90 text-white px-4 py-2 rounded">
          Crear Producto
        </button>
      </div>

      {/* Mostrar productos y permitir agregarlos al ticket */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Productos</h2>
        {productos.map(producto => (
          <div
            key={producto.id}
            className={`flex justify-between items-center my-2 p-2 border ${
              getProductQuantity(producto.id) > 0 ? 'border-blue-500' : ''
            }`}>
            <span>{producto.nombre}</span>
            <div className="flex items-center">
              {/* Botón para restar producto */}
              {getProductQuantity(producto.id) > 0 && (
                <button
                  onClick={() => handleRemoveProductoFromTicket(producto.id)}
                  className="bg-gray-400 text-white px-2 py-1 rounded mx-1">
                  -
                </button>
              )}
              {/* Mostrar la cantidad agregada */}
              {getProductQuantity(producto.id) > 0 && (
                <span className="text-xl font-bold mx-2">
                  {getProductQuantity(producto.id)}
                </span>
              )}
              {/* Botón para agregar producto */}
              <button
                onClick={() => handleAddProductoToTicket(producto.id)}
                className="bg-primary text-white px-4 py-2 rounded">
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para crear ticket */}
      <div className="mb-4">
        <button
          onClick={handleCreateTicket}
          className="bg-primary text-white px-4 py-2 rounded">
          Crear Ticket
        </button>
      </div>

      {/* Mostrar tickets */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Tickets</h2>
        {tickets
          .slice()
          .reverse()
          .map(ticket => (
            <div
              key={ticket.id}
              className="p-2 border my-2">
              <span>
                Ticket ID: {ticket.id} - Total: {ticket.total}
              </span>
            </div>
          ))}
      </div>

      {/* Modal de Crear Producto */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Crear Producto</h2>
            <form>
              <input
                type="text"
                placeholder="Nombre"
                className="w-full mb-2 p-2 border"
                onChange={e =>
                  setProductForm({ ...productForm, nombre: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Descripción"
                className="w-full mb-2 p-2 border"
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    descripcion: e.target.value,
                  })
                }
              />
              <input
                type="number"
                placeholder="Stock"
                className="w-full mb-2 p-2 border"
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    stock: parseInt(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Precio"
                className="w-full mb-2 p-2 border"
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    precio: parseFloat(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Costo"
                className="w-full mb-2 p-2 border"
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    costo: parseFloat(e.target.value),
                  })
                }
              />
              <select
                className="w-full mb-2 p-2 border"
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    categoriaId: parseInt(e.target.value),
                  })
                }>
                {categorias.map(categoria => (
                  <option
                    key={categoria.id}
                    value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </form>
            <div className="flex justify-end">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="mr-2 bg-gray-300 px-4 py-2 rounded">
                Cancelar
              </button>
              <button
                onClick={handleCreateProduct}
                className="bg-blue-500 text-white px-4 py-2 rounded">
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear Categoría */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Crear Categoría</h2>
            <form>
              <input
                type="text"
                placeholder="Nombre"
                className="w-full mb-2 p-2 border"
                onChange={e =>
                  setCategoryForm({ ...categoryForm, nombre: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Descripción"
                className="w-full mb-2 p-2 border"
                onChange={e =>
                  setCategoryForm({
                    ...categoryForm,
                    descripcion: e.target.value,
                  })
                }
              />
            </form>
            <div className="flex justify-end">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="mr-2 bg-gray-300 px-4 py-2 rounded">
                Cancelar
              </button>
              <button
                onClick={handleCreateCategoria}
                className="bg-green-500 text-white px-4 py-2 rounded">
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManager;
