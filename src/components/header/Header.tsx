import { useState } from 'react';
import { Buscador } from './Buscador';
import IconoCarrito from '../iconos/IconoCarrito';
import IconoLoggin from '../iconos/IconoLoggin';
import IconoLogoSaborcito from '../iconos/IconoLogoSaborcito';
import { LoginModal } from '../LoginModal'; // Import the LoginModal

type Props = {
  totalItems: number;
};

export const Header = ({ totalItems }: Props) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const toggleLoginModal = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  return (
    <header className="bg-primary flex w-full text-primary-foreground py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        <a href="#" className="flex items-center gap-4">
          <IconoLogoSaborcito />
          <span className="text-2xl font-bold text-white">El Saborcito</span>
        </a>
        <div className="relative flex-1 max-w-md">
          <Buscador />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLoginModal} className="rounded-full hover:bg-blanco">
            <IconoLoggin />
          </button>
          {totalItems > 0 ? (
            <div className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco">
              <button className="rounded-full">
                <IconoCarrito />
                <div className="absolute text-blanco -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-bold hover:bg-blanco hover:text-primary">
                  {totalItems}
                </div>
              </button>
            </div>
          ) : (
            <div className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco">
              <button className="rounded-full">
                <IconoCarrito />
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Render the login modal */}
      <LoginModal isOpen={isLoginOpen} onClose={toggleLoginModal} />
    </header>
  );
};
