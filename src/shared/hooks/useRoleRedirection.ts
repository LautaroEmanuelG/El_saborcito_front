import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmpleado } from '../providers/EmpleadoProvider';
import { useUser } from '../providers/UserProvider';

export const useRoleRedirection = () => {
  const navigate = useNavigate();
  const { empleadoAutenticado } = useEmpleado();
  const { user } = useUser();

  const redirectByRole = useCallback(() => {
    // Priorizar empleado si está autenticado
    const empleadoData = localStorage.getItem('empleadoData');
    let empleado = empleadoAutenticado;

    // Si hay datos en localStorage, usarlos (pueden ser más actualizados)
    if (empleadoData) {
      try {
        empleado = JSON.parse(empleadoData);
      } catch (error) {
        console.error('Error al parsear empleadoData:', error);
      }
    }

    if (empleado) {
      console.log('🚀 Redirigiendo empleado con rol:', empleado.rol);

      // Redirección basada en el rol del empleado
      switch (empleado.rol) {
        case 'ADMIN':
          console.log('→ Redirigiendo a /admin/historial');
          navigate('/admin/historial');
          break;
        case 'CAJERO':
          console.log('→ Redirigiendo a /admin/recepcion');
          navigate('/admin/recepcion');
          break;
        case 'COCINERO':
          console.log('→ Redirigiendo a /admin/cocina');
          navigate('/admin/cocina');
          break;
        case 'DELIVERY':
          console.log('→ Redirigiendo a /admin/delivery');
          navigate('/admin/delivery');
          break;
        default:
          console.log('→ Redirigiendo a /admin (default)');
          navigate('/admin');
      }
      return;
    }

    // Si es un usuario regular (cliente)
    if (user) {
      console.log('🚀 Redirigiendo usuario cliente a home');
      navigate('/');
      return;
    }

    // Si no hay usuario autenticado, ir al home
    console.log('🚀 No hay usuario autenticado, redirigiendo a home');
    navigate('/');
  }, [empleadoAutenticado, user, navigate]);

  const redirectEmployeeByRole = useCallback(
    (empleado: any) => {
      if (!empleado?.rol) {
        navigate('/admin');
        return;
      }

      switch (empleado.rol) {
        case 'ADMIN':
          navigate('/admin/historial');
          break;
        case 'CAJERO':
          navigate('/admin/recepcion');
          break;
        case 'COCINERO':
          navigate('/admin/cocina');
          break;
        case 'DELIVERY':
          navigate('/admin/delivery');
          break;
        default:
          navigate('/admin');
      }
    },
    [navigate]
  );

  return {
    redirectByRole,
    redirectEmployeeByRole,
  };
};
