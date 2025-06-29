import { useEffect } from 'react';
import { useRoleRedirection } from '../../../shared/hooks/useRoleRedirection';
import { useEmpleado } from '../../../shared/providers/EmpleadoProvider';

export const AdminRedirect = () => {
  const { redirectByRole } = useRoleRedirection();
  const { empleadoAutenticado } = useEmpleado();

  useEffect(() => {
    // Pequeño delay para asegurar que el contexto esté cargado
    const timer = setTimeout(() => {
      redirectByRole();
    }, 100);

    return () => clearTimeout(timer);
  }, [redirectByRole, empleadoAutenticado]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gris">Redirigiendo a tu área de trabajo...</p>
      </div>
    </div>
  );
};
