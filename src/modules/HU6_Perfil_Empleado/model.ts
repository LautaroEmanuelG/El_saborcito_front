import { Domicilio } from '../HU1_2_Registro_Login/models';
import { Sucursal } from '../../types/Sucursal';

// DTO para actualizar datos del empleado - coincide con el backend
export interface ActualizarDatosEmpleadoDTO {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  domicilios?: DomicilioDTO[];
}

// DTO para cambio de contraseña - coincide con el backend
export interface CambiarPasswordEmpleadoDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// DTO para domicilio
export interface DomicilioDTO {
  id?: number;
  calle: string;
  numero: string;
  cp: string;
  localidadId: number;
}

// Interface para los datos del empleado en el perfil
export interface PerfilEmpleadoData {
  id: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  fechaIngreso?: string;
  legajo?: string;
  rol: 'CAJERO' | 'COCINERO' | 'DELIVERY' | 'ADMIN';
  estado?: boolean;
  domicilios?: Domicilio[];
  sucursal?: Sucursal;
}

// Interface para el formulario de edición de datos personales
export interface EditarDatosEmpleadoForm {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
}

// Interface para el formulario de cambio de contraseña
export interface CambiarContraseñaForm {
  contraseñaActual: string;
  nuevaContraseña: string;
  confirmarNuevaContraseña: string;
}

// Enum para las vistas del perfil
export enum VistaPerfilEmpleado {
  DATOS = 'datos',
  CONTRASEÑA = 'contraseña',
}

// Interface para respuesta del servidor al actualizar empleado
export interface ActualizarEmpleadoResponse {
  success: boolean;
  message: string;
  empleado?: PerfilEmpleadoData;
}
