import { isValidEmail, isValidPassword } from '../HU1_2_Registro_Login/logic';
import { RegistroEmpleado, EmpleadoFormData } from './model';
import { Rol } from '../HU1_2_Registro_Login/models';

// Validar formulario de registro de empleado
export const validarFormularioEmpleado = (formData: EmpleadoFormData): string[] => {
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
  }

  if (!formData.email.trim()) {
    errores.push('El email es obligatorio');
  } else if (!isValidEmail(formData.email)) {
    errores.push('El formato del email no es válido');
  }

  if (!formData.password) {
    errores.push('La contraseña es obligatoria');
  } else if (!isValidPassword(formData.password)) {
    errores.push(
      'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo'
    );
  }

  if (!formData.confirmarPassword) {
    errores.push('La confirmación de contraseña es obligatoria');
  } else if (formData.password !== formData.confirmarPassword) {
    errores.push('Las contraseñas no coinciden');
  }

  if (!formData.rol) {
    errores.push('Debe seleccionar un rol');
  } else if (![Rol.CAJERO, Rol.COCINERO, Rol.DELIVERY].includes(formData.rol as Rol)) {
    errores.push('El rol seleccionado no es válido');
  }

  return errores;
};

// Convertir formulario a DTO para el backend
export const formDataToRegistroEmpleado = (formData: EmpleadoFormData): RegistroEmpleado => {
  return {
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    telefono: formData.telefono.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    confirmarPassword: formData.confirmarPassword,
    rol: formData.rol as Rol,
    sucursal: formData.sucursal,
    esAuth0: false,
  };
};

// Validar que el teléfono tenga formato correcto
export const isValidPhoneNumber = (phone: string): boolean => {
  // Validación básica para números de teléfono (solo números, espacios, guiones y paréntesis)
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
};

// Validar que el legajo tenga formato correcto (solo para validación, no para generar)
export const validarFormatoLegajo = (legajo: string): boolean => {
  // Formato: 4 letras (2 del nombre + 2 del apellido) + hasta 4 números
  const regex = /^[A-Z]{4}\d{1,4}$/;
  return regex.test(legajo);
};

// Limpiar y formatear campos del formulario
export const cleanFormData = (formData: EmpleadoFormData): EmpleadoFormData => {
  return {
    ...formData,
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    telefono: formData.telefono.trim(),
    email: formData.email.trim().toLowerCase(),
  };
};
