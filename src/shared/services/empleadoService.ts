import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada
import {
  RegistroEmpleado,
  AuthEmpleadoResponse,
  EmpleadoDTO,
} from '../../modules/HU4_Registro_Empleado/model';

const API_BASE_URL = '/empleados';

// Registrar empleado usando el backend
export const registrarEmpleado = async (dto: RegistroEmpleado): Promise<AuthEmpleadoResponse> => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/registro`, dto);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      const message = error.response?.data?.message || error.response?.data;
      if (typeof message === 'string') {
        if (message.includes('Ya existe un empleado')) {
          throw new Error('Ya existe un empleado registrado con este email');
        } else if (message.includes('Formato de email inválido')) {
          throw new Error('Formato de email inválido');
        } else if (message.includes('Las contraseñas no coinciden')) {
          throw new Error('Las contraseñas no coinciden');
        } else if (message.includes('Contraseña obligatoria')) {
          throw new Error('Contraseña obligatoria para registro manual');
        } else if (message.includes('contraseña debe tener')) {
          throw new Error(
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo'
          );
        } else if (message.includes('Rol inválido')) {
          throw new Error('Rol inválido. Debe ser CAJERO, COCINERO o DELIVERY');
        }
      }
      throw new Error(message || 'Error de validación');
    }

    if (error.response?.status === 409) {
      throw new Error('Ya existe un empleado registrado con este email');
    }

    if (error.response?.status === 500) {
      throw new Error('Error interno del servidor. Intente nuevamente');
    }

    throw new Error('Error al registrar el empleado. Intente nuevamente');
  }
};

export const saveEmpleado = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deleteEmpleado = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getEmpleadoById = async (id: number): Promise<EmpleadoDTO> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getAllEmpleados = async (): Promise<EmpleadoDTO[]> => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

// Actualizar empleado
export const updateEmpleado = async (
  id: number,
  data: Partial<EmpleadoDTO>
): Promise<EmpleadoDTO> => {
  const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, data);
  return response.data;
};

// Cambiar estado del empleado (activar/desactivar)
export const cambiarEstadoEmpleado = async (id: number, estado: boolean): Promise<EmpleadoDTO> => {
  try {
    if (estado) {
      // Activar empleado usando el endpoint de alta
      await axiosInstance.patch(`${API_BASE_URL}/admin/${id}/alta`);
    } else {
      // Desactivar empleado usando el endpoint de baja
      await axiosInstance.patch(`${API_BASE_URL}/admin/${id}/baja`);
    }

    // Obtener los datos actualizados del empleado
    const empleadoActualizado = await getEmpleadoById(id);
    return empleadoActualizado;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Empleado no encontrado');
    }
    if (error.response?.status === 400) {
      const mensaje = error.response?.data?.mensaje || error.response?.data?.message;
      if (mensaje?.includes('ya está dado de baja')) {
        throw new Error('El empleado ya está inactivo');
      } else if (mensaje?.includes('ya está activo')) {
        throw new Error('El empleado ya está activo');
      }
      throw new Error(mensaje || 'Error al cambiar estado del empleado');
    }
    throw new Error('Error al cambiar estado del empleado');
  }
};
