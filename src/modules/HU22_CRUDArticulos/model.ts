// Modelo de vista para Artículos (screenArticulos)
// Aquí se define la configuración de campos y columnas para la tabla genérica

export interface ArticuloView {
  id: number;
  denominacion: string;
  precioVenta: number;
  categoria: string;
  unidadMedida: string;
  // Agrega aquí los campos adicionales necesarios
}

export const ARTICULO_COLUMNS = [
  { field: 'id', headerName: 'ID', width: 30 },
  { field: 'denominacion', headerName: 'Denominación', width: 120 },
  { field: 'precioVenta', headerName: 'Precio Venta', width: 120 },
  // { field: 'descripcion', headerName: 'Descripción', width: 120 },
  { field: 'tiempoEstimadoMinutos', headerName: 'Tiempo (min)', width: 120 },
  { field: 'categoria', headerName: 'Categoría', width: 80 },
  { field: 'subcategoria', headerName: 'Subcategoría', width: 80 },
];

// Configuración de validaciones y campos editables
export const ARTICULO_FIELDS = [
  {
    name: 'denominacion',
    label: 'Denominación',
    type: 'text',
    required: true,
  },
  {
    name: 'precioVenta',
    label: 'Precio Venta',
    type: 'number',
    required: true,
  },
  {
    name: 'categoria',
    label: 'Categoría',
    type: 'select',
    required: true,
    options: [], // Se llenará dinámicamente
  },
  {
    name: 'unidadMedida',
    label: 'Unidad de Medida',
    type: 'select',
    required: true,
    options: [], // Se llenará dinámicamente
  },
  // Agrega aquí los campos adicionales necesarios
];

// Aquí luego se integrará el store de Zustand y los servicios
