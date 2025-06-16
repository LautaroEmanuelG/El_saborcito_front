// Componente especializado para integración fácil
export {
  default as FacturaIntegracion,
  useFacturaIntegracion,
} from './Components/FacturaIntegracion.tsx';
export type { FacturaIntegracionProps } from './Components/FacturaIntegracion.tsx';

// NUEVO: Componente para administración de facturas
export { default as FacturaAdmin } from './Components/FacturaAdmin.tsx';

// Tipos y modelos
export type {
  FacturaDTO,
  FacturaCreateDTO,
  FacturaResponse,
  FacturaRequest,
  FacturaError,
  PedidoFacturacion,
  FormaPago,
} from './model';

export { FacturaStatus as FacturaStatusEnum } from './model';

// Lógica de negocio
export {
  // NUEVO FLUJO
  consultarFacturaPorPedido,
  descargarFacturaPDF,
  reenviarFacturaPorEmail,
  useFacturaOperaciones,

  // FUNCIONES DE UTILIDAD
  validarDatosFactura,
  puedeFacturarse,
  formatearMensajeError,

  // DEPRECADO (mantener por compatibilidad)
  generarFactura,
  useFacturacion,
} from './logic';

/*
 * NUEVO FLUJO DE FACTURACIÓN:
 *
 * La factura se genera automáticamente al crear el pedido.
 * Este módulo proporciona funciones para:
 * 1. Consultar la factura de un pedido
 * 2. Descargar el PDF de la factura
 * 3. Reenviar la factura por email
 *
 * Ejemplo de uso básico:
 *
 * import { useFacturaOperaciones } from '@/modules/HU18_Generacion_De_Factura';
 *
 * const MiComponente = () => {
 *   const { consultarFactura, descargarPDF, reenviarEmail, loading, error } = useFacturaOperaciones();
 *
 *   const handleConsultarFactura = async (pedidoId: number) => {
 *     const factura = await consultarFactura(pedidoId);
 *     if (factura) {
 *       console.log('Factura:', factura);
 *     }
 *   };
 *
 *   const handleDescargarPDF = async (facturaId: number) => {
 *     const success = await descargarPDF(facturaId);
 *     if (success) {
 *       console.log('PDF descargado exitosamente');
 *     }
 *   };
 *
 *   const handleReenviarEmail = async (facturaId: number) => {
 *     const success = await reenviarEmail(facturaId);
 *     if (success) {
 *       console.log('Email reenviado exitosamente');
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {loading && <p>Cargando...</p>}
 *       {error && <p>Error: {error}</p>}
 *       <button onClick={() => handleConsultarFactura(123)}>Consultar Factura</button>
 *       <button onClick={() => handleDescargarPDF(456)}>Descargar PDF</button>
 *       <button onClick={() => handleReenviarEmail(456)}>Reenviar Email</button>
 *     </div>
 *   );
 * };
 *
 * Para integración con carrito, usa: import { FacturaIntegracion } from '@/modules/HU18_Generacion_De_Factura';
 */
