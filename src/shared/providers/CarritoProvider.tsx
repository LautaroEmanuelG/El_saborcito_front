import React, {
  createContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
  useState,
  useRef,
} from 'react';
import type {
  Articulo,
  ArticuloManufacturado,
  AnalisisProduccionResponse,
} from '../../types/Articulo';
import type { Promocion, PromocionEnCarrito } from '../../types/Promocion';
import { useProductStore } from './ProductProvider';
import { useNotificacion } from '../hooks/useNotificacion';
import { analizarProduccion } from '../services/articuloService';
import {
  analizarPromocionAvailability,
  getArticulosFromPromocion,
} from '../../modules/HU11_12_Carrito_Confirmacion/service/Logic';

// Define the state shape - El carrito puede contener cualquier tipo de artículo
interface ArticuloContext extends Articulo {
  cantidad: number;
}

interface State {
  carrito: ArticuloContext[];
  promocionesEnCarrito: PromocionEnCarrito[]; // 🎁 Nuevo estado para promociones
}

// Define the context value shape
interface CarritoContextValue {
  carrito: ArticuloContext[];
  promocionesEnCarrito: PromocionEnCarrito[]; // 🎁 Exposer promociones en carrito
  addToCarrito: (articulo: Articulo, cantidad: number) => Promise<boolean>; // Devuelve true si se pudo agregar, false si no
  removeFromCart: (articulo: { denominacion: string }) => void;
  decreaseFromCart: (articulo: { id: number }) => void;
  clearCarrito: () => void;
  isProductAvailable: (articulo: Articulo) => Promise<boolean>; // Nueva función para verificar disponibilidad
  isProcessingInBackground: boolean; // Flag para saber si hay procesos en segundo plano
  analizarCarrito: () => Promise<AnalisisProduccionResponse | null>; // Nueva función para analizar todo el carrito
  limitacionesProduccion: Record<string, number>; // ID del producto (como string) -> cantidad máxima producible
  ajustarCantidadesCarrito: () => Promise<void>; // Función para ajustar cantidades manualmente
  promocionesProblematicas: Set<number>; // IDs de promociones que tienen productos problemáticos

  // 🎁 **NUEVAS FUNCIONES PARA PROMOCIONES**
  addPromocionToCarrito: (promocion: Promocion, cantidad: number) => Promise<boolean>;
  removePromocionFromCart: (promocionId: number) => void;
  decreasePromocionFromCart: (promocionId: number) => void;
  isPromocionAvailable: (promocion: Promocion) => Promise<boolean>;
}
// Create the context
export const CarritoContext = createContext<CarritoContextValue | undefined>(undefined);

// Función para limpiar carrito con productos de estructura antigua
const limpiarCarritoAntiguo = (): ArticuloContext[] => {
  try {
    const carritoGuardado = localStorage.getItem('carrito');
    if (!carritoGuardado) return [];

    const carrito = JSON.parse(carritoGuardado) as any[];

    // Filtrar productos que tienen la estructura correcta
    const carritoLimpio = carrito.filter((item) => {
      // Verificar que tiene las propiedades básicas necesarias
      return (
        item.id &&
        item.denominacion &&
        item.precioVenta &&
        typeof item.cantidad === 'number' &&
        !item.nombre
      ); // Excluir productos con estructura antigua que tienen 'nombre' en lugar de 'denominacion'
    });

    return carritoLimpio;
  } catch (error) {
    console.error('Error al limpiar carrito:', error);
    return [];
  }
};

// Define the initial state
const initialState: State = {
  carrito: limpiarCarritoAntiguo(),
  promocionesEnCarrito: [], // 🎁 Inicializar array vacío de promociones
};

