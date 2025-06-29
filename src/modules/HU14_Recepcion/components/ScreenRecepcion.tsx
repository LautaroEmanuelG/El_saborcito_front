import { useState } from 'react';
import { useRecepcionLogic } from '../Logic';
import { PedidoCompletoConDetalles } from '../../../types/Pedido';
import { FiltrosRecepcion } from './FiltrosRecepcion';
import { FiltrosFecha } from './FiltrosFecha';
import { TablaRecepcion } from './TablaRecepcion';
import { ModalDetallePedido } from './ModalDetallePedido';

export const ScreenRecepcion: React.FC = () => {
  const {
    pedidosFiltrados,
    estados,
    loading,
    error,
    filtroEstado,
    buscarId,
    fechaDesde,
    fechaHasta,
    setFiltroEstado,
    setBuscarId,
    setFechaDesde,
    setFechaHasta,
    cambiarEstadoPedido,
    avanzarEstadoPedido,
    cargarDatos,
    limpiarFiltros,
    puedeAvanzarEstado,
    obtenerProximoEstado,
    cancelarPedido,
  } = useRecepcionLogic();
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoCompletoConDetalles | null>(
    null
  );
  const [modalDetalle, setModalDetalle] = useState(false);

  const abrirDetalle = (pedido: PedidoCompletoConDetalles) => {
    setPedidoSeleccionado(pedido);
    setModalDetalle(true);
  };

  const cerrarDetalle = () => {
    setPedidoSeleccionado(null);
    setModalDetalle(false);
  };
  const manejarCambioEstado = async (pedidoId: number, nuevoEstado: string) => {
    await cambiarEstadoPedido(pedidoId, nuevoEstado);
  };

  const manejarAvanzarEstado = async (pedidoId: number) => {
    const exito = await avanzarEstadoPedido(pedidoId);
    if (exito) {
      // Recargar datos para mostrar el estado actualizado
      cargarDatos();
    }
  };

  const manejarCancelarPedido = async (pedidoId: number) => {
    if (confirm(`¿Está seguro que desea cancelar el pedido #${pedidoId}?`)) {
      const exito = await cancelarPedido(pedidoId);
      if (exito) {
        // Recargar datos para mostrar el estado actualizado
        cargarDatos();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
        <button
          onClick={cargarDatos}
          className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Recepción de Pedidos</h1>
        <p className="text-gray-600">Gestiona y controla el estado de todos los pedidos</p>
      </div>
      {/* Filtros de Fecha */}
      <FiltrosFecha
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onFechaDesdeChange={setFechaDesde}
        onFechaHastaChange={setFechaHasta}
      />
      {/* Filtros */}
      <FiltrosRecepcion
        estados={estados}
        filtroEstado={filtroEstado}
        buscarId={buscarId}
        onFiltroEstadoChange={setFiltroEstado}
        onBuscarIdChange={setBuscarId}
        onLimpiarFiltros={limpiarFiltros}
      />{' '}
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">
            {pedidosFiltrados.filter((p) => p.estado.nombre === 'PENDIENTE').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            {pedidosFiltrados.filter((p) => p.estado.nombre === 'EN_PREPARACION').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">En Preparación</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-lg sm:text-2xl font-bold text-red-600">
            {pedidosFiltrados.filter((p) => p.estado.nombre === 'DEMORADO').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Demorados</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">
            {pedidosFiltrados.filter((p) => p.estado.nombre === 'EN_DELIVERY').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">En Delivery</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-gray-500">
          <div className="text-lg sm:text-2xl font-bold text-gray-600">
            {pedidosFiltrados.length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total</div>
        </div>
      </div>{' '}
      {/* Tabla */}
      <TablaRecepcion
        pedidos={pedidosFiltrados}
        onVerDetalle={abrirDetalle}
        onAvanzarEstado={manejarAvanzarEstado}
        puedeAvanzarEstado={puedeAvanzarEstado}
        obtenerProximoEstado={obtenerProximoEstado}
        onCancelarPedido={manejarCancelarPedido}
      />
      {/* Modal de detalle */}
      {modalDetalle && pedidoSeleccionado && (
        <ModalDetallePedido
          pedido={pedidoSeleccionado}
          isOpen={modalDetalle}
          onClose={cerrarDetalle}
          onCambiarEstado={manejarCambioEstado}
          onAvanzarEstado={manejarAvanzarEstado}
          onCancelarPedido={manejarCancelarPedido}
          puedeAvanzarEstado={puedeAvanzarEstado}
          obtenerProximoEstado={obtenerProximoEstado}
        />
      )}
    </div>
  );
};
