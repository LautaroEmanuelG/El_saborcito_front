// HU24_CompraIngredientes/model.ts

import { formatearMonto } from './logic';

/** Columnas para TableGeneric en ScreenCompraIngredientes */
export const COMPRA_INSUMO_COLUMNS = [
  { label: 'ID', key: 'id' },
  { label: 'Denominación', key: 'denominacion' },
  {
    label: 'Fecha',
    key: 'fechaCompra',
    render: (c: { fechaCompra: string }) => c.fechaCompra.split('-').reverse().join('/'),
  },
  {
    label: 'Total',
    key: 'totalCompra',
    render: (c: { totalCompra: number }) => formatearMonto(c.totalCompra),
  },
];

export interface CompraDetalleDTO {
  insumoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CompraInsumoDTO {
  id: number;
  denominacion: string;
  fechaCompra: string;
  totalCompra: number;
  detalles: CompraDetalleDTO[];
}

export interface NuevaCompraDTO {
  denominacion: string;
  detalles: {
    insumoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
}
