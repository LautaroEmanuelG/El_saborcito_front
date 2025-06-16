import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CarritoContext } from '../../../../shared/providers/CarritoProvider';
import { useProductStore } from '../../../../shared/providers/ProductProvider';
import { useUser } from '../../../../shared/providers/UserProvider';
import IconoLogoSaborcito from '../../../../assets/svgs/icons/IconoLogoSaborcito';
import IconoLoggin from '../../../../assets/svgs/icons/IconoLoggin';
import IconoCarrito from '../../../../assets/svgs/icons/IconoCarrito';
import IconoMenuHamburguesa from '../../../../assets/svgs/icons/IconoMenuHamburguesa';
import { LoginModal } from '../../../../modules/HU1_2_Registro_Login/components/loggin/LoginModal';
import { RegistroModal } from '../../../../modules/HU1_2_Registro_Login/components/registro/RegistroModal';
import { Buscador } from '../../../../modules/HU9_10_Landing_Busqueda/Buscador';
import { useAuth0 } from '@auth0/auth0-react';
import { syncUserWithBackend, loginAfterSync } from '../../../../shared/services/auth0SyncService';

type Props = {
  onSearch?: (query: string | string[]) => void; // Modificado para aceptar string o string[]
};

export const Header = ({ onSearch }: Props) => {
  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverCarrito, setHoverCarrito] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegistroOpen, setIsRegistroOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, setUser, logout } = useUser();
  const {
    user: auth0User,
    isAuthenticated,
    getAccessTokenSilently,
    logout: auth0Logout,
  } = useAuth0();

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

  const toggleRegistroModal = () => {
    setIsRegistroOpen(!isRegistroOpen);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
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
  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const token = await getAccessTokenSilently();

          // Primero sincronizamos el usuario
          await syncUserWithBackend(auth0User);

          // Luego hacemos login para obtener el token JWT
          const loginResponse = await loginAfterSync(token, auth0User);

          if (loginResponse.usuario) {
            setUser(loginResponse.usuario);
          }
        } catch (error: any) {
          console.error('Error sincronizando usuario con backend:', error);
          // Si hay un error, cerramos sesión
          auth0Logout({ logoutParams: { returnTo: window.location.origin } });
        }
      }
    };
    syncUser();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, setUser, auth0Logout]);

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
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-white hover:text-blanco"
                  onClick={toggleUserMenu}
                >
                  {auth0User?.picture ? (
                    <img src={auth0User.picture} alt="Avatar" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-primary font-bold">
                        {user.nombre?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span>{user.nombre}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      to="/perfil"
                      state={{ activeView: 'pedidos' }}
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Historial de Compras
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
                onMouseEnter={() => setHoverLogin(true)}
                onMouseLeave={() => setHoverLogin(false)}
                onClick={toggleLoginModal}
              >
                <IconoLoggin color={hoverLogin ? '#E11D48' : 'white'} />
              </button>
            )}

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

      <LoginModal
        isOpen={isLoginOpen}
        onClose={toggleLoginModal}
        onOpenRegistro={toggleRegistroModal}
      />
      <RegistroModal isOpen={isRegistroOpen} onClose={toggleRegistroModal} />

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

        {/* Menú móvil para usuario */}
        {user ? (
          <div className="p-4 border-t border-gray-700">
            <div className="mb-4 flex items-center gap-2">
              {auth0User?.picture ? (
                <img src={auth0User.picture} alt="Avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-primary font-bold">
                    {user.nombre?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-lg font-semibold">{user.nombre}</span>
            </div>
            <Link to="/perfil" className="block py-2 hover:bg-gray-700" onClick={toggleMenu}>
              Mi Perfil
            </Link>
            <Link
              to="/perfil"
              state={{ activeView: 'pedidos' }}
              className="block py-2 hover:bg-gray-700"
              onClick={toggleMenu}
            >
              Historial de Compras
            </Link>
            <button
              onClick={() => {
                logout();
                toggleMenu();
              }}
              className="block w-full text-left py-2 hover:bg-gray-700"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              toggleMenu();
              toggleLoginModal();
            }}
            className="block w-full text-left p-4 hover:bg-gray-700"
          >
            Iniciar Sesión
          </button>
        )}
      </div>

      {menuOpen && (
        <div onClick={toggleMenu} className="fixed inset-0 bg-black opacity-50 z-10"></div>
      )}
    </>
  );
};
