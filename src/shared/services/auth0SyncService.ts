import { useAuth0 } from '@auth0/auth0-react';
import axiosInstance from './axiosConfig';

export const syncUserWithBackend = async (user: any, token: string) => {
  // Adapta los campos según lo que espera tu backend
  const userData = {
    sub: user.sub,
    email: user.email ?? '',
    givenName: user.given_name ?? user.name ?? '',
    familyName: user.family_name ?? '',
    domicilios: [], // Puedes dejar vacío o pedir más datos luego
  };

  const response = await axiosInstance.post('/clientes/login/auth0', userData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Puedes guardar el usuario y token de tu backend si lo necesitas
  localStorage.setItem('user', JSON.stringify(response.data.usuario));
  localStorage.setItem('token', response.data.token);

  return response.data;
};
