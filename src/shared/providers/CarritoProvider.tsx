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
import { useCarritoAnalysis } from '../hooks/useCarritoAnalysis';
import { analizarProduccion } from '../services/articuloService';
import {
  analizarPromocionAvailability,
  getArticulosFromPromocion,
} from '../../modules/HU11_12_Carrito_Confirmacion/service/Logic';

// Define the state shape
interface ArticuloContext extends Articulo {
  cantidad: number;
}

interface State {
  carrito: ArticuloContext[];
  promocionesEnCarrito: PromocionEnCarrito[];
}

// 🚀 **INTERFAZ OPTIMIZADA DEL CONTEXTO**
interface CarritoContextValue {
  // Estados base
  carrito: ArticuloContext[];
  promocionesEnCarrito: PromocionEnCarrito[];
  limitacionesProduccion: Record<string, number>;
  promocionesProblematicas: Set<number>;

  // Estados de procesamiento
  isAnalyzing: boolean;
  isProcessingInBackground: boolean;

  // Funciones de validación centralizadas
  canIncreaseProduct: (articuloId: number) => boolean;
  canIncreasePromocion: (promocionId: number) => boolean;

  // 🔮 **NUEVA FUNCIÓN DE ANÁLISIS PREDICTIVO**
  analyzeCanIncrease: (articuloId: number) => Promise<boolean>;

  // Funciones de productos
  addToCarrito: (articulo: Articulo, cantidad?: number) => Promise<boolean>;
  removeFromCart: (articulo: { denominacion: string }) => void;
  decreaseFromCart: (articulo: { id: number }) => void;
  isProductAvailable: (articulo: Articulo) => Promise<boolean>;

  // Funciones de promociones
  addPromocionToCarrito: (promocion: Promocion, cantidad?: number) => Promise<boolean>;
  removePromocionFromCart: (promocionId: number) => void;
  decreasePromocionFromCart: (promocionId: number) => void;
  isPromocionAvailable: (promocion: Promocion) => Promise<boolean>;

  // Funciones de análisis y gestión
  analizarCarrito: () => Promise<AnalisisProduccionResponse | null>;
  ajustarCantidadesCarrito: () => Promise<void>;
  clearCarrito: () => void;
}

// Create the context
export const CarritoContext = createContext<CarritoContextValue | undefined>(undefined);

// 🧹 **FUNCIÓN DE LIMPIEZA DE CARRITO ANTIGUO**
const limpiarCarritoAntiguo = (): ArticuloContext[] => {
  try {
    const carritoGuardado = localStorage.getItem('carrito');
    if (!carritoGuardado) return [];

    const carrito = JSON.parse(carritoGuardado) as any[];
    return carrito.filter((item) => {
      return (
        item.id &&
        item.denominacion &&
        item.precioVenta &&
        typeof item.cantidad === 'number' &&
        !item.nombre
      );
    });
  } catch (error) {
    console.error('Error al limpiar carrito:', error);
    return [];
  }
};

// Initial state
const initialState: State = {
  carrito: limpiarCarritoAntiguo(),
  promocionesEnCarrito: [],
};

