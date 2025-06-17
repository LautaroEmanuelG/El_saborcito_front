import { isValidEmail } from '../HU1_2_Registro_Login/logic';
import { ClienteFormData, ActualizarClienteAdminDTO } from './model';

// Validar formulario de actualización de cliente
export const validarFormularioCliente = (formData: ClienteFormData): string[] => {
  const errores: string[] = [];

  // Validaciones de campos obligatorios
  if (!formData.nombre.trim()) {
    errores.push('El nombre es obligatorio');
  }

  if (!formData.apellido.trim()) {
    errores.push('El apellido es obligatorio');
  }

  if (!formData.telefono.trim()) {
    errores.push('El teléfono es obligatorio');
  } else if (!isValidPhoneNumber(formData.telefono)) {
    errores.push('El formato del teléfono no es válido');
  }

  if (!formData.email.trim()) {
    errores.push('El email es obligatorio');
  } else if (!isValidEmail(formData.email)) {
    errores.push('El formato del email no es válido');
  }

  if (formData.fechaNacimiento && !isValidFechaNacimiento(formData.fechaNacimiento)) {
    errores.push('La fecha de nacimiento no es válida');
  }

  return errores;
};

// Convertir formulario a DTO para el backend
export const formDataToActualizarClienteDTO = (
  formData: ClienteFormData
): ActualizarClienteAdminDTO => {
  return {
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    telefono: formData.telefono.trim(),
    email: formData.email.trim().toLowerCase(),
    fechaNacimiento: formData.fechaNacimiento || undefined,
    domicilios: [], // Por ahora sin gestión de domicilios
  };
};

// Validar que el teléfono tenga formato correcto
export const isValidPhoneNumber = (phone: string): boolean => {
  // Validación básica para números de teléfono (solo números, espacios, guiones y paréntesis)
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
};

// Validar fecha de nacimiento
export const isValidFechaNacimiento = (fecha: string): boolean => {
  if (!fecha) return true; // Es opcional

  const fechaNacimiento = new Date(fecha);
  const ahora = new Date();
  const edadMinima = new Date(ahora.getFullYear() - 120, ahora.getMonth(), ahora.getDate());

  return fechaNacimiento <= ahora && fechaNacimiento >= edadMinima;
};

// Limpiar y formatear campos del formulario
export const cleanFormData = (formData: ClienteFormData): ClienteFormData => {
  return {
    ...formData,
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    telefono: formData.telefono.trim(),
    email: formData.email.trim().toLowerCase(),
  };
};

// Formatear fecha para mostrar
export const formatearFecha = (fecha: string | undefined): string => {
  if (!fecha) return 'No especificada';

  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Fecha inválida';
  }
};
