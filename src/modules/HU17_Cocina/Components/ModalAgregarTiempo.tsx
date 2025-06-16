import React, { useState } from 'react';
import { formatearTiempoEstimado } from '../utils/tiempoUtils';

interface ModalAgregarTiempoProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: number;
  tiempoActual: string;
  onConfirm: (pedidoId: number, minutosAdicionales: number) => Promise<void>;
  loading?: boolean;
}

export const ModalAgregarTiempo: React.FC<ModalAgregarTiempoProps> = ({
  isOpen,
  onClose,
  pedidoId,
  tiempoActual,
  onConfirm,
  loading = false,
}) => {
  const [minutosPersonalizados, setMinutosPersonalizados] = useState<number>(0);
  const [modoPersonalizado, setModoPersonalizado] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);

  if (!isOpen) return null;

  const OPCIONES_RAPIDAS = [15, 30, 45, 60];

  const handleConfirmarTiempoRapido = async (minutosAAgregar: number) => {
    setProcesando(true);
    try {
      await onConfirm(pedidoId, minutosAAgregar);
      onClose();
    } catch (error) {
      console.error('Error al agregar tiempo:', error);
    } finally {
      setProcesando(false);
    }
  };

  const handleConfirmarTiempoPersonalizado = async () => {
    if (!minutosPersonalizados || minutosPersonalizados <= 0) {
      return;
    }

    setProcesando(true);
    try {
      await onConfirm(pedidoId, minutosPersonalizados);
      onClose();
    } catch (error) {
      console.error('Error al establecer tiempo personalizado:', error);
    } finally {
      setProcesando(false);
    }
  };

  const handleCerrar = () => {
    if (!procesando && !loading) {
      setMinutosPersonalizados(0);
      setModoPersonalizado(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">🕒 Ajustar Tiempo</h2>
              <p className="text-orange-100 text-sm">Pedido #{pedidoId}</p>
            </div>
            <button
              onClick={handleCerrar}
              disabled={procesando || loading}
              className="text-white hover:text-orange-200 transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Tiempo actual */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Tiempo estimado actual:</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatearTiempoEstimado(tiempoActual)}
            </p>
          </div>

          {!modoPersonalizado ? (
            <>
              {/* Opciones rápidas */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Agregar tiempo rápido:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {OPCIONES_RAPIDAS.map((minutos) => (
                    <button
                      key={minutos}
                      onClick={() => handleConfirmarTiempoRapido(minutos)}
                      disabled={procesando || loading}
                      className="bg-orange-500 text-white p-3 rounded-lg font-medium hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>+{minutos} min</span>
                      {procesando && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opción personalizada */}
              <div className="border-t pt-4">
                {' '}
                <button
                  onClick={() => setModoPersonalizado(true)}
                  disabled={procesando || loading}
                  className="w-full bg-gray-500 text-white p-3 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
                >
                  🎯 Agregar cantidad específica
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Modo personalizado */}{' '}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Minutos adicionales:</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minutos a agregar:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={minutosPersonalizados || ''}
                      onChange={(e) => setMinutosPersonalizados(Number(e.target.value))}
                      placeholder="Ej: 20"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      disabled={procesando || loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Entre 1 y 480 minutos (8 horas)</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModoPersonalizado(false)}
                      disabled={procesando || loading}
                      className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200 disabled:opacity-50"
                    >
                      Volver
                    </button>
                    <button
                      onClick={handleConfirmarTiempoPersonalizado}
                      disabled={
                        procesando ||
                        loading ||
                        !minutosPersonalizados ||
                        minutosPersonalizados <= 0 ||
                        minutosPersonalizados > 480
                      }
                      className="flex-1 bg-orange-500 text-white p-3 rounded-lg font-medium hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>Confirmar</span>
                      {procesando && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer con información */}
        <div className="bg-gray-50 p-4 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            💡 El nuevo tiempo se aplicará inmediatamente y será visible para todo el equipo
          </p>
        </div>
      </div>
    </div>
  );
};
