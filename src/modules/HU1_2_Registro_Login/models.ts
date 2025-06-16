import { Usuario } from '../../types/Usuario';

export interface Login {
  email: string;
  password: string;
  esAuth0Login?: boolean;
}
export interface RegistroCliente {
  auth0Id?: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  password?: string;
  confirmarPassword?: string;
  fechaNacimiento?: string; // LocalDate
  domicilios?: Domicilio[];
  esAuth0?: boolean;
}
export interface RegistroAuth0 {
  sub: string; // ID único de Auth0
  email: string;
  givenName: string; // Nombre
  familyName: string; // Apellido
  domicilios?: Domicilio[];
}
export interface AuthResponse {
  message: string;
  token: string;
  usuario: Usuario;
}
export enum Rol {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE',
  CAJERO = 'CAJERO',
  COCINERO = 'COCINERO',
  DELIVERY = 'DELIVERY',
}
export interface Domicilio {
  id?: number;
  calle?: string;
  numero?: number;
  cp?: string;
  localidad?: Localidad;
  latitud?: number;
  longitud?: number;
}

export interface Cliente extends Usuario {}
export interface Localidad {
  id: number;
  nombre: string;
  provincia: Provincia;
}
export interface Provincia {
  id: number;
  nombre: string;
  pais: Pais;
}
export interface Pais {
  id: number;
  nombre: string;
}
