// 🍳 Exportaciones principales del módulo HU17_Cocina

// Componentes principales
export { KanbanBoard } from './Components/KanbanBoard';
export { TaskCard } from './Components/TaskCard';
export { Column } from './Components/Column';
export { ModalAgregarTiempo } from './Components/ModalAgregarTiempo';
export { ColumnVisibilityControls } from './Components/ColumnVisibilityControls';

// Modelos y tipos
export type {
  Pedido,
  Estado,
  DetallePedido,
  EstadoId,
  EstadoNombre,
  PedidoDTO,
  IngredienteDTO,
  DetalleConRecetaDTO,
  PedidoConRecetasDTO,
} from './Model';

export {
  ESTADO_IDS,
  ESTADOS,
  TRANSICIONES_VALIDAS,
  esTransicionValida,
  getNombreEstado,
  getIdEstado,
} from './Model';

// Servicios
export {
  fetchPedidosActivos,
  avanzarEstadoPedido,
  updatePedidoEstado,
  añadirTiempoAPedido,
  getPedidoById,
} from './service/cocinaService';

// Lógica auxiliar
export {
  retry,
  validarDragDrop,
  debeUsarAvanzar,
  getAccionesDisponibles,
  getAnimacionParaTransicion,
  getMensajeAccion,
  calcularTiempoTranscurrido,
  debeSalirDelKanban,
} from './Logic';

// Utilidades de tiempo
export {
  formatearTiempoEstimado,
  calcularTiempoRestante,
  getEstadoTiempo,
  agregarMinutos,
  validarTiempo,
} from './utils/tiempoUtils';

// Hooks
export { useColumnVisibility } from './hooks/useColumnVisibility';
