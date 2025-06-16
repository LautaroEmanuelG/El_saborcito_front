import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { syncUserWithBackend, loginAfterSync } from '../../shared/services/auth0SyncService';
import { useUser } from '../../shared/providers/UserProvider';
import axios from 'axios';

export const CallbackPage = () => {
  const { isLoading, error, isAuthenticated, user: auth0User, getAccessTokenSilently } = useAuth0();
  const { setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      if (!isLoading && isAuthenticated && auth0User) {
        try {
          // 1. Sincroniza el usuario con el backend (crea o vincula)
          await syncUserWithBackend(auth0User);

          // 2. Obtén el token de Auth0
          const token = await getAccessTokenSilently();

          // 3. Haz login en tu backend para obtener el JWT propio
          const loginResponse = await loginAfterSync(token, auth0User);

          if (loginResponse.usuario) {
            setUser(loginResponse.usuario);
            // Guarda el token si no lo hace el servicio
            localStorage.setItem('token', loginResponse.token);
            localStorage.setItem('user', JSON.stringify(loginResponse.usuario));
          }
          navigate('/'); // Redirige a home
        } catch (e: any) {
          // Manejo de errores claros
          if (axios.isAxiosError(e) && e.response?.data?.message) {
            if (e.response.data.message.includes('Email ya registrado con otro método')) {
              alert(
                'Este email ya está registrado con otro método. Por favor, inicia sesión con tu contraseña o recupérala.'
              );
              // Aquí puedes abrir el modal de login manual si lo deseas
              return;
            }
          }
          alert('Ocurrió un error inesperado. Intenta nuevamente.');
        }
      }
    };
    handleAuth();
  }, [isLoading, isAuthenticated, auth0User, getAccessTokenSilently, setUser, navigate]);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Procesando autenticación...</div>;
};
