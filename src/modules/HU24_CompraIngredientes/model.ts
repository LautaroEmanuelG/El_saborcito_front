// Modelos y tipos específicos para la HU24
// Puedes importar y extender los modelos de HU23_CRUDInsumos/model.ts si es necesario

// Modelo de vista para Compras de Insumos
export interface CompraInsumoView {
  id: number;
  fecha: string;
  denominacion: string; // Concatenación de insumos o solo el principal
  total: number;
  insumos: {
    id: number;
    denominacion: string;
    cantidad: number;
    precioCosto: number;
    unidadMedida: string;
  }[];
}

export const COMPRA_INSUMO_COLUMNS = [
  { label: 'Denominación', key: 'denominacion' },
  { label: 'Fecha', key: 'fecha' },
  { label: 'Total', key: 'total', render: (row: CompraInsumoView) => `$${row.total}` },
  // La columna de acciones (view) se maneja en el componente si la tabla lo permite
];
