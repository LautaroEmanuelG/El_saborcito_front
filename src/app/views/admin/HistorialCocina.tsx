import IconoVer from '../../../assets/svgs/icons/IconoVer';
import IconoFileTypePdf from '../../../assets/svgs/icons/IconoFileTypePdf';
import { useHistorialCocina, useDetalleCompleto } from '../../../shared/hooks/useHistorialCocina';
import { ModalReceta } from '../../../modules/HU17_Cocina/Components/ModalReceta';
import { historialCocinaService } from '../../../shared/services/historialCocinaService';
import { PedidoDTO } from '../../../modules/HU17_Cocina/Model';
import ModalSiNo from '../../../shared/components/abmGenerica/components/modals/ModalSiNo';
import { useState } from 'react';

export const HistorialCocina: React.FC = () => {
  const { pedidos, loading, error, refetch } = useHistorialCocina();
  const { detalle, loading: detalleLoading, obtenerDetalle, cerrarDetalle } = useDetalleCompleto();

  // Estados para modal de notificación
  const [modalNotificacion, setModalNotificacion] = useState({
    open: false,
    title: '',
    description: '',
  });

  // Función para mostrar notificaciones
  const mostrarNotificacion = (title: string, description: string) => {
    setModalNotificacion({
      open: true,
      title,
      description,
    });
  };

  const handleVerDetalle = (id: number) => {
    obtenerDetalle(id);
  };

  const handleDescargarPDF = async (id: number) => {
    try {
      await historialCocinaService.descargarPDF(id);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      mostrarNotificacion('Error de descarga', 'Error al descargar el PDF');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calcularTotalItems = (pedido: PedidoDTO) => {
    return pedido.detalles.reduce((total: number, item: any) => total + item.cantidad, 0);
  };

  if (loading) {
    return (
      <div className="bg-gray-100 w-full min-h-full p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-lg">Cargando pedidos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 w-full min-h-full p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium mb-4">Error al cargar pedidos</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 w-full min-h-full p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header con título */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Historial de Pedidos</h1>

          {/* Botón refrescar */}
          <button
            onClick={refetch}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Actualizar
          </button>
        </div>

        {/* Lista de pedidos */}
        {pedidos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay pedidos finalizados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                {/* Información del pedido */}
                <div className="flex items-center gap-8">
                  <span className="font-semibold text-gray-800">
                    Pedido #{String(pedido.id).padStart(3, '0')}
                  </span>

                  <span className="text-red-500 font-medium">
                    {calcularTotalItems(pedido)} items
                  </span>

                  <span className="text-gray-600">
                    Cliente: {pedido.cliente.nombre} {pedido.cliente.apellido}
                  </span>

                  <span className="text-gray-500 text-sm">
                    {formatearFecha(pedido.fechaPedido)}
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pedido.estado.nombre === 'LISTO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {pedido.estado.nombre}
                  </span>
                </div>

                {/* Iconos de acciones */}
                <div className="flex items-center gap-3">
                  {/* Icono PDF */}
                  <button
                    onClick={() => handleDescargarPDF(pedido.id)}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Descargar PDF"
                  >
                    <IconoFileTypePdf width={20} height={20} className="text-red-500" />
                  </button>

                  {/* Icono Ver */}
                  <button
                    onClick={() => handleVerDetalle(pedido.id)}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Ver detalles"
                  >
                    <IconoVer width={20} height={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de receta */}
      {detalle && (
        <ModalReceta detalle={detalle} onClose={cerrarDetalle} loading={detalleLoading} />
      )}

      {/* Modal de notificación */}
      <ModalSiNo
        open={modalNotificacion.open}
        onClose={() => setModalNotificacion((prev) => ({ ...prev, open: false }))}
        onConfirm={() => setModalNotificacion((prev) => ({ ...prev, open: false }))}
        title={modalNotificacion.title}
        description={modalNotificacion.description}
        confirmText="Aceptar"
        cancelText=""
      />
    </div>
  );
};
