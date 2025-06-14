export interface Categoria {
  id?: number;
  denominacion: string;
  tipoCategoria?: Categoria | null;
  tipo?: 'INSUMOS' | 'MANUFACTURADOS';
}
