import { isValidEmail, isValidPassword } from '../../modules/HU1_2_Registro_Login/logic';
import { Login, RegistroCliente } from '../../modules/HU1_2_Registro_Login/models';
import axiosInstance from './axiosConfig';

const API_BASE_URL = 'http://localhost:5252/api'; //no creo llamar bien a la url

// Registrar cliente usando el backend
export const registrarCliente = async (dto: RegistroCliente): Promise<any> => {
  try {
    // Validaciones previas
    if (!isValidEmail(dto.email)) {
      throw new Error('Formato de email inválido');
    }

    if (!dto.esAuth0) {
      if (!dto.password || !dto.confirmarPassword) {
        throw new Error('Contraseña obligatoria para registro manual');
      }

      if (dto.password !== dto.confirmarPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (!isValidPassword(dto.password)) {
        throw new Error(
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, minúscula y símbolo.'
        );
      }
    }

    // Llamar al backend
    const response = await axiosInstance.post(`${API_BASE_URL}/clientes/registro`, dto);
    return response.data;
  } catch (error: any) {
    if (
      error.response?.status === 400 &&
      error.response?.data?.includes('Ya existe un usuario registrado con este email')
    ) {
      throw new Error('Ya existe un usuario registrado con este email');
    }
    throw error;
  }
};

// 🔐 Login manual
export const loginManual = async (credentials: Login) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/clientes/login/manual`, credentials);
  return response.data; // Debería devolver token + datos del usuario
};

// 🌐 Login con Auth0
export const loginConAuth0 = async (token: Login) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/login/auth0`, token);
  return response.data; // También devuelve el token y usuario (ya validado por backend)
};
