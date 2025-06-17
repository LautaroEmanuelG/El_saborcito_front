export interface DomicilioDTO {
  id?: number;
  calle: string;
  numero: string;
  cp: string;
  localidadId: number;
}

export interface ActualizarDatosClienteDTO {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  domicilios?: DomicilioDTO[];
  // Para cambio de contraseña
  contraseñaActual?: string;
  nuevaContraseña?: string;
  confirmarContraseña?: string;
}
