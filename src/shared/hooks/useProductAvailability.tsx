import { useState, useEffect } from 'react';
import { canBeManufactured } from '../services/articuloManufacturadoService';
import type { Articulo, ArticuloInsumo, ArticuloManufacturado } from '../../types/Articulo';

// Constantes para mejorar la legibilidad
const AVAILABILITY_CHECK_INTERVAL = 60000; // 1 minuto
const CACHE_EXPIRY_TIME = 300000; // 5 minutos

// Tipo para el caché
interface AvailabilityCache {
  [key: number]: {
    available: boolean;
    timestamp: number;
  };
}

/**
 * Determina si un artículo es de tipo ArticuloManufacturado
 */
const isArticuloManufacturado = (articulo: Articulo): articulo is ArticuloManufacturado => {
  return 'categoriaId' in articulo && 'descripcion' in articulo;
};

/**
 * Determina si un artículo es de tipo ArticuloInsumo
 */
const isArticuloInsumo = (articulo: Articulo): articulo is ArticuloInsumo => {
  return 'precioCompra' in articulo && 'stockActual' in articulo;
};

// Hook para verificar si un producto puede ser fabricado
export const useProductAvailability = () => {
  // Caché para almacenar resultados y evitar llamadas innecesarias
  const [availabilityCache, setAvailabilityCache] = useState<AvailabilityCache>({});

  // Limpiar caché expirado periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updatedCache = { ...availabilityCache };
      let hasChanged = false;

      Object.keys(updatedCache).forEach((key) => {
        const numericKey = Number(key);
        if (now - updatedCache[numericKey].timestamp > CACHE_EXPIRY_TIME) {
          delete updatedCache[numericKey];
          hasChanged = true;
        }
      });

      if (hasChanged) {
        setAvailabilityCache(updatedCache);
      }
    }, AVAILABILITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [availabilityCache]);

  // Función para verificar disponibilidad
  const checkAvailability = async (articulo: Articulo): Promise<boolean> => {
    // Si no tiene ID, asumimos que no se puede verificar
    if (!articulo.id) return true;

    const articuloId = articulo.id;

    // Si es un ArticuloInsumo, siempre está disponible (no necesita ser manufacturado)
    if (isArticuloInsumo(articulo)) return true;

    // Si no es un ArticuloManufacturado, asumimos que está disponible
    if (!isArticuloManufacturado(articulo)) return true;

    // Verificar si tenemos un resultado en caché que no haya expirado
    const cachedResult = availabilityCache[articuloId];
    const now = Date.now();

    if (cachedResult && now - cachedResult.timestamp < CACHE_EXPIRY_TIME) {
      return cachedResult.available;
    }

    try {
      // Llamar al servicio para verificar
      const available = await canBeManufactured(articuloId);

      // Guardar en caché
      setAvailabilityCache((prev) => ({
        ...prev,
        [articuloId]: {
          available,
          timestamp: now,
        },
      }));

      return available;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return false;
    }
  };
  return {
    checkAvailability,
    isArticuloManufacturado,
    isArticuloInsumo,
  };
};
