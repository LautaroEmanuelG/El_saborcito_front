export interface CategoriaPadreTable {
  id: number;
  denominacion: string;
  eliminado: boolean;
  categoriaId: number;
}

export const CATEGORIA_PADRE_COLUMNS = [
  {
    label: 'Nombre',
    key: 'denominacion',
  },
];
