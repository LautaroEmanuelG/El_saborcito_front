import { useEffect, useState } from 'react';
import * as insumoService from '../../../shared/services/articuloInsumoService';
import type { ArticuloInsumo } from '../../../types/Articulo';

export function useStockInsumoStore() {
  const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsumos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await insumoService.getAllArticuloInsumos();
      setInsumos(data);
    } catch (e) {
      setError('Error al cargar insumos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  return {
    insumos,
    loading,
    error,
    fetchInsumos,
  };
}
