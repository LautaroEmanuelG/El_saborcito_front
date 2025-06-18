// src/shared/components/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const LoadingSpinner = ({
  message = 'Cargando...',
  size = 'medium',
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-gray-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-primary mx-auto mb-4 ${sizeClasses[size]}`}
        ></div>
        {message && <p className="text-gray-600 text-sm font-medium">{message}</p>}
      </div>
    </div>
  );
};
