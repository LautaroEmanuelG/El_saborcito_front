import { Domicilio, Rol } from '../HU1_2_Registro_Login/models';
import { Sucursal } from '../../types/Sucursal';

export interface RegistroEmpleado {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  password: string;
  confirmarPassword: string;
  fechaIngreso?: string; // LocalDate
  legajo?: string;
  domicilios?: Domicilio[];
  rol: Rol;
  sucursal?: Sucursal;
  esAuth0?: boolean;
  auth0Id?: string;
}

export interface EmpleadoDTO {
  id?: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  fechaIngreso?: string;
  legajo?: string;
  rol: Rol;
  estado?: boolean;
  fechaRegistro?: string;
  fechaUltimaModificacion?: string;
  domicilios?: Domicilio[];
  sucursal?: Sucursal;
}

export interface AuthEmpleadoResponse {
  mensaje: string;
  empleado: EmpleadoDTO;
  token: string;
  cambioRequerido: boolean;
}

// Opciones de roles disponibles para empleados
export const ROLES_EMPLEADO = [
  { value: Rol.CAJERO, label: 'Cajero' },
  { value: Rol.COCINERO, label: 'Cocinero' },
  { value: Rol.DELIVERY, label: 'Delivery' },
] as const;

export interface EmpleadoFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  password: string;
  confirmarPassword: string;
  rol: Rol | '';
  sucursal?: Sucursal;
}
