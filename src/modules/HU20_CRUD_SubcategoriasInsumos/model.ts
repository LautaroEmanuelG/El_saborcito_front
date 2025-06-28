import type { Categoria } from '../../types/Categoria';

export const getInitialSubcategoriaInsumo = (): Partial<Categoria> => ({
  denominacion: '',
  tipoCategoria: null,
});

export interface CategoriaTable {
  id: number;
  denominacion: string;
  eliminado?: boolean;
  categoriaId?: number;
  subcategoria?: string;
  searchableText?: string;
}

export const CATEGORIA_COLUMNS = [
  { label: 'Categoría', key: 'denominacion' },
  { label: 'Subcategoría', key: 'subcategoria' },
];
