import { Domicilio } from '../HU1_2_Registro_Login/models';

export interface ClienteDTO {
  id?: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  fechaNacimiento?: string;
  fechaRegistro?: string;
  fechaUltimaModificacion?: string;
  estado?: boolean;
  domicilios?: Domicilio[];
  esAuth0?: boolean;
  auth0Id?: string;
}

export interface ActualizarClienteAdminDTO {
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  fechaNacimiento?: string;
  domicilios?: Domicilio[];
}

export interface ClienteFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
}

// Estados disponibles para filtrar clientes
export const ESTADOS_CLIENTE = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
] as const;
