import { useAuth0 } from '@auth0/auth0-react';
import axiosInstance from './axiosConfig';

// Sincronizar usuario con el backend
export const syncUserWithBackend = async (user: any) => {
  const userData = {
    sub: user.sub,
    email: user.email ?? '',
    givenName: user.given_name ?? user.name ?? '',
    familyName: user.family_name ?? '',
    domicilios: [], // Puedes dejar vacío o pedir más datos luego
  };

  try {
    const response = await axiosInstance.post('/clientes/auth0', userData);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Este email ya está registrado con otro método de autenticación');
    }
    throw error;
  }
};

// Login después de sincronización
export const loginAfterSync = async (token: string, user: any) => {
  try {
    const response = await axiosInstance.post('/clientes/login/auth0', {
      token,
      email: user.email,
      auth0Id: user.sub,
    });

    // Guardar datos del usuario y token
    localStorage.setItem('user', JSON.stringify(response.data.usuario));
    localStorage.setItem('token', response.data.token);

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
