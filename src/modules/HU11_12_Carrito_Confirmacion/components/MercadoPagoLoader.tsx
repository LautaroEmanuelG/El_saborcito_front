import React from 'react';

interface MercadoPagoLoaderProps {
  isVisible: boolean;
  mensaje?: string;
}

const MercadoPagoLoader: React.FC<MercadoPagoLoaderProps> = ({
  isVisible,
  mensaje = 'Preparando tu pago con Mercado Pago...',
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        {/* Logo de Mercado Pago */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">MP</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Mercado Pago</h2>
        </div>

        {/* Spinner de carga */}
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>

        {/* Mensaje */}
        <p className="text-gray-600 mb-4">{mensaje}</p>

        {/* Información adicional */}
        <div className="text-sm text-gray-500">
          <p>• Serás redirigido a Mercado Pago</p>
          <p>• Completa tu pago de forma segura</p>
          <p>• Regresarás automáticamente</p>
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoLoader;
