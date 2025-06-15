import { useCallback, useRef } from 'react';

/**
 * Hook para manejar análisis de carrito con debounce
 * Evita análisis múltiples innecesarios
 */
export const useCarritoAnalysis = (analizarCarrito: () => Promise<any>) => {
  const timeoutRef = useRef<number | null>(null);
  const isAnalyzingRef = useRef(false);

  const debouncedAnalysis = useCallback(
    async (delay: number = 300) => {
      // Limpiar timeout anterior si existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Si ya se está analizando, no hacer nada
      if (isAnalyzingRef.current) {
        console.log('⏳ Análisis ya en curso, saltando...');
        return;
      }

      return new Promise((resolve) => {
        timeoutRef.current = window.setTimeout(async () => {
          try {
            isAnalyzingRef.current = true;
            console.log('🔍 Iniciando análisis de carrito');
            const resultado = await analizarCarrito();
            resolve(resultado);
          } catch (error) {
            console.error('Error en análisis de carrito:', error);
            resolve(null);
          } finally {
            isAnalyzingRef.current = false;
          }
        }, delay);
      });
    },
    [analizarCarrito]
  );

  const analyzeNow = useCallback(async () => {
    if (isAnalyzingRef.current) {
      console.log('⏳ Análisis ya en curso, esperando...');
      return;
    }

    try {
      isAnalyzingRef.current = true;
      console.log('🔍 Análisis inmediato de carrito');
      return await analizarCarrito();
    } catch (error) {
      console.error('Error en análisis inmediato:', error);
      return null;
    } finally {
      isAnalyzingRef.current = false;
    }
  }, [analizarCarrito]);

  return {
    debouncedAnalysis,
    analyzeNow,
    isAnalyzing: () => isAnalyzingRef.current,
  };
};
