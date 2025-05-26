// src/modules/HU26_28_informes/informes/model.ts

export interface ProductoRanking {
  id: number;
  denominacion: string;
  cantidadVendida: number;
  tipo: 'MANUFACTURADO' | 'INSUMO';
}