// Define the reducer
const carritoReducer = (state: State, action: any): State => {
  switch (action.type) {
    case 'ADD_TO_CARRITO':
      const existingProductIndex = state.carrito.findIndex(
        (item) => item.id === action.payload.articulo.id
      );

      if (existingProductIndex !== -1) {
        const updatedCarrito = [...state.carrito];
        updatedCarrito[existingProductIndex] = {
          ...updatedCarrito[existingProductIndex],
          cantidad: updatedCarrito[existingProductIndex].cantidad + (action.payload.cantidad ?? 1),
        };
        return { ...state, carrito: updatedCarrito };
      }

      return {
        ...state,
        carrito: [
          ...state.carrito,
          { ...action.payload.articulo, cantidad: action.payload.cantidad ?? 1 },
        ],
      };
    case 'REMOVE_FROM_CARRITO':
      return {
        ...state,
        carrito: state.carrito.filter(
          (articulo) => articulo.denominacion !== action.payload.nombre
        ),
      };
    case 'DECREASE_FROM_CARRITO':
      const articuloIndex = state.carrito.findIndex(
        (articulo) => articulo.id === action.payload.id
      );
      if (articuloIndex !== -1) {
        const updatedCarrito = [...state.carrito];
        if (updatedCarrito[articuloIndex].cantidad > 1) {
          updatedCarrito[articuloIndex] = {
            ...updatedCarrito[articuloIndex],
            cantidad: updatedCarrito[articuloIndex].cantidad - 1,
          };
        } else {
          updatedCarrito.splice(articuloIndex, 1);
        }
        return {
          ...state,
          carrito: updatedCarrito,
        };
      }
      return state;
    case 'ADJUST_QUANTITIES':
      // Ajustar cantidades basado en limitaciones de producción
      // Solo para productos manufacturados, no para insumos
      const updatedCarritoWithLimits = state.carrito.map((item) => {
        const limitacion = action.payload.limitaciones[item.id?.toString()];
        const esManufacturado = isArticuloManufacturado(item);

        // Solo ajustar cantidades automáticamente para productos manufacturados
        if (limitacion && item.cantidad > limitacion && esManufacturado) {
          console.log(
            `🔧 Ajustando cantidad de ${item.denominacion} de ${item.cantidad} a ${limitacion}`
          );
          return { ...item, cantidad: limitacion };
        }
        return item;
      });
      return { ...state, carrito: updatedCarritoWithLimits };

    // 🎁 **NUEVOS CASOS PARA PROMOCIONES**
    case 'ADD_PROMOCION_TO_CARRITO':
      const existingPromocionIndex = state.promocionesEnCarrito.findIndex(
        (item) => item.promocion.id === action.payload.promocion.id
      );

      if (existingPromocionIndex !== -1) {
        const updatedPromociones = [...state.promocionesEnCarrito];
        updatedPromociones[existingPromocionIndex] = {
          ...updatedPromociones[existingPromocionIndex],
          cantidad:
            updatedPromociones[existingPromocionIndex].cantidad + (action.payload.cantidad ?? 1),
        };
        return { ...state, promocionesEnCarrito: updatedPromociones };
      }

      return {
        ...state,
        promocionesEnCarrito: [
          ...state.promocionesEnCarrito,
          {
            promocion: action.payload.promocion,
            cantidad: action.payload.cantidad ?? 1,
            disponible: action.payload.disponible ?? true,
          },
        ],
      };

    case 'REMOVE_PROMOCION_FROM_CARRITO':
      return {
        ...state,
        promocionesEnCarrito: state.promocionesEnCarrito.filter(
          (item) => item.promocion.id !== action.payload.promocionId
        ),
      };

    case 'DECREASE_PROMOCION_FROM_CARRITO':
      const promocionIndex = state.promocionesEnCarrito.findIndex(
        (item) => item.promocion.id === action.payload.promocionId
      );
      if (promocionIndex !== -1) {
        const updatedPromociones = [...state.promocionesEnCarrito];
        if (updatedPromociones[promocionIndex].cantidad > 1) {
          updatedPromociones[promocionIndex] = {
            ...updatedPromociones[promocionIndex],
            cantidad: updatedPromociones[promocionIndex].cantidad - 1,
          };
        } else {
          updatedPromociones.splice(promocionIndex, 1);
        }
        return {
          ...state,
          promocionesEnCarrito: updatedPromociones,
        };
      }
      return state;

    case 'CLEAR_CARRITO':
      return { ...state, carrito: [], promocionesEnCarrito: [] }; // Limpiar también promociones

    default:
      return state;
  }
};