// 🔄 **REDUCER OPTIMIZADO**
const carritoReducer = (state: State, action: any): State => {
  switch (action.type) {
    case 'ADD_TO_CARRITO': {
      const existingIndex = state.carrito.findIndex(
        (item) => item.id === action.payload.articulo.id
      );

      if (existingIndex !== -1) {
        const updatedCarrito = [...state.carrito];
        updatedCarrito[existingIndex] = {
          ...updatedCarrito[existingIndex],
          cantidad: updatedCarrito[existingIndex].cantidad + (action.payload.cantidad ?? 1),
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
    }

    case 'REMOVE_FROM_CARRITO':
      return {
        ...state,
        carrito: state.carrito.filter(
          (articulo) => articulo.denominacion !== action.payload.nombre
        ),
      };

    case 'DECREASE_FROM_CARRITO': {
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
        return { ...state, carrito: updatedCarrito };
      }
      return state;
    }

    case 'ADD_PROMOCION_TO_CARRITO': {
      const existingIndex = state.promocionesEnCarrito.findIndex(
        (item) => item.promocion.id === action.payload.promocion.id
      );

      if (existingIndex !== -1) {
        const updatedPromociones = [...state.promocionesEnCarrito];
        updatedPromociones[existingIndex] = {
          ...updatedPromociones[existingIndex],
          cantidad: updatedPromociones[existingIndex].cantidad + (action.payload.cantidad ?? 1),
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
    }

    case 'REMOVE_PROMOCION_FROM_CARRITO':
      return {
        ...state,
        promocionesEnCarrito: state.promocionesEnCarrito.filter(
          (item) => item.promocion.id !== action.payload.promocionId
        ),
      };

    case 'DECREASE_PROMOCION_FROM_CARRITO': {
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
        return { ...state, promocionesEnCarrito: updatedPromociones };
      }
      return state;
    }
    case 'ADJUST_QUANTITIES': {
      // Ajustar cantidades según limitaciones de producción
      const { limitaciones } = action.payload;
      const updatedCarrito = state.carrito.map((item) => {
        const limitacion = limitaciones[item.id?.toString() ?? ''];
        if (limitacion !== undefined && item.cantidad > limitacion) {
          return { ...item, cantidad: limitacion };
        }
        return item;
      });

      return { ...state, carrito: updatedCarrito };
    }

    case 'CLEAR_CARRITO':
      return { ...state, carrito: [], promocionesEnCarrito: [] };

    default:
      return state;
  }
};

// 🔧 **UTILIDADES**
const isArticuloManufacturado = (articulo: Articulo): articulo is ArticuloManufacturado => {
  return 'articuloManufacturadoDetalles' in articulo;
};

const isArticuloInsumo = (articulo: any): boolean => {
  return 'stockActual' in articulo && 'esParaElaborar' in articulo;
};

// 🚀 **PROVIDER OPTIMIZADO**
export const CarritoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(carritoReducer, initialState);
  const [isProcessingInBackground, setIsProcessingInBackground] = useState(false);
  const [limitacionesProduccion, setLimitacionesProduccion] = useState<Record<string, number>>({});
  const [promocionesProblematicas, setPromocionesProblematicas] = useState<Set<number>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Referencias para manejo de concurrencia
  const analysisInProgress = useRef(false);
  const lastAnalysisResult = useRef<AnalisisProduccionResponse | null>(null);

  const productAvailability = useProductStore((state) => state.productAvailability);
  const checkSingleProductAvailability = useProductStore(
    (state) => state.checkSingleProductAvailability
  );
  const { mostrarNotificacion } = useNotificacion();

  // 🔄 **FUNCIÓN DE REVERSIÓN INTELIGENTE**
  const revertLastAction = useCallback(
    (action: {
      type: 'add_product' | 'add_promocion' | 'decrease_product' | 'decrease_promocion' | null;
      productId?: number;
      promocionId?: number;
      cantidad?: number;
    }) => {
      console.log('🔄 Revirtiendo acción:', action);

      if (!action.type) return;

      switch (action.type) {
        case 'add_product':
          if (action.productId) {
            dispatch({ type: 'DECREASE_FROM_CARRITO', payload: { id: action.productId } });
            mostrarNotificacion(
              `❌ Se alcanzó el límite de producción y se ajustó la cantidad`,
              'warning',
              3000
            );
          }
          break;
        case 'add_promocion':
          if (action.promocionId) {
            dispatch({
              type: 'DECREASE_PROMOCION_FROM_CARRITO',
              payload: { promocionId: action.promocionId },
            });
            mostrarNotificacion(
              `❌ Esta promoción excede las limitaciones de stock`,
              'warning',
              3000
            );
          }
          break;
      }
    },
    [mostrarNotificacion]
  );

  // 🔍 **ANÁLISIS CENTRALIZADO CORE**
  const analyzeCarritoCore = useCallback(async (): Promise<AnalisisProduccionResponse | null> => {
    if (analysisInProgress.current) {
      return lastAnalysisResult.current;
    }

    try {
      analysisInProgress.current = true;
      setIsAnalyzing(true);
      setIsProcessingInBackground(true);

      // Carrito vacío
      if (state.carrito.length === 0 && state.promocionesEnCarrito.length === 0) {
        setLimitacionesProduccion({});
        setPromocionesProblematicas(new Set());
        lastAnalysisResult.current = null;
        return null;
      }

      // Filtrar productos
      const productosManufacturados = state.carrito.filter(
        (item) => isArticuloManufacturado(item) && item.id
      );
      const productosInsumos = state.carrito.filter((item) => isArticuloInsumo(item) && item.id);

      // Productos de promociones
      const productosDePromociones: Array<{ articuloId: number; cantidad: number }> = [];
      state.promocionesEnCarrito.forEach((promocionEnCarrito) => {
        const articulosDePromocion = getArticulosFromPromocion(
          promocionEnCarrito.promocion,
          promocionEnCarrito.cantidad
        );
        productosDePromociones.push(...articulosDePromocion);
      });

      // Combinar todos los productos para análisis
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

      if (resultado.productosConProblemas && resultado.productosConProblemas.length > 0) {
        resultado.productosConProblemas.forEach((problema: any) => {
          const articuloId = problema.articuloId?.toString() || problema.id?.toString();
          if (articuloId && problema.cantidadMaximaPosible !== undefined) {
            nuevasLimitaciones[articuloId] = problema.cantidadMaximaPosible;
          }
        });
      }

      // Para insumos, agregar limitaciones
      productosInsumos.forEach((insumo) => {
        const stockActual = (insumo as any).stockActual;
        if (stockActual !== undefined && insumo.cantidad >= stockActual) {
          nuevasLimitaciones[insumo.id?.toString() || '0'] = stockActual;
        }
      });

      setLimitacionesProduccion(nuevasLimitaciones);

      // Identificar promociones problemáticas
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
      setIsAnalyzing(false);
      setIsProcessingInBackground(false);
    }
  }, [state.carrito, state.promocionesEnCarrito, mostrarNotificacion]);

  // Hook de análisis con manejo inteligente de reversión
  const { debouncedAnalysis } = useCarritoAnalysis(analyzeCarritoCore, revertLastAction);

  // 🚀 **FUNCIÓN DE ANÁLISIS PÚBLICA**
  const analizarCarrito = useCallback(async (): Promise<AnalisisProduccionResponse | null> => {
    return await debouncedAnalysis(300);
  }, [debouncedAnalysis]);
  // 🔮 **FUNCIÓN DE ANÁLISIS PREDICTIVO OPTIMIZADA**
  const analyzeCanIncrease = useCallback(
    async (articuloId: number): Promise<boolean> => {
      try {
        setIsAnalyzing(true);
        console.log(`🔮 Analizando si se puede agregar uno más del producto ID: ${articuloId}`);

        // Encontrar el producto en el carrito
        const productoEnCarrito = state.carrito.find((item) => item.id === articuloId);
        if (!productoEnCarrito) {
          console.log('✅ Producto no está en carrito, se puede agregar');
          return true;
        }

        // Filtrar productos manufacturados e insumos
        const productosManufacturados = state.carrito.filter(
          (item) => isArticuloManufacturado(item) && item.id
        );
        const productosInsumos = state.carrito.filter((item) => isArticuloInsumo(item) && item.id);

        // Productos de promociones
        const productosDePromociones: Array<{ articuloId: number; cantidad: number }> = [];
        state.promocionesEnCarrito.forEach((promocionEnCarrito) => {
          const articulosDePromocion = getArticulosFromPromocion(
            promocionEnCarrito.promocion,
            promocionEnCarrito.cantidad
          );
          productosDePromociones.push(...articulosDePromocion);
        });

        // 🔮 **SIMULACIÓN: Solo agregar +1 al producto específico para validación**
        const todosLosProductos = [...productosManufacturados, ...productosInsumos];
        const todosLosArticulosParaAnalizar = [
          ...todosLosProductos.map((item) => ({
            articuloId: item.id!,
            cantidad: item.id === articuloId ? item.cantidad + 1 : item.cantidad, // +1 SOLO para validación
          })),
          ...productosDePromociones,
        ];

        if (todosLosArticulosParaAnalizar.length === 0) {
          return true;
        }

        console.log(
          `🔍 Analizando producción con ${todosLosArticulosParaAnalizar.length} productos...`
        );
        const resultado = await analizarProduccion(todosLosArticulosParaAnalizar);

        // Si el análisis falla con cantidad+1, ajustar automáticamente
        if (!resultado.sePuedeProducirCompleto) {
          console.log(`❌ No se puede producir con cantidad+1, ajustando automáticamente...`);

          if (resultado.productosConProblemas?.length > 0) {
            const problemaDelProducto = resultado.productosConProblemas.find(
              (problema: any) => problema.articuloId === articuloId
            );

            if (problemaDelProducto?.cantidadMaximaPosible !== undefined) {
              const cantidadMaxima = problemaDelProducto.cantidadMaximaPosible;
              console.log(`🔧 Cantidad máxima posible: ${cantidadMaxima}`);

              // 🚀 **AUTO-AJUSTE AUTOMÁTICO: Colocar el máximo inmediatamente**
              setLimitacionesProduccion((prev) => ({
                ...prev,
                [articuloId.toString()]: cantidadMaxima,
              }));

              // Si la cantidad actual excede el máximo, ajustar automáticamente
              if (productoEnCarrito.cantidad > cantidadMaxima) {
                dispatch({
                  type: 'ADJUST_QUANTITIES',
                  payload: {
                    limitaciones: { [articuloId.toString()]: cantidadMaxima },
                  },
                });

                mostrarNotificacion(
                  `⚠️ Stock limitado: máximo ${cantidadMaxima} unidades disponibles. Se ajustó automáticamente.`,
                  'warning',
                  4000
                );

                console.log(
                  `🔧 Cantidad ajustada automáticamente de ${productoEnCarrito.cantidad} a ${cantidadMaxima}`
                );
              } else {
                // Solo establecer la limitación para deshabilitar el botón "+"
                mostrarNotificacion(
                  `⚠️ Stock limitado: máximo ${cantidadMaxima} unidades disponibles`,
                  'warning',
                  3000
                );
              }
            }
          }
          return false;
        }

        console.log('✅ Se puede agregar uno más');
        return true;
      } catch (error) {
        console.error('❌ Error en análisis predictivo:', error);
        return false;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [state.carrito, state.promocionesEnCarrito, mostrarNotificacion]
  );

  // 🔧 **UTILIDADES**
  const getPromocionesProblematicas = useCallback(
    (analisis: AnalisisProduccionResponse | null): Set<number> => {
      const promocionesProblematicas = new Set<number>();

      if (!analisis?.productosConProblemas) return promocionesProblematicas;

      state.promocionesEnCarrito.forEach((promocionEnCarrito) => {
        const articulosDeEstaPromocion = getArticulosFromPromocion(
          promocionEnCarrito.promocion,
          promocionEnCarrito.cantidad
        );

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

  // 💾 **EFECTO DE PERSISTENCIA**
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(state.carrito));
  }, [state.carrito]);

  // 🎯 **FUNCIONES DE VALIDACIÓN CENTRALIZADAS**
  const canIncreaseProduct = useCallback(
    (articuloId: number): boolean => {
      if (isAnalyzing) return false;

      const articuloIdStr = articuloId.toString();
      const limitacionMaxima = limitacionesProduccion[articuloIdStr];
      const cantidadActual = state.carrito.find((item) => item.id === articuloId)?.cantidad ?? 0;

      return !limitacionMaxima || cantidadActual < limitacionMaxima;
    },
    [isAnalyzing, limitacionesProduccion, state.carrito]
  );

  const canIncreasePromocion = useCallback(
    (promocionId: number): boolean => {
      if (isAnalyzing) return false;
      return !promocionesProblematicas.has(promocionId);
    },
    [isAnalyzing, promocionesProblematicas]
  );

  // 🛒 **FUNCIONES DE PRODUCTOS**
  const isProductAvailable = useCallback(
    async (articulo: Articulo): Promise<boolean> => {
      if (!isArticuloManufacturado(articulo) || !articulo.id) {
        return true;
      }

      const cachedAvailability = productAvailability[articulo.id];
      if (cachedAvailability !== undefined) {
        return cachedAvailability;
      }

      setIsProcessingInBackground(true);
      try {
        await checkSingleProductAvailability(articulo.id);
        const updatedAvailability = useProductStore.getState().productAvailability[articulo.id];
        return updatedAvailability ?? false;
      } finally {
        setIsProcessingInBackground(false);
      }
    },
    [productAvailability, checkSingleProductAvailability]
  );
  const addToCarrito = useCallback(
    async (articulo: Articulo, cantidad: number = 1): Promise<boolean> => {
      // � **ESTRATEGIA PREDICTIVA CON AUTO-AJUSTE**

      // 1. Verificar si se puede aumentar usando análisis predictivo
      if (articulo.id) {
        const canIncrease = await analyzeCanIncrease(articulo.id);
        if (!canIncrease) {
          // El análisis predictivo ya ajustó las cantidades automáticamente
          return false;
        }
      }

      // 2. Agregar al carrito
      dispatch({ type: 'ADD_TO_CARRITO', payload: { articulo, cantidad } });

      // 3. Solo para productos nuevos, verificar disponibilidad
      const existeEnCarrito = state.carrito.some((item) => item.id === articulo.id);
      if (!existeEnCarrito && isArticuloManufacturado(articulo) && articulo.id) {
        try {
          await checkSingleProductAvailability(articulo.id);
          const availability = useProductStore.getState().productAvailability[articulo.id];

          if (!availability) {
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
          console.error('Error verificando disponibilidad:', error);
          mostrarNotificacion(
            `⚠️ No se pudo verificar la disponibilidad de ${articulo.denominacion}`,
            'warning',
            3000
          );
        }
      }

      return true;
    },
    [analyzeCanIncrease, state.carrito, checkSingleProductAvailability, mostrarNotificacion]
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

  // 🎁 **FUNCIONES DE PROMOCIONES**
  const isPromocionAvailable = useCallback(async (promocion: Promocion): Promise<boolean> => {
    try {
      return await analizarPromocionAvailability(promocion);
    } catch (error) {
      console.error('Error verificando disponibilidad de promoción:', error);
      return false;
    }
  }, []);

  const addPromocionToCarrito = useCallback(
    async (promocion: Promocion, cantidad: number = 1): Promise<boolean> => {
      // 🚀 **ESTRATEGIA OPTIMISTA PARA PROMOCIONES**

      // 1. Verificar si se puede aumentar
      if (!canIncreasePromocion(promocion.id)) {
        mostrarNotificacion(
          `❌ No se puede agregar más de la promoción ${promocion.denominacion} - limitaciones de stock`,
          'warning',
          3000
        );
        return false;
      }

      // 2. Agregar al carrito inmediatamente
      dispatch({
        type: 'ADD_PROMOCION_TO_CARRITO',
        payload: { promocion, cantidad, disponible: true },
      });

      // 3. Programar análisis con información de la acción
      await debouncedAnalysis(300, {
        type: 'add_promocion',
        promocionId: promocion.id,
        cantidad,
      });

      return true;
    },
    [canIncreasePromocion, mostrarNotificacion, debouncedAnalysis]
  );

  const removePromocionFromCart = useCallback((promocionId: number) => {
    dispatch({ type: 'REMOVE_PROMOCION_FROM_CARRITO', payload: { promocionId } });
  }, []);

  const decreasePromocionFromCart = useCallback((promocionId: number) => {
    dispatch({ type: 'DECREASE_PROMOCION_FROM_CARRITO', payload: { promocionId } });
  }, []);

  // 🔧 **FUNCIÓN DE AJUSTE MANUAL**
  const ajustarCantidadesCarrito = useCallback(async (): Promise<void> => {
    if (Object.keys(limitacionesProduccion).length > 0) {
      dispatch({
        type: 'ADJUST_QUANTITIES',
        payload: { limitaciones: limitacionesProduccion },
      });
    }
  }, [limitacionesProduccion]);

  // 🚀 **PROVIDER VALUE OPTIMIZADO**
  const contextValue: CarritoContextValue = {
    // Estados base
    carrito: state.carrito,
    promocionesEnCarrito: state.promocionesEnCarrito,
    limitacionesProduccion,
    promocionesProblematicas,

    // Estados de procesamiento
    isAnalyzing,
    isProcessingInBackground,

    // Funciones de validación centralizadas
    canIncreaseProduct,
    canIncreasePromocion,
    analyzeCanIncrease,

    // Funciones de productos
    addToCarrito,
    removeFromCart,
    decreaseFromCart,
    isProductAvailable,

    // Funciones de promociones
    addPromocionToCarrito,
    removePromocionFromCart,
    decreasePromocionFromCart,
    isPromocionAvailable,

    // Funciones de análisis y gestión
    analizarCarrito,
    ajustarCantidadesCarrito,
    clearCarrito,
  };

  return <CarritoContext.Provider value={contextValue}>{children}</CarritoContext.Provider>;
};
