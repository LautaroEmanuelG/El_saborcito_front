// Modelo de vista para Insumos (ScreenInsumos)
// Configuración de campos y columnas para la tabla genérica de insumos

export interface InsumoView {
  id: number;
  denominacion: string;
  precioCompra: number;
  stockActual: number;
  stockMaximo: number;
  categoria: string;
  unidadMedida: string;
  esParaElaborar: boolean;
  // Agrega aquí los campos adicionales necesarios
}

export const INSUMO_COLUMNS = [
  { field: 'id', headerName: 'ID', width: 30 },
  { field: 'denominacion', headerName: 'Denominación', width: 120 },
  { field: 'precioCompra', headerName: 'Precio Compra', width: 120 },
  { field: 'stockActual', headerName: 'Stock Actual', width: 100 },
  { field: 'stockMaximo', headerName: 'Stock Máximo', width: 100 },
  { field: 'categoria', headerName: 'Categoría', width: 100 },
  { field: 'unidadMedida', headerName: 'Unidad de Medida', width: 100 },
  { field: 'esParaElaborar', headerName: '¿Para Elaborar?', width: 80 },
];

export const INSUMO_FIELDS = [
  {
    name: 'denominacion',
    label: 'Denominación',
    type: 'text',
    required: true,
  },
  {
    name: 'precioCompra',
    label: 'Precio Compra',
    type: 'number',
    required: true,
  },
  {
    name: 'stockActual',
    label: 'Stock Actual',
    type: 'number',
    required: true,
  },
  {
    name: 'stockMaximo',
    label: 'Stock Máximo',
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
  {
    name: 'esParaElaborar',
    label: '¿Es para elaborar?',
    type: 'checkbox',
    required: false,
  },
  // Agrega aquí los campos adicionales necesarios
];

// Aquí luego se integrará el store de Zustand y los servicios
