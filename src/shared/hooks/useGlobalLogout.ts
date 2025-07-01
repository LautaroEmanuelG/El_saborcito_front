import { useUser } from '../providers/UserProvider';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export const useGlobalLogout = () => {
  const { logout } = useUser();
  const navigate = useNavigate();
  const { isAuthenticated, logout: auth0Logout } = useAuth0();
  const logoutInProgressRef = useRef(false);

  const globalLogout = async () => {
    logoutInProgressRef.current = true;
    try {
      logout();
      if (isAuthenticated) {
        await auth0Logout({
          logoutParams: { returnTo: window.location.origin },
        });
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error durante logout:', error);
      navigate('/');
    } finally {
      logoutInProgressRef.current = false;
    }
  };

  return globalLogout;
};
