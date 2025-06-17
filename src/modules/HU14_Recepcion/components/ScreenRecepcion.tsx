import React, { useState } from 'react';
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Pendientes</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {pedidosFiltrados.filter((p) => p.estado.nombre === 'PENDIENTE').length}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">En Preparación</h3>
          <p className="text-2xl font-bold text-blue-900">
            {pedidosFiltrados.filter((p) => p.estado.nombre === 'EN_PREPARACION').length}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">Demorados</h3>
          <p className="text-2xl font-bold text-red-900">
            {pedidosFiltrados.filter((p) => p.estado.nombre === 'DEMORADO').length}
          </p>
        </div>
        <div className="bg-violet-100 p-4 rounded-lg">
          <h3 className="font-semibold text-violet-800">En Delivery</h3>
          <p className="text-2xl font-bold text-violet-900">
            {pedidosFiltrados.filter((p) => p.estado.nombre === 'EN_DELIVERY').length}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800">Total</h3>
          <p className="text-2xl font-bold text-gray-900">{pedidosFiltrados.length}</p>
        </div>
      </div>{' '}
      {/* Tabla */}
      <TablaRecepcion
        pedidos={pedidosFiltrados}
        onVerDetalle={abrirDetalle}
        onCambiarEstado={manejarCambioEstado}
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
