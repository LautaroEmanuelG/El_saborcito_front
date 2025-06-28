import { useCallback, useRef } from 'react';
import type { AnalisisProduccionResponse } from '../../types/Articulo';

interface LastActionRef {
  type: 'add_product' | 'add_promocion' | 'decrease_product' | 'decrease_promocion' | null;
  productId?: number;
  promocionId?: number;
  cantidad?: number;
}

/**
 * Hook para manejar análisis de carrito con debounce
 * Evita análisis múltiples innecesarios y maneja reversión inteligente
 */
export const useCarritoAnalysis = (
  analizarCarrito: (action?: LastActionRef) => Promise<AnalisisProduccionResponse | null>,
  onRevertAction?: (action: LastActionRef) => void
) => {
  const timeoutRef = useRef<number | null>(null);
  const isAnalyzingRef = useRef(false);
  const lastActionRef = useRef<LastActionRef>({ type: null });

  const debouncedAnalysis = useCallback(
    async (delay: number = 300, action?: LastActionRef) => {
      // Limpiar timeout anterior si existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Si ya se está analizando, no hacer nada
      if (isAnalyzingRef.current) {
        return null;
      }

      // Guardar la última acción si se proporciona
      if (action) {
        lastActionRef.current = action;
      }

      return new Promise<AnalisisProduccionResponse | null>((resolve) => {
        timeoutRef.current = window.setTimeout(async () => {
          try {
            isAnalyzingRef.current = true;
            const resultado = await analizarCarrito(lastActionRef.current);

            // Si el análisis falla y hay una acción para revertir
            if (
              resultado &&
              !resultado.sePuedeProducirCompleto &&
              onRevertAction &&
              lastActionRef.current.type
            ) {
              onRevertAction(lastActionRef.current);
            }

            resolve(resultado);
          } catch (error) {
            console.error('Error en análisis de carrito:', error);
            resolve(null);
          } finally {
            isAnalyzingRef.current = false;
            lastActionRef.current = { type: null }; // Limpiar acción después del análisis
          }
        }, delay);
      });
    },
    [analizarCarrito, onRevertAction]
  );

  const analyzeNow = useCallback(
    async (action?: LastActionRef) => {
      if (isAnalyzingRef.current) {
        return null;
      }

      // Guardar la última acción si se proporciona
      if (action) {
        lastActionRef.current = action;
      }

      try {
        isAnalyzingRef.current = true;
        const resultado = await analizarCarrito(lastActionRef.current);

        // Si el análisis falla y hay una acción para revertir
        if (
          resultado &&
          !resultado.sePuedeProducirCompleto &&
          onRevertAction &&
          lastActionRef.current.type
        ) {
          onRevertAction(lastActionRef.current);
        }

        return resultado;
      } catch (error) {
        console.error('Error en análisis inmediato:', error);
        return null;
      } finally {
        isAnalyzingRef.current = false;
        lastActionRef.current = { type: null }; // Limpiar acción después del análisis
      }
    },
    [analizarCarrito, onRevertAction]
  );

  return {
    debouncedAnalysis,
    analyzeNow,
    isAnalyzing: () => isAnalyzingRef.current,
    getLastAction: () => lastActionRef.current,
  };
};
