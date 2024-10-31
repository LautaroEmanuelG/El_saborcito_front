import { useState, useEffect } from 'react';
import {
  getAllCategorias,
  saveCategoria,
  deleteCategoria,
} from '../../utils/services/axios/categoriaService';
import { Categoria, Producto } from '../../utils/types';
import {
  getProductosByCategoria,
  deleteProduct,
} from '../../utils/services/axios/productoService';

export const Categorias = () => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoryForm, setCategoryForm] = useState<{
    id: number | null;
    nombre: string;
    descripcion: string;
  }>({
    id: null,
    nombre: '',
    descripcion: '',
  });
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(
    null
  );
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const categoriasData = await getAllCategorias();
    setCategorias(categoriasData);
  };

  const handleSaveCategoria = async () => {
    await saveCategoria(categoryForm);
    setIsCategoryModalOpen(false); // Cierra el modal
    setIsUpdateModalOpen(false); // Cierra el modal de actualización
    fetchInitialData(); // Refresca los datos después de la creación/actualización
  };

  const handleDeleteCategoria = async (id: number) => {
    const productosData = await getProductosByCategoria(id);
    setProductos(productosData);
    setSelectedCategoria(
      categorias.find(categoria => categoria.id === id) || null
    );
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCategoria = async () => {
    if (selectedCategoria) {
      for (const producto of productos) {
        if (producto.id !== undefined) {
          await deleteProduct(producto.id);
        }
      }
      await deleteCategoria(selectedCategoria.id ?? 0);
      setIsDeleteModalOpen(false);
      fetchInitialData(); // Refresca los datos después de la eliminación
    }
  };

  const openUpdateModal = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setCategoryForm({
      id: categoria.id ?? null,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
    });
    setIsUpdateModalOpen(true);
  };

  const openCreateModal = () => {
    setCategoryForm({
      id: null,
      nombre: '',
      descripcion: '',
    });
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="p-4 w-full">
      <h2 className="text-3xl font-bold mb-4">Gestor de Categorias</h2>

      <button
        onClick={openCreateModal}
        className="mr-4 bg-primary/90 text-white px-4 py-2 rounded">
        Crear Categoría
      </button>

      <article className="w-full mb-4">
        {categorias.map(categoria => (
          <div
            key={categoria.id}
            className="p-2 border my-2 flex justify-between items-center">
            <span>{categoria.nombre}</span>
            <div>
              <button
                onClick={() => openUpdateModal(categoria)}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                Actualizar
              </button>
              <button
                onClick={() => handleDeleteCategoria(categoria.id ?? 0)}
                className="bg-red-500 text-white px-4 py-2 rounded">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </article>

      {/* Modal de Crear/Actualizar Categoría */}
      {(isCategoryModalOpen || isUpdateModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">
              {isCategoryModalOpen ? 'Crear Categoría' : 'Actualizar Categoría'}
            </h2>
            <form>
              <input
                type="text"
                placeholder="Nombre"
                className="w-full mb-2 p-2 border"
                value={categoryForm.nombre}
                onChange={e =>
                  setCategoryForm({ ...categoryForm, nombre: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Descripción"
                className="w-full mb-2 p-2 border"
                value={categoryForm.descripcion}
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
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setIsUpdateModalOpen(false);
                }}
                className="mr-2 bg-gray-300 px-4 py-2 rounded">
                Cancelar
              </button>
              <button
                onClick={handleSaveCategoria}
                className="bg-green-500 text-white px-4 py-2 rounded">
                {isCategoryModalOpen ? 'Crear' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Eliminar Categoría</h2>
            <p>¿Desea eliminar esta categoría y todos sus productos?</p>
            <ul className="list-disc pl-4">
              {productos.map(producto => (
                <li key={producto.id}>{producto.nombre}</li>
              ))}
            </ul>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="mr-2 bg-gray-300 px-4 py-2 rounded">
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCategoria}
                className="bg-red-500 text-white px-4 py-2 rounded">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
