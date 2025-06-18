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
        console.log('🔄 Iniciando login sincronizado de empleado:', empleadoData);

        // 1. Guardar token
        localStorage.setItem('empleadoToken', token);

        // 2. Actualizar EmpleadoProvider
        setEmpleado(empleadoData);

        // 3. Sincronizar con UserProvider
        syncFromEmpleado(empleadoData);

        // 4. Esperar un frame para asegurar que los providers se actualicen
        await new Promise((resolve) => requestAnimationFrame(resolve));

        // 5. Redireccionar según el rol
        redirectEmpleadoByRole(empleadoData);

        console.log('✅ Login de empleado completado exitosamente');
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

      console.log('🎯 Redirigiendo empleado según rol:', empleado.rol);

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
          console.warn('⚠️ Rol no reconocido:', empleado.rol);
          navigate('/admin');
      }
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
