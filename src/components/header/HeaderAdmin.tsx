import { useState } from 'react';
import IconoLoggin from '../iconos/IconoLoggin';
import IconoLogoSaborcito from '../iconos/IconoLogoSaborcito';
import { LoginModal } from '../loggin/LoginModal';
import { Link } from 'react-router-dom';

export const HeaderAdmin = () => {
  const [hoverLogin, setHoverLogin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const toggleLoginModal = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  return (
    <>
      <header className="bg-primary flex w-full h-22 text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <Link to="/admin" className="flex items-center gap-4">
            <IconoLogoSaborcito />
            <span className="text-2xl font-bold text-white">El Saborcito</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <button
              className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
              onMouseEnter={() => setHoverLogin(true)}
              onMouseLeave={() => setHoverLogin(false)}
              onClick={toggleLoginModal}
            >
              <IconoLoggin color={hoverLogin ? '#E11D48' : 'white'} />
            </button>
          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={toggleLoginModal} />
    </>
  );
};