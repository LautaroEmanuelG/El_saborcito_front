import axiosInstance from './axiosConfig';  // Importar la instancia preconfigurada

const API_BASE_URL = '/productos';

// Función para obtener las rutas de las imágenes en base a la categoría y el nombre del producto
const addImagesToProduct = (productoNombre: string, productoCategoria: string) => {
  return [
    `/img/productos/${productoCategoria.toLowerCase()}/${productoNombre.replace(/\s+/g, "").toLowerCase()}.webp`,
    `/img/productos/${productoCategoria.toLowerCase()}/${productoNombre.replace(/\s+/g, "").toLowerCase()}.jpg`
  ];
};

// Método para obtener todos los productos y agregar las rutas de imágenes
export const getAllProductos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/all`);
  const productos = response.data;

  // Añadir las rutas de las imágenes a cada producto
  productos.forEach((producto: any) => {
    producto.imagen = addImagesToProduct(producto.nombre, producto.categoria.nombre);
  });

  return productos;
};

// Método para obtener productos por categoría y añadirles las imágenes
export const getProductosByCategoria = async (categoriaId: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/categoria`, { params: { id: categoriaId } });
  const productos = response.data;

  // Añadir las rutas de las imágenes a cada producto
  productos.forEach((producto: any) => {
    producto.imagen = addImagesToProduct(producto.nombre, producto.categoria.nombre);
  });

  return productos;
};

// Función para guardar un producto en la base de datos
export const saveProduct = async (productData: any) => {
  if (!productData.items) {
    productData.items = [];
  }
  const response = await axiosInstance.post(`${API_BASE_URL}/guardar`, productData);
  return response.data;
};

// Función para eliminar un producto por ID
export const deleteProduct = async (id: number) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/eliminar`, null, { params: { id } });
  return response.data;
};

// Función para obtener un producto por su ID
export const getProductById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/id`, { params: { id } });
  const producto = response.data;

  // Añadir las rutas de las imágenes al producto obtenido
  // producto.imagen = addImagesToProduct(producto.nombre, producto.categoria);

  return producto;
};