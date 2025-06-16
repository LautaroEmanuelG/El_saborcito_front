import React from 'react';
import { PedidoConRecetasDTO } from '../Model';
import { historialCocinaService } from '../../../shared/services/historialCocinaService';
import IconoFileTypePdf from '../../../assets/svgs/icons/IconoFileTypePdf';

interface ModalRecetaProps {
  detalle: PedidoConRecetasDTO;
  onClose: () => void;
  loading: boolean;
}

export const ModalReceta: React.FC<ModalRecetaProps> = ({ detalle, onClose, loading }) => {
  const handleDescargarPDF = async () => {
    try {
      await historialCocinaService.descargarPDF(detalle.id);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  const calcularTotalItems = () => {
    return detalle.detalles.reduce((total, item) => total + item.cantidad, 0);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Pedido #{String(detalle.id).padStart(3, '0')}
              </h2>
              <p className="text-sm text-gray-600">
                Cliente: {detalle.cliente} | Fecha: {detalle.fecha}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Botón Descargar PDF */}
              <button
                onClick={handleDescargarPDF}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <IconoFileTypePdf width={18} height={18} />
                Descargar PDF
              </button>

              {/* Botón Cerrar */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-700">
              Total de productos: <span className="text-red-500">{calcularTotalItems()} items</span>
            </p>
          </div>

          {/* Lista de productos */}
          <div className="space-y-6">
            {detalle.detalles.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{item.articuloNombre}</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Cantidad: {item.cantidad}
                  </span>
                </div>

                {/* Mostrar receta solo si es manufacturado */}
                {item.esManufacturado && item.receta.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">🧑‍🍳 Receta:</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <ul className="space-y-1">
                        {item.receta.map((ingrediente, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex justify-between">
                            <span>• {ingrediente.nombre}</span>
                            <span className="font-medium">
                              {ingrediente.cantidad} {ingrediente.unidadMedida}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Mensaje para productos no manufacturados */}
                {!item.esManufacturado && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      Este es un producto simple (no manufacturado)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
