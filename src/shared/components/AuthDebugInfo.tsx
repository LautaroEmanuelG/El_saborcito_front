// src/shared/components/AuthDebugInfo.tsx
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../providers/UserProvider';

interface AuthDebugInfoProps {
  showInProduction?: boolean;
}

export const AuthDebugInfo = ({ showInProduction = false }: AuthDebugInfoProps) => {
  // Solo mostrar en development o si showInProduction es true
  if (import.meta.env.PROD && !showInProduction) {
    return null;
  }

  const {
    rol,
    email,
    authInfo,
    isLoading: authLoading,
    isAuthenticated,
    isFullyAuthenticated,
  } = useAuth();
  const { user } = useUser();
  const debugInfo = {
    token: !!localStorage.getItem('token'),
    storedRol: localStorage.getItem('rol'),
    storedEmail: localStorage.getItem('email'), // Corregido: usar 'email' en lugar de 'userEmail'
    userInProvider: !!user,
    isAuthenticated,
    isFullyAuthenticated,
    authLoading,
    currentRol: rol,
    currentEmail: email,
    validToken: authInfo?.isValidToken || false,
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">🔐 Auth Debug</h4>
      <div className="space-y-1">
        {Object.entries(debugInfo).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="opacity-75">{key}:</span>
            <span className={value ? 'text-green-300' : 'text-red-300'}>
              {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