/**
 * Determina si un artículo es de tipo ArticuloManufacturado
 */
const isArticuloManufacturado = (articulo: Articulo): articulo is ArticuloManufacturado => {
  return 'articuloManufacturadoDetalles' in articulo;
};

/**
 * Determina si un artículo es de tipo ArticuloInsumo
 */
const isArticuloInsumo = (articulo: any): boolean => {
  return 'stockActual' in articulo && 'esParaElaborar' in articulo;
};

// Define the provider component
export const CarritoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(carritoReducer, initialState);
  const [isProcessingInBackground, setIsProcessingInBackground] = useState(false);
  const [limitacionesProduccion, setLimitacionesProduccion] = useState<Record<string, number>>({});
  const [promocionesProblematicas, setPromocionesProblematicas] = useState<Set<number>>(new Set());

  // Referencias para manejo de concurrencia
  const analysisInProgress = useRef(false);
  const lastAnalysisResult = useRef<AnalisisProduccionResponse | null>(null);

  const productAvailability = useProductStore((state) => state.productAvailability);
  const checkSingleProductAvailability = useProductStore(
    (state) => state.checkSingleProductAvailability
  );
  const { mostrarNotificacion } = useNotificacion();

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(state.carrito));
  }, [state.carrito]);

  // Función para verificar disponibilidad de un producto
  const isProductAvailable = useCallback(
    async (articulo: Articulo): Promise<boolean> => {
      // Solo verificamos disponibilidad para artículos manufacturados
      if (!isArticuloManufacturado(articulo) || !articulo.id) {
        return true; // Los artículos que no son manufacturados siempre están disponibles
      }

      // Verificar en el estado centralizado primero
      const cachedAvailability = productAvailability[articulo.id];
      if (cachedAvailability !== undefined) {
        return cachedAvailability;
      }

      // Si no está en el caché, verificar y actualizar
      setIsProcessingInBackground(true);
      try {
        await checkSingleProductAvailability(articulo.id);
        // Obtener el resultado actualizado
        const updatedAvailability = useProductStore.getState().productAvailability[articulo.id];
        return updatedAvailability ?? false;
      } finally {
        setIsProcessingInBackground(false);
      }
    },
    [productAvailability, checkSingleProductAvailability]
  );

  // Función para verificar disponibilidad en background y notificar si no hay stock
  const addToCarrito = useCallback(
    async (articulo: Articulo, cantidad: number = 1): Promise<boolean> => {
      // Estrategia: Permitir → Validar → Revertir si es necesario

      // 1. Agregar al carrito inmediatamente (estrategia optimista)
      dispatch({ type: 'ADD_TO_CARRITO', payload: { articulo, cantidad } });

      // 2. Si es un producto nuevo, validar inmediatamente
      const existeEnCarrito = state.carrito.some((item) => item.id === articulo.id);

      if (!existeEnCarrito && isArticuloManufacturado(articulo) && articulo.id) {
        try {
          await checkSingleProductAvailability(articulo.id);
          const availability = useProductStore.getState().productAvailability[articulo.id];

          if (!availability) {
            // Producto no se puede producir, eliminarlo inmediatamente
            dispatch({
              type: 'REMOVE_FROM_CARRITO',
              payload: { nombre: articulo.denominacion },
            });

            mostrarNotificacion(
              `❌ ${articulo.denominacion} no está disponible y ha sido removido del carrito`,
              'error',
              4000
            );

            return false;
          }
        } catch (error) {
          console.error('Error verificando disponibilidad de producto nuevo:', error);
          // En caso de error, mantener el producto pero notificar
          mostrarNotificacion(
            `⚠️ No se pudo verificar la disponibilidad de ${articulo.denominacion}`,
            'warning',
            3000
          );
        }
      }

      return true;
    },
    [checkSingleProductAvailability, mostrarNotificacion]
  );

  const removeFromCart = useCallback((articulo: { denominacion: string }) => {
    dispatch({ type: 'REMOVE_FROM_CARRITO', payload: { nombre: articulo.denominacion } });
  }, []);

  const decreaseFromCart = useCallback((articulo: { id: number }) => {
    dispatch({ type: 'DECREASE_FROM_CARRITO', payload: articulo });
  }, []);
  const clearCarrito = useCallback(() => {
    dispatch({ type: 'CLEAR_CARRITO' });
    localStorage.removeItem('carrito');
  }, []);

  // 🎁 **NUEVAS FUNCIONES PARA PROMOCIONES**

  // Verificar disponibilidad de una promoción
  const isPromocionAvailable = useCallback(async (promocion: Promocion): Promise<boolean> => {
    try {
      return await analizarPromocionAvailability(promocion);
    } catch (error) {
      console.error('Error verificando disponibilidad de promoción:', error);
      return false;
    }
  }, []);

  // Agregar promoción al carrito
  const addPromocionToCarrito = useCallback(
    async (promocion: Promocion, cantidad: number = 1): Promise<boolean> => {
      try {
        // Verificar disponibilidad antes de agregar
        const available = await isPromocionAvailable(promocion);

        if (!available) {
          mostrarNotificacion(
            `⚠️ No hay suficientes insumos para la promoción ${promocion.denominacion}`,
            'error',
            3000
          );
          return false;
        }

        // Agregar al carrito si está disponible
        dispatch({
          type: 'ADD_PROMOCION_TO_CARRITO',
          payload: { promocion, cantidad, disponible: available },
        });

        mostrarNotificacion(`🎁 ${promocion.denominacion} añadida al carrito`, 'success', 2000);

        return true;
      } catch (error) {
        console.error('Error al agregar promoción al carrito:', error);
        mostrarNotificacion('Error al agregar promoción al carrito', 'error', 3000);
        return false;
      }
    },
    [isPromocionAvailable, mostrarNotificacion]
  );

  // Remover promoción del carrito
  const removePromocionFromCart = useCallback((promocionId: number) => {
    dispatch({ type: 'REMOVE_PROMOCION_FROM_CARRITO', payload: { promocionId } });
  }, []);

  // Disminuir cantidad de promoción
  const decreasePromocionFromCart = useCallback((promocionId: number) => {
    dispatch({ type: 'DECREASE_PROMOCION_FROM_CARRITO', payload: { promocionId } });
  }, []);
  // Función para analizar todo el carrito con debounce y protección contra concurrencia
  const analizarCarrito = useCallback(async (): Promise<AnalisisProduccionResponse | null> => {
    // Evitar análisis concurrentes
    if (analysisInProgress.current) {
      return lastAnalysisResult.current;
    }

    try {
      analysisInProgress.current = true;
      setIsProcessingInBackground(true);

      // Carrito vacío: limpiar limitaciones y estados problemáticos
      if (state.carrito.length === 0 && state.promocionesEnCarrito.length === 0) {
        setLimitacionesProduccion({});
        setPromocionesProblematicas(new Set());
        lastAnalysisResult.current = null;
        return null;
      }

      // Filtrar productos manufacturados del carrito
      const productosManufacturados = state.carrito.filter(
        (item) => isArticuloManufacturado(item) && item.id
      );

      // Filtrar productos insumos del carrito
      const productosInsumos = state.carrito.filter((item) => isArticuloInsumo(item) && item.id);

      // 🎁 **INCLUIR PRODUCTOS DE PROMOCIONES**
      const productosDePromociones: Array<{ articuloId: number; cantidad: number }> = [];
      state.promocionesEnCarrito.forEach((promocionEnCarrito) => {
        const articulosDePromocion = getArticulosFromPromocion(
          promocionEnCarrito.promocion,
          promocionEnCarrito.cantidad
        );
        productosDePromociones.push(...articulosDePromocion);
      });

      // Combinar todos los productos para análisis (carrito + promociones)
      const todosLosProductos = [...productosManufacturados, ...productosInsumos];
      const todosLosArticulosParaAnalizar = [
        ...todosLosProductos.map((item) => ({
          articuloId: item.id!,
          cantidad: item.cantidad,
        })),
        ...productosDePromociones,
      ];

      if (todosLosArticulosParaAnalizar.length === 0) {
        lastAnalysisResult.current = null;
        return null;
      }

      const resultado = await analizarProduccion(todosLosArticulosParaAnalizar);
      lastAnalysisResult.current = resultado;

      // Actualizar limitaciones de producción
      const nuevasLimitaciones: Record<string, number> = {};

      // Solo agregar limitaciones para productos que realmente tienen problemas
      if (resultado.productosConProblemas && resultado.productosConProblemas.length > 0) {
        resultado.productosConProblemas.forEach((problema: any) => {
          const articuloId = problema.articuloId?.toString() || problema.id?.toString();
          if (articuloId && problema.cantidadMaximaPosible !== undefined) {
            nuevasLimitaciones[articuloId] = problema.cantidadMaximaPosible;
          }
        });
      }

      // Para insumos, agregar limitaciones si la cantidad en carrito excede o iguala el stock
      productosInsumos.forEach((insumo) => {
        const stockActual = (insumo as any).stockActual;
        if (stockActual !== undefined && insumo.cantidad >= stockActual) {
          nuevasLimitaciones[insumo.id?.toString() || '0'] = stockActual;
        }
      });

      setLimitacionesProduccion(nuevasLimitaciones);

      // Identificar promociones problemáticas basadas en el análisis
      const promocionesConProblemas = getPromocionesProblematicas(resultado);
      setPromocionesProblematicas(promocionesConProblemas);

      // Si el carrito es válido, limpiar estados problemáticos
      if (resultado.sePuedeProducirCompleto) {
        setLimitacionesProduccion({});
        setPromocionesProblematicas(new Set());
      }

      return resultado;
    } catch (error) {
      console.error('Error analizando carrito:', error);
      mostrarNotificacion('Error al verificar disponibilidad del carrito', 'error', 3000);
      return null;
    } finally {
      analysisInProgress.current = false;
      setIsProcessingInBackground(false);
    }
  }, [state.carrito, state.promocionesEnCarrito, mostrarNotificacion]);

  // Función para ajustar cantidades manualmente basado en limitaciones actuales
  const ajustarCantidadesCarrito = useCallback(async (): Promise<void> => {
    if (Object.keys(limitacionesProduccion).length > 0) {
      dispatch({
        type: 'ADJUST_QUANTITIES',
        payload: { limitaciones: limitacionesProduccion },
      });
    }
  }, [limitacionesProduccion, mostrarNotificacion]);

  // Función para identificar promociones problemáticas
  const getPromocionesProblematicas = useCallback(
    (analisis: AnalisisProduccionResponse | null): Set<number> => {
      const promocionesProblematicas = new Set<number>();

      if (!analisis?.productosConProblemas) return promocionesProblematicas;

      // Para cada promoción en el carrito, verificar si alguno de sus artículos tiene problemas
      state.promocionesEnCarrito.forEach((promocionEnCarrito) => {
        const articulosDeEstaPromocion = getArticulosFromPromocion(
          promocionEnCarrito.promocion,
          promocionEnCarrito.cantidad
        );

        // Verificar si algún artículo de esta promoción está en los productos problemáticos
        const tieneProblemas = articulosDeEstaPromocion.some((articuloPromo) =>
          analisis.productosConProblemas?.some(
            (problema: any) => problema.articuloId === articuloPromo.articuloId
          )
        );

        if (tieneProblemas) {
          promocionesProblematicas.add(promocionEnCarrito.promocion.id);
        }
      });

      return promocionesProblematicas;
    },
    [state.promocionesEnCarrito]
  );

  return (
    <CarritoContext.Provider
      value={{
        carrito: state.carrito,
        promocionesEnCarrito: state.promocionesEnCarrito, // 🎁 Exposer promociones
        addToCarrito,
        removeFromCart,
        decreaseFromCart,
        clearCarrito,
        isProductAvailable,
        isProcessingInBackground,
        analizarCarrito,
        limitacionesProduccion,
        ajustarCantidadesCarrito,
        promocionesProblematicas,
        // 🎁 Nuevas funciones de promociones
        addPromocionToCarrito,
        removePromocionFromCart,
        decreasePromocionFromCart,
        isPromocionAvailable,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
