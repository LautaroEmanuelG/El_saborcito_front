import { Domicilio, Rol } from '../modules/HU1_2_Registro_Login/models';
import { Imagen } from './Imagen';

export interface Usuario {
  id?: number;
  email: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fechaNacimiento?: string; // LocalDate -> ISO String
  rol?: Rol;
  estado?: boolean;
  fechaRegistro?: string; // LocalDateTime
  fechaUltimaModificacion?: string; // LocalDateTime
  domicilios?: Domicilio[];
  imagen?: Imagen;
}
