import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CarritoContext } from '../../../../shared/providers/CarritoProvider';
import { useProductStore } from '../../../../shared/providers/ProductProvider';
import IconoLogoSaborcito from '../../../../assets/svgs/icons/IconoLogoSaborcito';
import IconoLoggin from '../../../../assets/svgs/icons/IconoLoggin';
import IconoCarrito from '../../../../assets/svgs/icons/IconoCarrito';
import IconoMenuHamburguesa from '../../../../assets/svgs/icons/IconoMenuHamburguesa';
import { LoginModal } from '../../../../shared/components/loggin/LoginModal';
import { Buscador } from '../../../../modules/HU9_10_Landing_Busqueda/Buscador';

type Props = {
  onSearch?: (query: string | string[]) => void; // Modificado para aceptar string o string[]
};

export const Header = ({ onSearch }: Props) => {
  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverCarrito, setHoverCarrito] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const carritoContext = useContext(CarritoContext);
  if (!carritoContext) {
    throw new Error('Header must be used within a CarritoProvider');
  }
  const { carrito, promocionesEnCarrito } = carritoContext;
  const totalItems =
    (carrito?.reduce?.((total, product) => total + (product?.cantidad ?? 0), 0) ?? 0) +
    (promocionesEnCarrito?.reduce?.((total, promo) => total + (promo?.cantidad ?? 0), 0) ?? 0);

  const toggleLoginModal = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Acceder al resetFilters desde el store
  const { resetFilters } = useProductStore();

  const handleLogoClick = () => {
    // Limpiar búsqueda y resetear los filtros cuando se hace clic en el logo
    if (onSearch) {
      onSearch('');
    }
    // También resetear los filtros directamente en el store global
    resetFilters();
  };

  const handleLogoClickAndToggleMenu = () => {
    handleLogoClick(); // Limpiar búsqueda
    toggleMenu(); // Cerrar menú
  };

  return (
    <>
      {/* Ocultar el header cuando el menú está abierto */}
      <header
        className={`bg-primary sticky top-0 z-50 flex w-full text-primary-foreground py-4 shadow-md `}
      >
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6 gap-12">
          <Link to="/" className="flex items-center gap-4" onClick={handleLogoClick}>
            <IconoLogoSaborcito />
            <span className="text-2xl font-bold text-white">El Saborcito</span>
          </Link>

          <div className="relative flex-1 max-w-md hidden md:block">
            {onSearch && <Buscador onSearch={onSearch} />}
          </div>

          {/* Iconos de login y carrito siempre visibles en desktop */}
          <div className="hidden md:flex items-center gap-4">
            <button
              className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
              onMouseEnter={() => setHoverLogin(true)}
              onMouseLeave={() => setHoverLogin(false)}
              onClick={toggleLoginModal}
            >
              <IconoLoggin color={hoverLogin ? '#E11D48' : 'white'} />
            </button>

            {window.location.pathname !== '/carrito' && totalItems > 0 ? (
              <Link
                to="/carrito"
                className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
                onMouseEnter={() => setHoverCarrito(true)}
                onMouseLeave={() => setHoverCarrito(false)}
              >
                <IconoCarrito color={hoverCarrito ? '#E11D48' : 'white'} />
                <div className="absolute text-blanco -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-bold hover:bg-blanco hover:text-primary ">
                  {totalItems}
                </div>
              </Link>
            ) : null}
          </div>

          <button onClick={toggleMenu} className="md:hidden focus:outline-none z-20">
            {menuOpen ? null : <IconoMenuHamburguesa />}
          </button>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={toggleLoginModal} />

      <div
        className={`fixed top-0 left-0 h-full bg-primary text-white transition-transform duration-300 ease-in-out z-20 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } w-[265px] z-10`}
      >
        <div className="flex justify-between items-center p-4">
          <Link to="/" className="flex items-center gap-4" onClick={handleLogoClickAndToggleMenu}>
            <IconoLogoSaborcito />
            <span className="text-2xl font-bold text-white">El Saborcito</span>
          </Link>
          <button
            className="absolute font-bold top-2 right-2 text-white text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
            onClick={toggleMenu}
          >
            X
          </button>
        </div>

        <div className="p-4">{onSearch && <Buscador onSearch={onSearch} />}</div>

        {/* Iconos solo se muestran si el menú está abierto */}
        {menuOpen && (
          <div className="p-4 border-t border-white mt-6 flex justify-around">
            <button
              className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
              onClick={toggleLoginModal}
            >
              <IconoLoggin color="white" />
            </button>

            {totalItems > 0 ? (
              <Link
                to="/carrito"
                className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
              >
                <IconoCarrito color="white" />
                <div className="absolute text-blanco -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-bold hover:bg-blanco hover:text-primary">
                  {totalItems}
                </div>
              </Link>
            ) : null}
          </div>
        )}
      </div>

      {menuOpen && (
        <div onClick={toggleMenu} className="fixed inset-0 bg-black opacity-50 z-10"></div>
      )}
    </>
  );
};
