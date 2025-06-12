// Componente especializado para integración fácil
export {
  default as FacturaIntegracion,
  useFacturaIntegracion,
} from './Components/FacturaIntegracion.tsx';
export type { FacturaIntegracionProps } from './Components/FacturaIntegracion.tsx';

// Tipos y modelos
export type {
  FacturaDTO,
  FacturaResponse,
  FacturaRequest,
  FacturaError,
  PedidoFacturacion,
  FormaPago,
} from './model';

export { FacturaStatus as FacturaStatusEnum } from './model';

// Lógica de negocio
export {
  generarFactura,
  validarDatosFactura,
  puedeFacturarse,
  formatearMensajeError,
  useFacturacion,
} from './logic';

/*
 * Ejemplo de uso:
 *
 * import { FacturaHandler, useFacturacion, PedidoFacturacion } from '@/modules/HU18_Generacion_De_Factura';
 *
 * const MiComponente = () => {
 *   const pedido: PedidoFacturacion = {
 *     id: 123,
 *     clienteId: 456,
 *     clienteEmail: 'cliente@email.com',
 *     clienteNombre: 'Juan Pérez',
 *     totalVenta: 2500.00,
 *     estado: 'PAGADO'
 *   };
 *
 *   return (
 *     <FacturaHandler
 *       pedido={pedido}
 *       formaPagoId={2}
 *       onFacturaGenerada={(numeroFactura) => {
 *         console.log('Factura generada:', numeroFactura);
 *       }}
 *       onError={(error) => {
 *         console.error('Error:', error);
 *       }}
 *     />
 *   );
 * };
 *
 * Para testing, usa: import { DemoPage } from '@/modules/HU18_Generacion_De_Factura';
 */
