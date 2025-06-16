// src/modules/HU3_Perfil_Cliente/logic.ts

// Validar formato de email
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\\s@]+@[^\s@]+\\.[^\s@]+$/;
  return regex.test(email);
};

// Validar formato de contraseña
export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) && // Al menos una mayúscula
    /[a-z]/.test(password) && // Al menos una minúscula
    /[!@#$%^&*(),.?\":{}|<>]/.test(password) // Al menos un símbolo
  );
};

// Validar que las contraseñas coincidan
export const doPasswordsMatch = (pass1: string, pass2: string): boolean => {
  return pass1 === pass2;
};
