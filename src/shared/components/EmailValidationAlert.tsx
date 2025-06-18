// src/shared/components/EmailValidationAlert.tsx
import { useAuth } from '../hooks/useAuth';

interface EmailValidationAlertProps {
  expectedEmail?: string;
  onDismiss?: () => void;
}

export const EmailValidationAlert = ({ expectedEmail, onDismiss }: EmailValidationAlertProps) => {
  const { email, rol } = useAuth();

  // Si no hay email esperado o coincide, no mostrar alerta
  if (!expectedEmail || email === expectedEmail) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="text-yellow-400 text-xl">⚠️</div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Discrepancia de Email Detectada</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">El email en tu sesión no coincide con el esperado:</p>
            <div className="bg-yellow-100 p-2 rounded text-xs font-mono">
              <div>
                <strong>Email en sesión:</strong> {email}
              </div>
              <div>
                <strong>Email esperado:</strong> {expectedEmail}
              </div>
              <div>
                <strong>Rol actual:</strong> {rol}
              </div>
            </div>
            <p className="mt-2">
              Esto podría indicar un problema de seguridad. Se recomienda cerrar sesión e ingresar
              nuevamente.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded transition-colors"
            >
              Recargar Página
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-yellow-600 hover:text-yellow-800 px-3 py-1 rounded transition-colors"
              >
                Cerrar Alerta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
