import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../../shared/hooks/useCart';
import { useNotificacion } from '../../../shared/hooks/useNotificacion';

const mensajes = {
  approved: {
    titulo: '¡Pago Exitoso! 🎉',
    mensaje: 'Tu pedido ha sido confirmado',
    color: 'green',
    icono: (
      <svg
        className="w-10 h-10 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    notificacion: '¡Tu pedido fue confirmado y el pago aprobado!',
  },
  rejected: {
    titulo: 'Pago Rechazado',
    mensaje: 'El pago fue rechazado. Puedes reintentar desde Mis Pedidos.',
    color: 'red',
    icono: (
      <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    notificacion: 'El pago fue rechazado. Puedes reintentar desde Mis Pedidos.',
  },
  pending: {
    titulo: 'Pago Pendiente',
    mensaje: 'El pago está pendiente. Te avisaremos cuando se confirme.',
    color: 'yellow',
    icono: (
      <svg
        className="w-10 h-10 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    notificacion: 'El pago está pendiente. Te avisaremos cuando se confirme.',
  },
};

const PedidoExitoso: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCarrito } = useCart();
  const { mostrarNotificacion } = useNotificacion();

  // Obtener el parámetro status de la URL
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get('status') as 'approved' | 'rejected' | 'pending' | null;
  const info = status && mensajes[status] ? mensajes[status] : mensajes['approved'];

  useEffect(() => {
    // Mostrar notificación según el estado
    mostrarNotificacion(
      info.notificacion,
      status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning',
      5000
    );
    // Limpiar carrito solo si el pago fue aprobado
    if (status === 'approved') {
      clearCarrito();
    }
    // Redirigir automáticamente después de 10 segundos
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, []);

  const irAlInicio = () => {
    navigate('/');
  };

  const irAMisPedidos = () => {
    navigate('/perfil'); // Ajusta la ruta si tienes una página específica de pedidos
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
        {/* Icono según estado */}
        <div className="mb-6">
          <div
            className={`w-20 h-20 bg-${info.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            {info.icono}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{info.titulo}</h1>
          <p className="text-gray-600 text-lg">{info.mensaje}</p>
        </div>

        {/* Información del pedido */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">Estado del pedido</h2>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 bg-${info.color}-500 rounded-full animate-pulse`}></div>
            <span className={`text-${info.color}-600 font-medium`}>
              {status === 'approved'
                ? 'Confirmado'
                : status === 'rejected'
                  ? 'Rechazado'
                  : 'Pendiente'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {status === 'approved' && 'Recibirás una notificación cuando tu pedido esté listo'}
            {status === 'rejected' && 'Puedes reintentar el pago desde Mis Pedidos'}
            {status === 'pending' && 'Te avisaremos cuando el pago se confirme'}
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
