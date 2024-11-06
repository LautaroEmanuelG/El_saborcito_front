import { useState, useEffect } from 'react';
import {
  getAllProductos,
  saveProduct,
  deleteProduct,
  getProductById,
} from '../../utils/services/axios/productoService';
import { getAllCategorias } from '../../utils/services/axios/categoriaService';
import { Producto } from '../../utils/types';
import { ModalConfirm } from '../../components/utils/ModalConfirm';

export const Productos = () => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isModalDelete, setIsModalDelete] = useState(false);

  const [productForm, setProductForm] = useState<Producto>({
    nombre: '',
    descripcion: '',
    stock: 0,
    precio: 0,
    costo: 0,
    categoriaId: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const productosData = await getAllProductos();
    const categoriasData = await getAllCategorias();

    setCategorias(categoriasData);

    setProductos(productosData);
  };

  const handleSaveProduct = async () => {
    if (
      !productForm.nombre ||
      productForm.precio <= 0 ||
      productForm.stock <= 0 ||
      productForm.costo <= 0 ||
      productForm.categoriaId === 0
    ) {
      setFormError('Todos los campos son obligatorios y deben ser válidos.');
      return;
    }

    const productData = {
      ...productForm,
      categoria: { id: productForm.categoriaId },
      valor: { precio: productForm.precio, costo: productForm.costo },
    };
    await saveProduct(productData);
    setIsProductModalOpen(false); // Cierra el modal
    setIsUpdateModalOpen(false); // Cierra el modal de actualización
    fetchInitialData(); // Refresca los datos después de la creación/actualización
    setFormError(null); // Resetea el error del formulario
  };

  const handleDeleteProduct = async (id: number) => {
    await deleteProduct(id);
    fetchInitialData(); // Refresca los datos después de la eliminación
  };

  const openUpdateModal = async (id: number) => {
    const product = await getProductById(id);
    setProductForm({
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.valor.precio,
      stock: product.stock,
      costo: product.valor.costo,
      categoriaId: product.categoria.id,
    });
    setIsUpdateModalOpen(true);
  };

  const openCreateModal = () => {
    setProductForm({
      nombre: '',
      descripcion: '',
      stock: 0,
      precio: 0,
      costo: 0,
      categoriaId: 0,
    });
    setIsProductModalOpen(true);
  };

  const toggleModalDelete = () => {
    setIsModalDelete(!isModalDelete);
  };

  return (
    <div className="p-4 w-full">
      <h2 className="text-3xl font-bold mb-4">Gestor de Productos</h2>
      <button
        onClick={openCreateModal}
        className="mr-4 bg-primary/90 text-white px-4 py-2 rounded">
        Crear Producto
      </button>
      {/* Mostrar productos y permitir agregarlos al ticket */}
      <div className="flex flex-col w-full mb-4">
        {productos.map(producto => (
          <>
            <div
              key={producto.id}
              className="p-2 border my-2 flex justify-between items-center">
              <span>{producto.nombre}</span>
              <div className="flex">
                <button
                  onClick={() => openUpdateModal(producto.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                  Actualizar
                </button>
                <button
                  onClick={toggleModalDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded">
                  Eliminar
                </button>
              </div>
            </div>
            {/* Modal de Confirmación Eliminar*/}
            <ModalConfirm
              isOpen={isModalDelete}
              setIsOpen={setIsModalDelete}
              onConfirm={() => handleDeleteProduct(producto.id)}
              title={`Desea eliminar ${producto.nombre}`}
              message="¿Estás seguro que deseas eliminar?"
              confirmText="Eliminar"
            />
          </>
        ))}
      </div>

      {/* Modal de Crear Producto */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Crear Producto</h2>
            <form>
              <label className="block text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Ingrese el nombre del producto"
                className="w-full mb-4 p-2 border"
                value={productForm.nombre}
                onChange={e =>
                  setProductForm({ ...productForm, nombre: e.target.value })
                }
              />

              <label className="block text-gray-700 mb-1">Descripción</label>
              <input
                type="text"
                placeholder="Ingrese la descripción del producto"
                className="w-full mb-4 p-2 border"
                value={productForm.descripcion}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    descripcion: e.target.value,
                  })
                }
              />

              <label className="block text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                placeholder="Ingrese el precio"
                className="w-full mb-4 p-2 border"
                value={productForm.precio === 0 ? '' : productForm.precio}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    precio: parseFloat(e.target.value),
                  })
                }
              />

              <label className="block text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                placeholder="Ingrese el stock"
                className="w-full mb-4 p-2 border"
                value={productForm.stock === 0 ? '' : productForm.stock}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    stock: parseInt(e.target.value, 10),
                  })
                }
              />

              <label className="block text-gray-700 mb-1">Costo</label>
              <input
                type="number"
                placeholder="Ingrese el costo"
                className="w-full mb-4 p-2 border"
                value={productForm.costo === 0 ? '' : productForm.costo}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    costo: parseFloat(e.target.value),
                  })
                }
              />

              <label className="block text-gray-700 mb-1">Categoría</label>
              <select
                className="w-full mb-4 p-2 border"
                value={productForm.categoriaId}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    categoriaId: parseInt(e.target.value),
                  })
                }>
                <option value="">Seleccione una categoría</option>
                {categorias.map(categoria => (
                  <option
                    key={categoria.id}
                    value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {formError && <p className="text-red-500">{formError}</p>}
            </form>
            <div className="flex justify-end">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="mr-2 bg-gray-300 px-4 py-2 rounded">
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                className="bg-blue-500 text-white px-4 py-2 rounded">
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

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
                onChange={e =>
                  setProductForm({ ...productForm, nombre: e.target.value })
                }
              />
              <label className="block mb-1">Descripción</label>
              <input
                type="text"
                className="w-full mb-2 p-2 border"
                value={productForm.descripcion}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    descripcion: e.target.value,
                  })
                }
              />
              <label className="block mb-1">Precio</label>
              <input
                type="number"
                className="w-full mb-2 p-2 border"
                value={productForm.precio === 0 ? '' : productForm.precio}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    precio: parseFloat(e.target.value),
                  })
                }
              />
              <label className="block mb-1">Stock</label>
              <input
                type="number"
                className="w-full mb-2 p-2 border"
                value={productForm.stock === 0 ? '' : productForm.stock}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    stock: parseInt(e.target.value, 10),
                  })
                }
              />
              <label className="block mb-1">Costo</label>
              <input
                type="number"
                className="w-full mb-2 p-2 border"
                value={productForm.costo === 0 ? '' : productForm.costo}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    costo: parseFloat(e.target.value),
                  })
                }
              />
              <label className="block mb-1">Categoría</label>
              <select
                className="w-full mb-2 p-2 border"
                value={productForm.categoriaId}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    categoriaId: parseInt(e.target.value),
                  })
                }>
                <option value="">Seleccione una categoría</option>
                {categorias.map(categoria => (
                  <option
                    key={categoria.id}
                    value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
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
