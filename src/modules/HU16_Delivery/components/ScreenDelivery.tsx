import React, { useState } from 'react';
import { useDeliveryLogic } from '../Logic';
import { PedidoCompletoConDetalles } from '../../../types/Pedido';
import { TablaDelivery } from './TablaDelivery';
import { ModalDetalleDelivery } from './ModalDetalleDelivery';

export const ScreenDelivery: React.FC = () => {
  const { pedidosDelivery, loading, error, marcarComoEntregado, cargarPedidosDelivery } =
    useDeliveryLogic();

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

  const manejarEntrega = async (pedidoId: number) => {
    await marcarComoEntregado(pedidoId);
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
          onClick={cargarPedidosDelivery}
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Delivery</h1>
        <p className="text-gray-600">Pedidos listos para entrega a domicilio</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">En Delivery</h3>
          <p className="text-2xl font-bold text-purple-900">{pedidosDelivery.length}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Refrescar</h3>
          <button
            onClick={cargarPedidosDelivery}
            disabled={loading}
            className="mt-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <TablaDelivery
        pedidos={pedidosDelivery}
        onVerDetalle={abrirDetalle}
        onMarcarEntregado={manejarEntrega}
      />

      {/* Modal de detalle */}
      {modalDetalle && pedidoSeleccionado && (
        <ModalDetalleDelivery
          pedido={pedidoSeleccionado}
          isOpen={modalDetalle}
          onClose={cerrarDetalle}
          onMarcarEntregado={manejarEntrega}
        />
      )}
    </div>
  );
};
