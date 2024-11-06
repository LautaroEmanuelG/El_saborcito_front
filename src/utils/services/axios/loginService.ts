import axiosInstance from './axiosConfig';

const API_BASE_URL = '/usuarios';

export const loginUsuario = async (email: string, contrasena: string) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('contraseña', contrasena);

  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};
export const registerUsuario = async (id: number) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/register`, null, {
    params: { id },
  });
  return response.data;
};

