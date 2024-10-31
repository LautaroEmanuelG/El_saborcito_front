import React, { useEffect, useState } from 'react';
import { createTicket, getAllTickets } from '../../utils/services/axios/ticketService';
import { getAllProductos } from '../../utils/services/axios/productoService';

interface Producto {
  productoId: number;
  cantidad: number;
}

interface Ticket {
  productos: Producto[];
}

export const Historial: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [newTicket, setNewTicket] = useState<Ticket>({ productos: [] });
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    costo: 0,
    categoria: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const ticketsData = await getAllTickets();
    const productosData = await getAllProductos();
    setTickets(ticketsData);
    setProductos(productosData);
  };

  const handleCreateTicket = async () => {
    try {
      const ticketToCreate = newTicket.productos.map(p => ({
        productoId: p.productoId,
        cantidad: p.cantidad,
      }));

      await createTicket(ticketToCreate);
      fetchInitialData();
      setNewTicket({ productos: [] });
    } catch (error) {
      console.error('Error al crear ticket:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStockAlerts = () => {
    return productos.filter(producto => producto.stock < 10);
  };

  const openUpdateModal = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId);
    if (producto) {
      setProductForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.stock,
        costo: producto.costo,
        categoria: producto.categoria || '',
      });
      setIsUpdateModalOpen(true);
    }
  };

  const handleSaveProduct = () => {
    // Lógica para guardar los cambios del producto
    setIsUpdateModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Gestión Administrador</h1>

      {/* Mostrar alertas de stock */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Alertas de Stock</h2>
        {getStockAlerts().length > 0 ? (
          getStockAlerts().map(producto => (
            <div key={producto.id} className="p-2 border my-2 bg-red-100 flex justify-between items-center">
              <span>
                Producto: {producto.nombre} - Stock: {producto.stock}
              </span>
              <button
                onClick={() => openUpdateModal(producto.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded">
                Actualizar
              </button>
            </div>
          ))
        ) : (
          <div className="p-2 border my-2 bg-green-100">
            <span>No hay alertas de stock.</span>
          </div>
        )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets
            .slice()
            .reverse()
            .map(ticket => (
              <div key={ticket.id} className="p-4 border border-gray-300 rounded-lg shadow-md bg-white">
                <h3 className="text-xl font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2 text-blue-500">🎫</span>
                  Ticket ID: {ticket.id}
                </h3>
                <div className="text-lg text-gray-600">
                  <span className="font-medium">Total:</span> {formatCurrency(ticket.total)}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Fecha de Creación: {new Date(ticket.fechaCreacion).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal de Actualizar Producto */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Actualizar Producto</h2>
            <form>
              <label className="block mb-1">Nombre</label>
              <input
                type="text"
                className="w-full mb-2 p-2 border"
                value={productForm.nombre}
                onChange={e => setProductForm({ ...productForm, nombre: e.target.value })}
              />
              <label className="block mb-1">Descripción</label>
              <input
                type="text"
                className="w-full mb-2 p-2 border"
                value={productForm.descripcion}
                onChange={e => setProductForm({ ...productForm, descripcion: e.target.value })}
              />
              <label className="block mb-1">Precio</label>
              <input
                type="number"
                className="w-full mb-2 p-2 border"
                value={productForm.precio || ''}
                onChange={e => setProductForm({ ...productForm, precio: parseFloat(e.target.value) })}
              />
              <label className="block mb-1">Stock</label>
              <input
                type="number"
                className="w-full mb-2 p-2 border"
                value={productForm.stock || ''}
                onChange={e => setProductForm({ ...productForm, stock: parseInt(e.target.value, 10) })}
              />
              <label className="block mb-1">Costo</label>
              <input
                type="number"
                className="w-full mb-2 p-2 border"
                value={productForm.costo || ''}
                onChange={e => setProductForm({ ...productForm, costo: parseFloat(e.target.value) })}
              />
              <label className="block mb-1">Categoría</label>
              <select
                className="w-full mb-2 p-2 border"
                value={productForm.categoria}
                onChange={e => setProductForm({ ...productForm, categoria: e.target.value })}>
                <option value="">Seleccione una categoría</option>
                {/* Aquí van las opciones de categorías */}
              </select>
              {formError && <p className="text-red-500">{formError}</p>}
            </form>
            <div className="flex justify-end">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="mr-2 bg-gray-300 px-4 py-2 rounded">
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                className="bg-green-500 text-white px-4 py-2 rounded">
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
