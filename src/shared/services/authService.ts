import { isValidEmail, isValidPassword } from '../../modules/HU1_2_Registro_Login/logic';
import { Login, RegistroCliente } from '../../modules/HU1_2_Registro_Login/models';
import axiosInstance from './axiosConfig';

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
    const response = await axiosInstance.post('/clientes/registro', dto);
    return response.data;
  } catch (error: any) {
    if (
      error.response?.status === 400 &&
      typeof error.response?.data?.message === 'string' &&
      error.response.data.message.includes('Ya existe un usuario registrado con este email')
    ) {
      throw new Error('Ya existe un usuario registrado con este email');
    }
    throw error;
  }
};

// 🔐 Login manual
export const loginManual = async (credentials: Login) => {
  try {
    const response = await axiosInstance.post('/clientes/login/manual', credentials);
    return response.data; // Debería devolver token + datos del usuario
  } catch (error: any) {
    if (error.response?.status === 403) {
      const mensaje = error.response?.data?.message || error.response?.data?.error || '';
      if (mensaje.includes('Es un empleado') || mensaje.includes('empleado válido')) {
        throw new Error('Este usuario es un empleado. Use el acceso de empleados.');
      } else if (
        mensaje.includes('Usuario dado de baja') ||
        mensaje.includes('cliente dado de baja')
      ) {
        throw new Error('Usuario dado de baja');
      } else {
        throw new Error('Acceso denegado');
      }
    }
    if (error.response?.status === 401) {
      throw new Error('Usuario o contraseña incorrectos');
    }
    throw new Error('Error en el servidor. Intente nuevamente');
  }
};

// 🌐 Login con Auth0
export const loginConAuth0 = async (token: string, auth0User: any) => {
  try {
    // Obtener el token de Auth0
    const response = await axiosInstance.post('/clientes/login/auth0', {
      token,
      email: auth0User.email,
      sub: auth0User.sub, // ID único de Auth0
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Este email ya está registrado con otro método de autenticación');
    }
    if (error.response?.status === 400) {
      throw new Error('Este usuario no se autentica con Auth0');
    }
    if (error.response?.status === 403) {
      throw new Error('Usuario dado de baja');
    }
    throw error;
  }
};

// Sincronizar usuario con Auth0
export const sincronizarUsuarioAuth0 = async (auth0User: any) => {
  try {
    const response = await axiosInstance.post('/clientes/auth0', {
      sub: auth0User.sub,
      email: auth0User.email,
      givenName: auth0User.given_name,
      familyName: auth0User.family_name,
      domicilios: [],
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Este email ya está registrado con otro método de autenticación');
    }
    throw error;
  }
};

// 🔐 Login manual de admin
export const loginAdmin = async (credentials: Login) => {
  try {
    const response = await axiosInstance.post('/admin/login', credentials);
    return response.data; // Debería devolver token + datos del usuario
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('Acceso denegado');
    }
    if (error.response?.status === 401) {
      throw new Error('Usuario o contraseña incorrectos');
    }
    throw new Error('Error en el servidor. Intente nuevamente');
  }
};
