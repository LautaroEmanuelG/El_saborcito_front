import React, { useState } from 'react';
import { useRecepcionLogic } from '../Logic';
import { PedidoCompletoConDetalles } from '../../../types/Pedido';
import { FiltrosRecepcion } from './FiltrosRecepcion';
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
    setFiltroEstado,
    setBuscarId,
    cambiarEstadoPedido,
    cargarDatos,
    limpiarFiltros,
    puedeAvanzarEstado,
    obtenerProximoEstado,
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Recepción de Pedidos</h1>
        <p className="text-gray-600">Gestiona y controla el estado de todos los pedidos</p>
      </div>
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
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Listos</h3>
          <p className="text-2xl font-bold text-green-900">
            {pedidosFiltrados.filter((p) => p.estado.nombre === 'LISTO').length}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Con Promociones</h3>
          <p className="text-2xl font-bold text-purple-900">
            {
              pedidosFiltrados.filter(
                (p) =>
                  p.detallesCompletos?.some((detalle) => detalle.origen === 'PROMOCION') ||
                  p.detalles?.some((detalle) => detalle.origen === 'PROMOCION')
              ).length
            }
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800">Total</h3>
          <p className="text-2xl font-bold text-gray-900">{pedidosFiltrados.length}</p>
        </div>
      </div>
      {/* Tabla */}
      <TablaRecepcion
        pedidos={pedidosFiltrados}
        onVerDetalle={abrirDetalle}
        onCambiarEstado={manejarCambioEstado}
        puedeAvanzarEstado={puedeAvanzarEstado}
        obtenerProximoEstado={obtenerProximoEstado}
      />
      {/* Modal de detalle */}
      {modalDetalle && pedidoSeleccionado && (
        <ModalDetallePedido
          pedido={pedidoSeleccionado}
          isOpen={modalDetalle}
          onClose={cerrarDetalle}
          onCambiarEstado={manejarCambioEstado}
          puedeAvanzarEstado={puedeAvanzarEstado}
          obtenerProximoEstado={obtenerProximoEstado}
        />
      )}
    </div>
  );
};
