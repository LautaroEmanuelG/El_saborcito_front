import { LoginEmpleado, AuthEmpleadoResponse, CambiarPasswordDTO } from './model';
import axiosInstance from '../../shared/services/axiosConfig';
import { isValidEmail, isValidPassword } from '../HU1_2_Registro_Login/logic';

// Validar datos de login de empleado
export const validarLoginEmpleado = (datos: LoginEmpleado): string | null => {
  if (!datos.email || !datos.password) {
    return 'Email y contraseña son obligatorios';
  }

  if (!isValidEmail(datos.email)) {
    return 'Formato de email inválido';
  }

  return null;
};

// Validar nueva contraseña para empleados
export const validarNuevaContraseña = (
  contraseñaNueva: string,
  confirmarContraseña: string
): string | null => {
  if (!contraseñaNueva || !confirmarContraseña) {
    return 'Ambas contraseñas son obligatorias';
  }

  if (contraseñaNueva !== confirmarContraseña) {
    return 'Las contraseñas no coinciden';
  }

  if (!isValidPassword(contraseñaNueva)) {
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo';
  }

  return null;
};

// Validar datos completos para cambio de contraseña
export const validarCambioContraseña = (datos: CambiarPasswordDTO): string | null => {
  if (!datos.currentPassword) {
    return 'La contraseña actual es obligatoria';
  }

  if (!datos.newPassword || !datos.confirmPassword) {
    return 'La nueva contraseña y su confirmación son obligatorias';
  }

  if (datos.newPassword !== datos.confirmPassword) {
    return 'Las contraseñas no coinciden';
  }

  if (!isValidPassword(datos.newPassword)) {
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo';
  }

  return null;
};

// Servicio para login de empleados
export const loginEmpleado = async (credentials: LoginEmpleado): Promise<AuthEmpleadoResponse> => {
  try {
    const response = await axiosInstance.post('/empleados/login/manual', credentials);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      const mensaje = error.response?.data?.message || error.response?.data?.error || '';
      if (mensaje.includes('No es un empleado válido')) {
        throw new Error('Este usuario no es un empleado. Use el login de clientes.');
      } else if (mensaje.includes('Empleado dado de baja')) {
        throw new Error('Empleado dado de baja');
      } else {
        throw new Error('Acceso denegado');
      }
    }
    if (error.response?.status === 401) {
      throw new Error('Usuario o contraseña incorrectos');
    }
    throw new Error('Error en el servidor. Intente nuevamente');
  }
};

// Servicio para cambiar contraseña usando el endpoint real del backend
export const cambiarContraseñaEmpleado = async (
  empleadoId: number,
  datos: CambiarPasswordDTO
): Promise<void> => {
  try {
    await axiosInstance.put(`/empleados/${empleadoId}/cambiar-password`, datos);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Contraseña actual incorrecta');
    }
    if (error.response?.status === 400) {
      const mensaje = error.response?.data?.message || '';
      if (mensaje.includes('Las contraseñas no coinciden')) {
        throw new Error('Las contraseñas no coinciden');
      } else if (mensaje.includes('La contraseña debe tener')) {
        throw new Error(
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo'
        );
      } else {
        throw new Error('La nueva contraseña no cumple con los requisitos');
      }
    }
    if (error.response?.status === 404) {
      throw new Error('Usuario no encontrado');
    }
    throw new Error('Error al cambiar la contraseña');
  }
};

// Verificar horario de atención (si es necesario)
export const verificarHorarioAtencion = (): boolean => {
  const ahora = new Date();
  const hora = ahora.getHours();
  // Horario de ejemplo: 8:00 - 22:00
  return hora >= 8 && hora <= 22;
};

// Verificar si hay actividad reciente (para auto logout)
export const verificarActividadReciente = (ultimaActividad: Date): boolean => {
  const ahora = new Date();
  const diferencia = (ahora.getTime() - ultimaActividad.getTime()) / (1000 * 60); // en minutos
  return diferencia <= 30; // 30 minutos de inactividad
};
