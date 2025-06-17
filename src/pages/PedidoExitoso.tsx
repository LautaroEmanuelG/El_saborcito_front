import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PedidoExitoso: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Opcional: redirigir automáticamente después de algunos segundos
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [navigate]);

  const irAlInicio = () => {
    navigate('/');
  };

  const irAMisPedidos = () => {
    // Aquí puedes implementar la navegación a la página de pedidos del usuario
    console.log('Navegando a mis pedidos...');
    alert('La página de pedidos aún no está implementada');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
        {/* Icono de éxito */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Pago Exitoso! 🎉</h1>
          <p className="text-gray-600 text-lg">Tu pedido ha sido confirmado</p>
        </div>

        {/* Información del pedido */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">Estado del pedido</h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">Confirmado</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Recibirás una notificación cuando tu pedido esté listo
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={irAMisPedidos}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200"
          >
            Ver mis pedidos
          </button>
          <button
            onClick={irAlInicio}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
          >
            Volver al inicio
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-sm text-gray-500">
          <p>Gracias por elegir El Saborcito</p>
          <p className="mt-1">Esta página se cerrará automáticamente en 10 segundos</p>
        </div>
      </div>
    </div>
  );
};

export default PedidoExitoso;
