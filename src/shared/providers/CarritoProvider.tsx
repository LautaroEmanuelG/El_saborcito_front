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
import { useAutoAjusteModal } from '../hooks/useAutoAjusteModal';
import { analizarProduccion } from '../services/articuloService';
import {
  analizarPromocionAvailability,
  getArticulosFromPromocion,
} from '../../modules/HU11_12_Carrito_Confirmacion/service/Logic';
import { ModalAutoAjuste } from '../components/ModalAutoAjuste';

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
  analyzeCanIncreasePromocion: (
    promocionId: number,
    promocionCompleta?: Promocion
  ) => Promise<boolean>;

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

    case 'ADJUST_PROMOCION_QUANTITIES': {
      // Ajustar cantidades de promociones específicas
      const { promocionId, nuevaCantidad } = action.payload;
      const updatedPromociones = state.promocionesEnCarrito.map((item) => {
        if (item.promocion.id === promocionId) {
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      });

      return { ...state, promocionesEnCarrito: updatedPromociones };
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

  // 🎯 **HOOKS**
  const productAvailability = useProductStore((state) => state.productAvailability);
  const checkSingleProductAvailability = useProductStore(
    (state) => state.checkSingleProductAvailability
  );
  const { mostrarNotificacion } = useNotificacion();
  const {
    isOpen: modalAjusteOpen,
    ajusteInfo,
    mostrarModalAjuste,
    cerrarModal,
  } = useAutoAjusteModal();

  // 🔄 **FUNCIÓN DE REVERSIÓN INTELIGENTE**
  const revertLastAction = useCallback(
    (action: {
      type: 'add_product' | 'add_promocion' | 'decrease_product' | 'decrease_promocion' | null;
      productId?: number;
      promocionId?: number;
      cantidad?: number;
    }) => {
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

      // 🎯 **FILTRAR PRODUCTOS INDIVIDUALES DEL CARRITO**
      const productosManufacturados = state.carrito.filter(
        (item) => isArticuloManufacturado(item) && item.id
      );
      const productosInsumos = state.carrito.filter((item) => isArticuloInsumo(item) && item.id);
      const todosLosProductos = [...productosManufacturados, ...productosInsumos];

      // 🎯 **PRODUCTOS DE PROMOCIONES CON SIMULACIÓN +1**
      const productosDePromociones: Array<{ articuloId: number; cantidad: number }> = [];
      state.promocionesEnCarrito.forEach((promocionEnCarrito) => {
        // 🔮 **SIMULACIÓN: Agregar +1 promoción más para validar si se puede aumentar**
        const cantidadSimulada = promocionEnCarrito.cantidad + 1;

        const articulosDePromocion = getArticulosFromPromocion(
          promocionEnCarrito.promocion,
          cantidadSimulada // Usar cantidad simulada con +1
        );
        productosDePromociones.push(...articulosDePromocion);

        console.log(
          `🔮 SIMULANDO PROMOCIÓN ${promocionEnCarrito.promocion.denominacion}: ${promocionEnCarrito.cantidad} → ${cantidadSimulada}`
        );
      });

      // 🎯 **PRODUCTOS INDIVIDUALES CON SIMULACIÓN +1**
      const productosIndividualesSimulados = todosLosProductos.map((item: any) => {
        // 🔮 **SIMULACIÓN: Agregar +1 producto más para validar si se puede aumentar**
        const cantidadSimulada = item.cantidad + 1;

        console.log(
          `🔮 SIMULANDO PRODUCTO ${item.denominacion}: ${item.cantidad} → ${cantidadSimulada}`
        );

        return {
          articuloId: item.id!,
          cantidad: cantidadSimulada, // Usar cantidad simulada con +1
        };
      });

      // Combinar todos los productos para análisis PREDICTIVO
      const todosLosArticulosParaAnalizar = [
        ...productosIndividualesSimulados,
        ...productosDePromociones,
      ];

      if (todosLosArticulosParaAnalizar.length === 0) {
        lastAnalysisResult.current = null;
        return null;
      }

      console.log('📡 Analizando producción...');
      console.log(
        '📤 ENVIANDO AL BACKEND:',
        JSON.stringify(todosLosArticulosParaAnalizar, null, 2)
      );
      const resultado = await analizarProduccion(todosLosArticulosParaAnalizar);
      console.log('📥 RESPUESTA DEL BACKEND:', JSON.stringify(resultado, null, 2));
      lastAnalysisResult.current = resultado;

      // Actualizar limitaciones de producción
      const nuevasLimitaciones: Record<string, number> = {};

      if (resultado.productosConProblemas && resultado.productosConProblemas.length > 0) {
        console.log('❌ Productos con limitaciones:', resultado.productosConProblemas.length);
        resultado.productosConProblemas.forEach((problema: any) => {
          const articuloId = problema.articuloId?.toString() || problema.id?.toString();
          if (articuloId && problema.cantidadMaximaPosible !== undefined) {
            nuevasLimitaciones[articuloId] = problema.cantidadMaximaPosible;
            console.log(`🚫 ${articuloId}: máximo ${problema.cantidadMaximaPosible}`);
          }
        });
      } else {
        console.log('✅ Sin limitaciones de producción');
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

      // 🚀 **AUTO-AJUSTE DE CANTIDADES CUANDO HAY LIMITACIONES**
      if (!resultado.sePuedeProducirCompleto && resultado.productosConProblemas?.length > 0) {
        console.log('🔧 AUTO-AJUSTE: Ajustando cantidades automáticamente...');

        const ajustesProductos: Array<{
          nombre: string;
          cantidadAnterior: number;
          cantidadNueva: number;
        }> = [];
        const ajustesPromociones: Array<{
          nombre: string;
          cantidadAnterior: number;
          cantidadNueva: number;
        }> = [];

        // Ajustar productos individuales
        resultado.productosConProblemas.forEach((problema: any) => {
          const articuloId = problema.articuloId;
          const cantidadMaxima = problema.cantidadMaximaPosible;

          if (articuloId && cantidadMaxima !== undefined) {
            // Buscar si el producto está en el carrito individual
            const productoEnCarrito = state.carrito.find((item) => item.id === articuloId);

            if (productoEnCarrito && productoEnCarrito.cantidad > cantidadMaxima) {
              console.log(
                `🔧 AJUSTANDO PRODUCTO ${productoEnCarrito.denominacion}: ${productoEnCarrito.cantidad} → ${cantidadMaxima}`
              );

              // Guardar información del ajuste
              ajustesProductos.push({
                nombre: productoEnCarrito.denominacion,
                cantidadAnterior: productoEnCarrito.cantidad,
                cantidadNueva: cantidadMaxima,
              });

              dispatch({
                type: 'ADJUST_QUANTITIES',
                payload: {
                  limitaciones: { [articuloId.toString()]: cantidadMaxima },
                },
              });
            }
          }
        });

        // Ajustar promociones problemáticas
        promocionesConProblemas.forEach((promocionId) => {
          const promocionEnCarrito = state.promocionesEnCarrito.find(
            (item) => item.promocion.id === promocionId
          );

          if (promocionEnCarrito && promocionEnCarrito.cantidad > 1) {
            console.log(
              `🔧 AJUSTANDO PROMOCIÓN ${promocionEnCarrito.promocion.denominacion}: ${promocionEnCarrito.cantidad} → 1`
            );

            // Guardar información del ajuste
            ajustesPromociones.push({
              nombre: promocionEnCarrito.promocion.denominacion,
              cantidadAnterior: promocionEnCarrito.cantidad,
              cantidadNueva: 1,
            });

            // Reducir a 1 promoción cuando hay problemas
            dispatch({
              type: 'ADJUST_PROMOCION_QUANTITIES',
              payload: {
                promocionId: promocionId,
                nuevaCantidad: 1,
              },
            });
          }
        });

        // 🎯 **MOSTRAR MODAL DE AUTO-AJUSTE SI HAY AJUSTES**
        if (ajustesProductos.length > 0 || ajustesPromociones.length > 0) {
          // Usar setTimeout para mostrar el modal después de que se actualice el estado
          setTimeout(() => {
            mostrarModalAjuste({
              productos: ajustesProductos,
              promociones: ajustesPromociones,
            });
          }, 100);
        }
      }

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

        // Encontrar el producto en el carrito
        const productoEnCarrito = state.carrito.find((item) => item.id === articuloId);
        if (!productoEnCarrito) {
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

        const resultado = await analizarProduccion(todosLosArticulosParaAnalizar);

        // Si el análisis falla con cantidad+1, ajustar automáticamente
        if (!resultado.sePuedeProducirCompleto) {
          if (resultado.productosConProblemas?.length > 0) {
            const problemaDelProducto = resultado.productosConProblemas.find(
              (problema: any) => problema.articuloId === articuloId
            );

            if (problemaDelProducto?.cantidadMaximaPosible !== undefined) {
              const cantidadMaxima = problemaDelProducto.cantidadMaximaPosible;

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

  // 🎁 **FUNCIÓN DE ANÁLISIS PREDICTIVO PARA PROMOCIONES (OPTIMIZADA)**
  const analyzeCanIncreasePromocion = useCallback(
    async (promocionId: number, promocionCompleta?: Promocion): Promise<boolean> => {
      try {
        console.log(`🔮 ANÁLISIS PREDICTIVO PROMOCIÓN: Evaluando promoción ${promocionId}`);

        // ⚠️ **OPTIMIZACIÓN CRÍTICA: Verificar si vale la pena hacer análisis**
        const carritoTieneContenido =
          state.carrito.length > 0 || state.promocionesEnCarrito.length > 0;

        // Encontrar la promoción en el carrito (si ya existe)
        const promocionEnCarrito = state.promocionesEnCarrito.find(
          (item) => item.promocion.id === promocionId
        );

        // Si el carrito está vacío y es una promoción nueva, permitir por defecto
        if (!carritoTieneContenido && !promocionEnCarrito) {
          console.log(`🔮 CARRITO VACÍO: Promoción ${promocionId} permitida por defecto`);
          return true;
        }

        // 🎯 **NUEVA LÓGICA: Solo usar análisis predictivo si no hay limitaciones previas**
        if (promocionesProblematicas.has(promocionId)) {
          console.log(`� PROMOCIÓN YA MARCADA COMO PROBLEMÁTICA: ${promocionId}`);
          return false;
        }

        // Si ya está en el carrito, usar validación local rápida
        if (promocionEnCarrito) {
          const puedeAgregar = canIncreasePromocion(promocionId);
          console.log(`🔮 VALIDACIÓN LOCAL RÁPIDA - Promoción ${promocionId}: ${puedeAgregar}`);
          return puedeAgregar;
        }

        // 🚨 **SOLO PARA PROMOCIONES NUEVAS: Hacer análisis completo**
        if (!promocionCompleta) {
          console.log(`🔮 SIN PROMOCIÓN COMPLETA: Asumiendo válida por defecto`);
          return true;
        }

        // Simular agregar la promoción nueva
        const productosDePromociones: Array<{ articuloId: number; cantidad: number }> = [];

        // Productos de promociones existentes
        state.promocionesEnCarrito.forEach((promocionEnCarrito) => {
          const articulosDePromocion = getArticulosFromPromocion(
            promocionEnCarrito.promocion,
            promocionEnCarrito.cantidad
          );
          productosDePromociones.push(...articulosDePromocion);
        });

        // Productos de la nueva promoción
        const articulosNuevaPromocion = getArticulosFromPromocion(promocionCompleta, 1);
        productosDePromociones.push(...articulosNuevaPromocion);

        // Combinar con productos individuales del carrito
        const productosIndividuales = state.carrito.map((item) => ({
          articuloId: item.id!,
          cantidad: item.cantidad,
        }));

        const todosLosArticulosSimulados = [...productosIndividuales, ...productosDePromociones];

        if (todosLosArticulosSimulados.length === 0) {
          return true;
        }

        console.log(
          '📤 ANÁLISIS PREDICTIVO PROMOCIÓN - ENVIANDO AL BACKEND:',
          JSON.stringify(todosLosArticulosSimulados, null, 2)
        );

        // Analizar con el backend
        const resultado = await analizarProduccion(todosLosArticulosSimulados);
        console.log(
          '📥 RESPUESTA ANÁLISIS PREDICTIVO PROMOCIÓN:',
          JSON.stringify(resultado, null, 2)
        );

        const sePuede =
          resultado.sePuedeProducirCompleto &&
          (!resultado.productosConProblemas || resultado.productosConProblemas.length === 0);

        console.log(`🔮 ANÁLISIS PREDICTIVO PROMOCIÓN: ¿Se puede agregar? ${sePuede}`);

        // Si no se puede, marcar como problemática para evitar futuros análisis
        if (!sePuede) {
          setPromocionesProblematicas((prev) => new Set([...prev, promocionId]));
          console.log(`🔮 PROMOCIÓN ${promocionId} MARCADA COMO PROBLEMÁTICA`);
        }

        return sePuede;
      } catch (error) {
        console.error('❌ Error en análisis predictivo de promoción:', error);
        return false;
      }
    },
    [state.carrito, state.promocionesEnCarrito, promocionesProblematicas]
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

  // 🔍 **EFECTO DE ANÁLISIS AUTOMÁTICO OPTIMIZADO**
  useEffect(() => {
    const performAutomaticAnalysis = async () => {
      // ⚠️ **SOLO ANALIZAR CUANDO HAY CAMBIOS REALES EN EL CARRITO**
      if (state.carrito.length === 0 && state.promocionesEnCarrito.length === 0) {
        console.log('🔍 CARRITO VACÍO: Limpiando estados...');
        setLimitacionesProduccion({});
        setPromocionesProblematicas(new Set());
        return;
      }

      // 🚫 **PREVENIR BUCLES: No analizar si ya está analizando**
      if (isAnalyzing || analysisInProgress.current) {
        return;
      }

      try {
        console.log('🔍 ANÁLISIS AUTOMÁTICO: Solo cuando hay items reales en carrito');
        console.log(
          `📋 Estado: ${state.carrito.length} productos, ${state.promocionesEnCarrito.length} promociones`
        );

        // 🎯 **SOLO EJECUTAR ANÁLISIS CORE UNA VEZ**
        await analyzeCarritoCore();

        console.log('✅ ANÁLISIS AUTOMÁTICO: Completado');
      } catch (error) {
        console.error('❌ Error en análisis automático:', error);
      }
    };

    // Ejecutar con delay para batch de cambios
    const timeoutId = setTimeout(performAutomaticAnalysis, 500);

    return () => clearTimeout(timeoutId);
  }, [state.carrito, state.promocionesEnCarrito]);

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
      if (isAnalyzing) {
        console.log('❌ CONTEXT - Bloqueado por isAnalyzing');
        return false;
      }

      // Verificar si está en promociones problemáticas
      if (promocionesProblematicas.has(promocionId)) {
        console.log('❌ CONTEXT - Bloqueado por promocionesProblematicas');
        return false;
      }

      // Buscar la promoción en el carrito
      const promocionEnCarrito = state.promocionesEnCarrito.find(
        (item) => item.promocion.id === promocionId
      );

      if (!promocionEnCarrito) {
        return true;
      }

      // Verificar limitaciones por artículo
      for (const detalle of promocionEnCarrito.promocion.promocionDetalles) {
        const articuloId = detalle.articulo.id;
        const articuloIdStr = articuloId.toString();
        const limitacionMaxima = limitacionesProduccion[articuloIdStr];

        if (limitacionMaxima !== undefined) {
          const cantidadActualTotal = promocionEnCarrito.cantidad * detalle.cantidadRequerida;
          const cantidadDespuesDeAgregar = cantidadActualTotal + detalle.cantidadRequerida;

          if (cantidadDespuesDeAgregar > limitacionMaxima) {
            console.log(
              `❌ Promoción bloqueada: ${detalle.articulo.denominacion} excedería límite`
            );
            return false;
          }
        }
      }

      return true;
    },
    [isAnalyzing, promocionesProblematicas, state.promocionesEnCarrito, limitacionesProduccion]
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
      // 🎯 **ESTRATEGIA OPTIMIZADA: Usar validación local primero**

      // 1. Verificar si hay limitaciones conocidas usando validación local
      if (articulo.id) {
        const puedeAumentar = canIncreaseProduct(articulo.id);

        if (!puedeAumentar) {
          console.log(`❌ PRODUCTO BLOQUEADO POR VALIDACIÓN LOCAL: ${articulo.denominacion}`);
          mostrarNotificacion(
            `❌ ${articulo.denominacion} alcanzó el límite de stock disponible`,
            'warning',
            3000
          );
          return false;
        }
      }

      // 2. Agregar al carrito usando estrategia optimista
      console.log(`✅ AGREGANDO PRODUCTO: ${articulo.denominacion}`);
      dispatch({ type: 'ADD_TO_CARRITO', payload: { articulo, cantidad } });

      // 3. Solo para productos nuevos, verificar disponibilidad en ProductProvider
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
    [canIncreaseProduct, state.carrito, checkSingleProductAvailability, mostrarNotificacion]
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
      const canIncrease = canIncreasePromocion(promocion.id);

      if (!canIncrease) {
        console.log(`❌ Promoción "${promocion.denominacion}" bloqueada por limitaciones`);
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

      // 3. Programar análisis con debounce
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
    analyzeCanIncreasePromocion,

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

  return (
    <CarritoContext.Provider value={contextValue}>
      {children}
      {/* Modal de Auto-Ajuste */}
      <ModalAutoAjuste isOpen={modalAjusteOpen} onClose={cerrarModal} ajusteInfo={ajusteInfo} />
    </CarritoContext.Provider>
  );
};
