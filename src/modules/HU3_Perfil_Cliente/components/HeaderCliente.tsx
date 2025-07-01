import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import IconoLogoSaborcito from '../../../assets/svgs/icons/IconoLogoSaborcito';
import { IconoCerrar } from '../../../assets/svgs/icons/IconoCerrar';
import { ModalConfirm } from '../../../shared/components/utils/ModalConfirm';
import { useUser } from '../../../shared/providers/UserProvider';
import BackButton from '../../../app/views/user/header/BackButton';
import { useGlobalLogout } from '../../../shared/hooks/useGlobalLogout';

export const HeaderCliente = () => {
  const [hoverLogin, setHoverLogin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useUser();
  const globalLogout = useGlobalLogout();

  const toggleLoginModal = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  const handleCerrarSesion = () => {
    globalLogout();
  };

  return (
    <>
      <header className="bg-primary flex w-full h-22 text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            {location.pathname !== '/cliente/perfil' && <BackButton />}
            <Link to="/cliente/perfil" className="flex items-center gap-4">
              <IconoLogoSaborcito />
              <span className="text-2xl font-bold text-white">El Saborcito</span>
            </Link>
          </div>

          <div className="absolute top-4 right-14 md:right-4 md:flex items-center gap-4">
            <button
              className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
              onMouseEnter={() => setHoverLogin(true)}
              onMouseLeave={() => setHoverLogin(false)}
              onClick={toggleLoginModal}
            >
              <IconoCerrar color={hoverLogin ? '#E11D48' : 'white'} />
            </button>
          </div>
        </div>
      </header>

      <ModalConfirm
        isOpen={isLoginOpen}
        setIsOpen={setIsLoginOpen}
        onConfirm={handleCerrarSesion}
        title="Cerrar Sesión"
        message="¿Estás seguro que deseas cerrar sesión?"
        confirmText="Cerrar Sesión"
      />
    </>
  );
};
