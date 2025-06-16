// Copia de model.ts para Promociones
// ...código original de model.ts de HU22_CRUDArticulos...

// Modelo de vista para Promociones (screenPromociones)
// Configuración de columnas y campos para la tabla y el modal genérico

export interface PromocionView {
  id: number;
  denominacion: string;
  precioPromocional: number | null;
  descuento: number | null;
  fechaDesde: string;
  fechaHasta: string;
  horaDesde: string | null;
  horaHasta: string | null;
}

export const PROMOCION_COLUMNS = [
  { field: 'id', headerName: 'ID', width: 30 },
  { field: 'denominacion', headerName: 'Denominación', width: 120 },
  { field: 'precioPromocional', headerName: 'Precio Promocional', width: 120 },
  { field: 'descuento', headerName: 'Descuento (%)', width: 120 },
  { field: 'fechaDesde', headerName: 'Fecha Desde', width: 120 },
  { field: 'fechaHasta', headerName: 'Fecha Hasta', width: 120 },
  { field: 'horaDesde', headerName: 'Hora Desde', width: 120 },
  { field: 'horaHasta', headerName: 'Hora Hasta', width: 120 },
];

export const PROMOCION_FIELDS = [
  {
    name: 'denominacion',
    label: 'Denominación',
    type: 'text',
    required: true,
  },
  {
    name: 'precioPromocional',
    label: 'Precio Promocional',
    type: 'number',
    required: false,
  },
  {
    name: 'descuento',
    label: 'Descuento (%)',
    type: 'number',
    required: false,
  },
  {
    name: 'fechaDesde',
    label: 'Fecha Desde',
    type: 'date',
    required: true,
  },
  {
    name: 'fechaHasta',
    label: 'Fecha Hasta',
    type: 'date',
    required: true,
  },
  {
    name: 'horaDesde',
    label: 'Hora Desde',
    type: 'time',
    required: false,
  },
  {
    name: 'horaHasta',
    label: 'Hora Hasta',
    type: 'time',
    required: false,
  },
];
