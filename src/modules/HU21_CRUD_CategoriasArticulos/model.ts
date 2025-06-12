import type { Categoria } from '../../types/Categoria';

export const getInitialCategoria = (): Partial<Categoria> => ({
  denominacion: '',
  tipoCategoria: null,
});

// Adaptar el tipo para la tabla genérica
export interface CategoriaTable {
  id: number;
  denominacion: string;
  eliminado?: boolean;
  categoriaId?: number;
  subcategoria?: string;
}

export const CATEGORIA_COLUMNS = [
  { label: 'Categoría', key: 'denominacion' },
  { label: 'Subcategoría', key: 'subcategoria' },
];
