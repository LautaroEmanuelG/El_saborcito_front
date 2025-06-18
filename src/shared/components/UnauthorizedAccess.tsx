// src/shared/components/UnauthorizedAccess.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface UnauthorizedAccessProps {
  message?: string;
  requiredRoles?: string[];
  onGoBack?: () => void; // Función opcional para volver atrás
}

export const UnauthorizedAccess = ({
  message,
  requiredRoles = [],
  onGoBack,
}: UnauthorizedAccessProps) => {
  const navigate = useNavigate();
  const { rol, email } = useAuth();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate(-1);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToDashboard = () => {
    if (rol === 'CLIENTE') {
      navigate('/');
    } else {
      navigate('/admin');
    }
  };

  const defaultMessage = `Tu rol actual (${rol}) no tiene permisos para acceder a esta sección.`;
  const displayMessage = message || defaultMessage;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 w-full">
      <div className="max-w-lg w-full text-center bg-white rounded-lg shadow-lg p-8">
        {/* Icono de acceso denegado */}
        <div className="mb-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceso No Autorizado</h1>
        </div>

        {/* Información del usuario actual */}
        {email && rol && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Usuario:</span> {email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Rol actual:</span>{' '}
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {rol}
              </span>
            </p>
          </div>
        )}

        {/* Mensaje de error */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">{displayMessage}</p>

          {requiredRoles.length > 0 && (
            <div className="text-sm text-gray-600">
              <p className="mb-2">Esta sección requiere uno de los siguientes roles:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {requiredRoles.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full bg-primary hover:bg-primarydark text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            ← Volver Atrás
          </button>

          <button
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            🏠 Ir a Mi Dashboard
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            🏢 Ir al Inicio
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};
