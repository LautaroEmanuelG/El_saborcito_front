// 📄 **EXPORTACIONES DEL MÓDULO HU14 RECEPCIÓN**

// Componentes principales
export { ModalDetallePedido } from './components/ModalDetallePedido';
export { GestionFacturaRecepcion } from './components/GestionFacturaRecepcion';
export { Recepcion } from './components/Recepcion';
export { ScreenRecepcion } from './components/ScreenRecepcion';
export { TablaRecepcion } from './components/TablaRecepcion';
export { FiltrosFecha } from './components/FiltrosFecha';
export { FiltrosRecepcion } from './components/FiltrosRecepcion';

// Lógica y hooks
export { useRecepcionLogic } from './Logic';

// Servicios
export {
  obtenerTodosPedidos,
  obtenerEstados,
  cambiarEstadoPedido,
  obtenerPedidoPorId,
  filtrarPedidosPorEstado,
  buscarPedidosPorId,
  validarTransicionEstado,
} from './service/recepcionService';

// Tipos (reexportar desde types)
export type { PedidoCompletoConDetalles, Estado, PedidoCompleto } from '../../types/Pedido';
