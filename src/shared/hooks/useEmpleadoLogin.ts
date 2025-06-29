import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../providers/UserProvider';
import { useEmpleado } from '../providers/EmpleadoProvider';

/**
 * 🚀 **HOOK PARA MANEJO SINCRONIZADO DE LOGIN DE EMPLEADOS**
 * Maneja la sincronización entre EmpleadoProvider y UserProvider
 * y asegura la redirección correcta según el rol
 */
export const useEmpleadoLogin = () => {
  const navigate = useNavigate();
  const { syncFromEmpleado } = useUser();
  const { setEmpleado } = useEmpleado();

  /**
   * Función principal para login de empleado con sincronización completa
   */
  const loginEmpleadoWithSync = useCallback(
    async (empleadoData: any, token: string): Promise<void> => {
      try {
        // 1. Guardar token
        localStorage.setItem('empleadoToken', token);

        // 2. Actualizar EmpleadoProvider
        setEmpleado(empleadoData);

        // 3. Sincronizar con UserProvider
        syncFromEmpleado(empleadoData);

        // 4. Esperar un frame para asegurar que los providers se actualicen
        await new Promise((resolve) => requestAnimationFrame(resolve));

        // 5. Redireccionar según el rol con un pequeño delay adicional
        setTimeout(() => {
          redirectEmpleadoByRole(empleadoData);
        }, 100);
      } catch (error) {
        console.error('❌ Error en login sincronizado de empleado:', error);
        throw error;
      }
    },
    [setEmpleado, syncFromEmpleado, navigate]
  );

  /**
   * Función de redirección específica para empleados
   */
  const redirectEmpleadoByRole = useCallback(
    (empleado: any): void => {
      if (!empleado?.rol) {
        console.warn('⚠️ Empleado sin rol definido, redirigiendo a admin general');
        navigate('/admin');
        return;
      }

      let targetRoute = '';
      switch (empleado.rol) {
        case 'ADMIN':
          targetRoute = '/admin/historial';
          break;
        case 'CAJERO':
          targetRoute = '/admin/recepcion';
          break;
        case 'COCINERO':
          targetRoute = '/admin/cocina';
          break;
        case 'DELIVERY':
          targetRoute = '/admin/delivery';
          break;
        default:
          console.warn('⚠️ Rol no reconocido:', empleado.rol);
          targetRoute = '/admin';
      }

      navigate(targetRoute, { replace: true });
    },
    [navigate]
  );

  /**
   * Verifica si hay datos de empleado sincronizados
   */
  const isEmployeeSynced = useCallback((): boolean => {
    const empleadoData = localStorage.getItem('empleadoData');
    const userType = localStorage.getItem('userType');
    const empleadoToken = localStorage.getItem('empleadoToken');

    return !!(empleadoData && userType === 'employee' && empleadoToken);
  }, []);

  return {
    loginEmpleadoWithSync,
    redirectEmpleadoByRole,
    isEmployeeSynced,
  };
};
