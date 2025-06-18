import { isValidEmail, isValidPassword } from '../../modules/HU1_2_Registro_Login/logic';
import { Login, RegistroCliente } from '../../modules/HU1_2_Registro_Login/models';
import { Rol, RolResponse, AuthInfo } from '../../types/Rol';
import axiosInstance from './axiosConfig';
import { isPublicRoute } from '../config/routes';

const TOKEN_STORAGE_KEY = 'token';
const ROL_STORAGE_KEY = 'rol';
const EMAIL_STORAGE_KEY = 'email';

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

export const getRolFromStorage = (): Rol | null => {
  const rol = localStorage.getItem(ROL_STORAGE_KEY);
  return rol ? (rol as Rol) : null;
};

export const getEmailFromStorage = (): string | null => {
  return localStorage.getItem(EMAIL_STORAGE_KEY);
};

export const getAuthInfoFromStorage = (): AuthInfo | null => {
  const rol = getRolFromStorage();
  const email = getEmailFromStorage();
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token || !rol || !email) {
    return null;
  }

  return {
    rol,
    email,
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

export const isFullyAuthenticated = (): boolean => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const rol = localStorage.getItem(ROL_STORAGE_KEY);
  const email = localStorage.getItem(EMAIL_STORAGE_KEY);

  return !!(token && rol && email);
};

// Interceptor para manejar tokens expirados
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo redirigir si estamos en una ruta protegida
      const currentPath = window.location.pathname;

      // Token expirado o inválido
      clearAuthData();

      // Solo redirigir si no estamos en una ruta pública
      if (!isPublicRoute(currentPath)) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Logout completo del sistema
export const logout = (): void => {
  clearAuthData();
  // Opcional: notificar al backend del logout
  // axiosInstance.post('/auth/logout').catch(() => {});
  window.location.href = '/';
};

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

// Alias para mantener compatibilidad
export const syncUserWithBackend = sincronizarUsuarioAuth0;

// Login después de sincronización con Auth0
export const loginAfterSync = async (token: string, user: any) => {
  try {
    const response = await axiosInstance.post('/clientes/login/auth0', {
      token,
      email: user.email,
      auth0Id: user.sub,
    });

    // Guardar datos del usuario y token
    localStorage.setItem('user', JSON.stringify(response.data.usuario));
    localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Este usuario no se autentica con Auth0');
    }
    if (error.response?.status === 403) {
      throw new Error('Usuario dado de baja');
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

// Utilidades para autenticación

export const shouldClearAuth = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorResponse = error?.response;

  // Limpiar solo en casos específicos de autenticación fallida
  return (
    errorResponse?.status === 401 ||
    errorResponse?.status === 403 ||
    errorMessage.includes('token') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('invalid token') ||
    errorMessage.includes('expired')
  );
};
