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
    if (empleadoAutenticado) {
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

      // Redirección basada en el rol del empleado
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
      return;
    }

    // Si es un usuario regular (cliente)
    if (user) {
      navigate('/');
      return;
    }

    // Si no hay usuario autenticado, ir al home
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
