import { Navigate, Route } from 'react-router-dom';
import { RegistroView } from '../../modules/HU1_2_Registro_Login/components/registro/RegistroView';

import { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = localStorage.getItem('rol') === 'Admin'; // Verifica si el rol es Admin

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;

export const PublicRoutes = () => {
  return (
    <>
      <Route path="/registro" element={<RegistroView />} />
      {/* ... otras rutas públicas ... */}
    </>
  );
};
