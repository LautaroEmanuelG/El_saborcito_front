import { isValidEmail, isValidPassword } from '../../modules/HU1_2_Registro_Login/logic';
import { Login, RegistroCliente } from '../../modules/HU1_2_Registro_Login/models';
import { Rol, RolResponse, AuthInfo } from '../../types/Rol';
import axiosInstance from './axiosConfig';

const TOKEN_STORAGE_KEY = 'token';
const ROL_STORAGE_KEY = 'rol';
const EMAIL_STORAGE_KEY = 'email'; // Simplificado: solo 'email'

export const fetchRol = async (): Promise<AuthInfo> => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await axiosInstance.get<RolResponse>('/auth/rol', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { rol, email } = response.data;

    // Validaciones básicas
    if (!rol || !email || !isValidEmail(email)) {
      throw new Error('Respuesta inválida del servidor');
    }

    // Guardar información de autenticación
    localStorage.setItem(ROL_STORAGE_KEY, rol);
    localStorage.setItem(EMAIL_STORAGE_KEY, email);

    return { rol, email, isValidToken: true };
  } catch (error: any) {
    console.error('❌ Error al obtener información de autenticación:', error);
    // Solo limpiar en errores de autenticación
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuthData();
    }
    throw error;
  }
};

export const getAuthInfoFromStorage = (): AuthInfo | null => {
  const rol = localStorage.getItem(ROL_STORAGE_KEY) as Rol;
  const email = localStorage.getItem(EMAIL_STORAGE_KEY);
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token) return null;

  return {
    rol: rol || Rol.CLIENTE, // Default fallback
    email: email || '',
    isValidToken: true,
  };
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(ROL_STORAGE_KEY);
  localStorage.removeItem(EMAIL_STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const logout = (): void => {
  clearAuthData();
  window.location.href = '/';
};

// Interceptor para manejar tokens expirados
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Funciones de login y registro (mantener existentes)
export const registrarCliente = async (dto: RegistroCliente): Promise<any> => {
  try {
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

export const loginManual = async (credentials: Login) => {
  try {
    const response = await axiosInstance.post('/clientes/login/manual', credentials);
    return response.data;
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

export const loginConAuth0 = async (token: string, auth0User: any) => {
  try {
    const response = await axiosInstance.post('/clientes/login/auth0', {
      token,
      email: auth0User.email,
      sub: auth0User.sub,
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

export const loginAdmin = async (credentials: Login) => {
  try {
    const response = await axiosInstance.post('/admin/login', credentials);
    return response.data;
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
