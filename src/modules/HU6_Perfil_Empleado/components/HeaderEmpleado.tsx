import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IconoLogoSaborcito from '../../../assets/svgs/icons/IconoLogoSaborcito';
import { IconoCerrar } from '../../../assets/svgs/icons/IconoCerrar';
import { ModalConfirm } from '../../../shared/components/utils/ModalConfirm';
import { useEmpleado } from '../../../shared/providers/EmpleadoProvider';

export const HeaderEmpleado = () => {
  const [hoverLogout, setHoverLogout] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const navigate = useNavigate();
  const { logoutEmpleado } = useEmpleado();

  const toggleLogoutModal = () => {
    setIsLogoutOpen(!isLogoutOpen);
  };

  const handleCerrarSesion = () => {
    logoutEmpleado();
    navigate('/');
  };

  return (
    <>
      <header className="bg-primary flex w-full h-22 text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <Link to="/empleado/perfil" className="flex items-center gap-4">
            <IconoLogoSaborcito />
            <span className="text-2xl font-bold text-white">El Saborcito - Panel Empleado</span>
          </Link>

          <div className="absolute top-4 right-14 md:right-4 md:flex items-center gap-4">
            <button
              className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
              onMouseEnter={() => setHoverLogout(true)}
              onMouseLeave={() => setHoverLogout(false)}
              onClick={toggleLogoutModal}
              title="Cerrar Sesión"
            >
              <IconoCerrar color={hoverLogout ? '#E11D48' : 'white'} />
            </button>
          </div>
        </div>
      </header>

      <ModalConfirm
        isOpen={isLogoutOpen}
        setIsOpen={setIsLogoutOpen}
        onConfirm={handleCerrarSesion}
        title="Cerrar Sesión"
        message="¿Estás seguro que deseas cerrar sesión?"
        confirmText="Cerrar Sesión"
      />
    </>
  );
};
