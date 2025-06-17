import { Usuario } from '../../types/Usuario';

// Modelo específico para login de empleados
export interface LoginEmpleado {
  email: string;
  password: string;
}

// Modelo para el cambio de contraseña (primer login) - Coincide con CambiarPasswordDTO del backend
export interface CambiarPasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Modelo legacy - mantener para compatibilidad
export interface CambioContraseñaEmpleado {
  email: string;
  contraseñaActual: string;
  contraseñaNueva: string;
}

// Respuesta del backend para login de empleados
export interface AuthEmpleadoResponse {
  mensaje: string;
  cambioRequerido: boolean;
  empleado: Empleado;
  token?: string;
}

// Interfaz extendida de Usuario para empleados
export interface Empleado extends Omit<Usuario, 'rol'> {
  primerLogin?: boolean;
  rol: 'CAJERO' | 'COCINERO' | 'DELIVERY' | 'ADMIN';
}

// Estados del login de empleados
export enum EstadoLoginEmpleado {
  INICIAL = 'INICIAL',
  AUTENTICANDO = 'AUTENTICANDO',
  CAMBIO_CONTRASEÑA = 'CAMBIO_CONTRASEÑA',
  EXITOSO = 'EXITOSO',
  ERROR = 'ERROR',
  BLOQUEADO = 'BLOQUEADO',
}
