import { useEffect, useState } from 'react';
import { getAllCategorias } from '../services/categoriaService';
import type { Categoria } from '../../types/Categoria';

/**
 * Hook para depurar las categorías cargadas directamente del servicio
 */
export const useCategoriesDebug = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCategorias();
        setCategorias(data);
        console.log('Categorías cargadas:', data);
      } catch (err) {
        setError('Error al cargar categorías');
        console.error('Error al cargar categorías:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  return { categorias, isLoading, error };
};
