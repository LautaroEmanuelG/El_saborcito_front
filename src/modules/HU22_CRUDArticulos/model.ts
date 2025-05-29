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
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'denominacion', headerName: 'Denominación', width: 200 },
  { field: 'precioVenta', headerName: 'Precio Venta', width: 120 },
  { field: 'categoria', headerName: 'Categoría', width: 150 },
  { field: 'unidadMedida', headerName: 'Unidad de Medida', width: 150 },
  // Agrega aquí las columnas adicionales necesarias
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
