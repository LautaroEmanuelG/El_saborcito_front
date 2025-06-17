import { isValidEmail, isValidPassword } from '../HU1_2_Registro_Login/logic';
import axiosInstance from '../../shared/services/axiosConfig';
import {
  ActualizarDatosEmpleadoDTO,
  CambiarPasswordEmpleadoDTO,
  EditarDatosEmpleadoForm,
  CambiarContraseñaForm,
  PerfilEmpleadoData,
} from './model';

// Validaciones para editar datos personales del empleado
export const validarDatosEmpleado = (datos: EditarDatosEmpleadoForm): string[] => {
  const errores: string[] = [];

  // Validar nombre
  if (!datos.nombre || datos.nombre.trim().length === 0) {
    errores.push('El nombre es obligatorio');
  } else if (datos.nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  // Validar apellido
  if (!datos.apellido || datos.apellido.trim().length === 0) {
    errores.push('El apellido es obligatorio');
  } else if (datos.apellido.trim().length < 2) {
    errores.push('El apellido debe tener al menos 2 caracteres');
  }

  // Validar teléfono
  if (!datos.telefono || datos.telefono.trim().length === 0) {
    errores.push('El teléfono es obligatorio');
  } else if (!/^\d{8,15}$/.test(datos.telefono.replace(/[\s\-\(\)]/g, ''))) {
    errores.push('El teléfono debe tener entre 8 y 15 dígitos');
  }

  // Validar email
  if (!datos.email || datos.email.trim().length === 0) {
    errores.push('El email es obligatorio');
  } else if (!isValidEmail(datos.email)) {
    errores.push('El formato del email no es válido');
  }

  return errores;
};

// Validaciones para cambio de contraseña
export const validarCambioContraseña = (datos: CambiarContraseñaForm): string[] => {
  const errores: string[] = [];

  // Validar contraseña actual
  if (!datos.contraseñaActual || datos.contraseñaActual.trim().length === 0) {
    errores.push('La contraseña actual es obligatoria');
  }

  // Validar nueva contraseña
  if (!datos.nuevaContraseña || datos.nuevaContraseña.trim().length === 0) {
    errores.push('La nueva contraseña es obligatoria');
  } else if (!isValidPassword(datos.nuevaContraseña)) {
    errores.push(
      'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo'
    );
  }

  // Validar confirmación de contraseña
  if (!datos.confirmarNuevaContraseña || datos.confirmarNuevaContraseña.trim().length === 0) {
    errores.push('La confirmación de contraseña es obligatoria');
  } else if (datos.nuevaContraseña !== datos.confirmarNuevaContraseña) {
    errores.push('Las contraseñas no coinciden');
  }

  // Validar que la nueva contraseña sea diferente a la actual
  if (datos.contraseñaActual === datos.nuevaContraseña) {
    errores.push('La nueva contraseña debe ser diferente a la actual');
  }

  return errores;
};

// Servicio para obtener datos del empleado actual
export const obtenerPerfilEmpleado = async (empleadoId: number): Promise<PerfilEmpleadoData> => {
  try {
    const response = await axiosInstance.get(`/empleados/${empleadoId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Empleado no encontrado');
    }
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para acceder a estos datos');
    }
    throw new Error('Error al cargar los datos del empleado. Intente nuevamente');
  }
};

// Servicio para actualizar datos del empleado
export const actualizarDatosEmpleado = async (
  empleadoId: number,
  datos: EditarDatosEmpleadoForm
): Promise<PerfilEmpleadoData> => {
  try {
    // Validar datos antes de enviar
    const errores = validarDatosEmpleado(datos);
    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }

    // Preparar DTO para el backend
    const dto: ActualizarDatosEmpleadoDTO = {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      telefono: datos.telefono.trim(),
      email: datos.email.trim().toLowerCase(),
    };

    const response = await axiosInstance.patch(`/empleados/${empleadoId}`, dto);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      const message = error.response?.data?.message || error.response?.data;
      if (typeof message === 'string') {
        if (message.includes('formato de email inválido')) {
          throw new Error('El formato del email no es válido');
        } else if (message.includes('email ya existe')) {
          throw new Error('Ya existe otro usuario con este email');
        }
      }
      throw new Error(message || 'Error de validación');
    }
    if (error.response?.status === 404) {
      throw new Error('Empleado no encontrado');
    }
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para realizar esta acción');
    }
    throw new Error(error.message || 'Error al actualizar los datos. Intente nuevamente');
  }
};

// Servicio para cambiar contraseña del empleado
export const cambiarContraseñaEmpleado = async (
  empleadoId: number,
  datos: CambiarContraseñaForm
): Promise<void> => {
  try {
    // Validar datos antes de enviar
    const errores = validarCambioContraseña(datos);
    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }

    // Preparar DTO para el backend
    const dto: CambiarPasswordEmpleadoDTO = {
      currentPassword: datos.contraseñaActual,
      newPassword: datos.nuevaContraseña,
      confirmPassword: datos.confirmarNuevaContraseña,
    };

    await axiosInstance.put(`/empleados/${empleadoId}/cambiar-password`, dto);
  } catch (error: any) {
    if (error.response?.status === 400) {
      const message = error.response?.data?.message || error.response?.data;
      if (typeof message === 'string') {
        if (message.includes('contraseñas no coinciden')) {
          throw new Error('Las contraseñas no coinciden');
        } else if (message.includes('contraseña debe tener')) {
          throw new Error(
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo'
          );
        }
      }
      throw new Error(message || 'Error de validación');
    }
    if (error.response?.status === 401) {
      throw new Error('La contraseña actual es incorrecta');
    }
    if (error.response?.status === 404) {
      throw new Error('Empleado no encontrado');
    }
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para realizar esta acción');
    }
    throw new Error(error.message || 'Error al cambiar la contraseña. Intente nuevamente');
  }
};

// Función para limpiar formulario de datos personales
export const limpiarFormularioDatos = (): EditarDatosEmpleadoForm => ({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
});

// Función para limpiar formulario de cambio de contraseña
export const limpiarFormularioContraseña = (): CambiarContraseñaForm => ({
  contraseñaActual: '',
  nuevaContraseña: '',
  confirmarNuevaContraseña: '',
});

// Función para obtener el nombre del rol en español
export const obtenerNombreRol = (rol: string): string => {
  const roles: { [key: string]: string } = {
    ADMIN: 'Administrador',
    CAJERO: 'Cajero',
    COCINERO: 'Cocinero',
    DELIVERY: 'Delivery',
  };

  return roles[rol] || rol;
};

// Función para formatear fecha
export const formatearFecha = (fecha: string | undefined): string => {
  if (!fecha) return 'No especificada';

  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};
