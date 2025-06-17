import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CarritoContext } from '../../../../shared/providers/CarritoProvider';
import { useProductStore } from '../../../../shared/providers/ProductProvider';
import { useUser } from '../../../../shared/providers/UserProvider';
import { useEmpleado } from '../../../../shared/providers/EmpleadoProvider';
import IconoLogoSaborcito from '../../../../assets/svgs/icons/IconoLogoSaborcito';
import IconoLoggin from '../../../../assets/svgs/icons/IconoLoggin';
import IconoCarrito from '../../../../assets/svgs/icons/IconoCarrito';
import IconoMenuHamburguesa from '../../../../assets/svgs/icons/IconoMenuHamburguesa';
import { LoginModal } from '../../../../modules/HU1_2_Registro_Login/components/loggin/LoginModal';
import { RegistroModal } from '../../../../modules/HU1_2_Registro_Login/components/registro/RegistroModal';
import { Buscador } from '../../../../modules/HU9_10_Landing_Busqueda/Buscador';
import { useAuth0 } from '@auth0/auth0-react';
import { syncUserWithBackend, loginAfterSync } from '../../../../shared/services/auth0SyncService';
import {
  loginEmpleado,
  validarLoginEmpleado,
  cambiarContraseñaEmpleado,
  validarCambioContraseña,
} from '../../../../modules/HU5_Login_Empleado/logic';
import { EstadoLoginEmpleado, Empleado } from '../../../../modules/HU5_Login_Empleado/model';
import { obtenerNombreRol } from '../../../../modules/HU6_Perfil_Empleado/logic';

type Props = {
  onSearch?: (query: string | string[]) => void; // Modificado para aceptar string o string[]
};

export const Header = ({ onSearch }: Props) => {
  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverCarrito, setHoverCarrito] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegistroOpen, setIsRegistroOpen] = useState(false);
  const [isLoginEmpleadoOpen, setIsLoginEmpleadoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Estados para login de empleados
  const [emailEmpleado, setEmailEmpleado] = useState('');
  const [contraseñaEmpleado, setContraseñaEmpleado] = useState('');
  const [errorEmpleado, setErrorEmpleado] = useState('');
  const [estadoEmpleado, setEstadoEmpleado] = useState<EstadoLoginEmpleado>(
    EstadoLoginEmpleado.INICIAL
  );
  const [attemptsEmpleado, setAttemptsEmpleado] = useState(0);
  const [isBlockedEmpleado, setIsBlockedEmpleado] = useState(false);
  const [blockTimeEmpleado, setBlockTimeEmpleado] = useState(0);

  // Estados para cambio de contraseña
  const [empleadoTemp, setEmpleadoTemp] = useState<Empleado | null>(null);
  const [contraseñaActual, setContraseñaActual] = useState('');
  const [nuevaContraseña, setNuevaContraseña] = useState('');
  const [confirmarNuevaContraseña, setConfirmarNuevaContraseña] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { user, setUser, logout } = useUser();
  const { empleadoAutenticado, setEmpleado: setEmpleadoAuth, logoutEmpleado } = useEmpleado();
  const navigate = useNavigate();
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

  const toggleLoginEmpleadoModal = () => {
    setIsLoginEmpleadoOpen(!isLoginEmpleadoOpen);
    // Limpiar estado cuando se cierre
    if (isLoginEmpleadoOpen) {
      limpiarFormularioEmpleado();
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Acceder al resetFilters desde el store
  const { resetFilters } = useProductStore();

  // Efecto para manejar el bloqueo de empleados
  useEffect(() => {
    let timer: number;
    if (isBlockedEmpleado && blockTimeEmpleado > 0) {
      timer = setInterval(() => {
        setBlockTimeEmpleado((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsBlockedEmpleado(false);
            setAttemptsEmpleado(0);
            setEstadoEmpleado(EstadoLoginEmpleado.INICIAL);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBlockedEmpleado, blockTimeEmpleado]);

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

  // Función para manejar login de empleados
  const handleLoginEmpleado = async () => {
    try {
      setEstadoEmpleado(EstadoLoginEmpleado.AUTENTICANDO);
      setErrorEmpleado('');

      // Validaciones
      const errorValidacion = validarLoginEmpleado({
        email: emailEmpleado,
        password: contraseñaEmpleado,
      });
      if (errorValidacion) {
        setErrorEmpleado(errorValidacion);
        setEstadoEmpleado(EstadoLoginEmpleado.ERROR);
        return;
      }

      const response = await loginEmpleado({ email: emailEmpleado, password: contraseñaEmpleado });

      if (response.cambioRequerido) {
        // Es primer login, necesita cambiar contraseña
        setEstadoEmpleado(EstadoLoginEmpleado.CAMBIO_CONTRASEÑA);
        setEmpleadoTemp(response.empleado);
        setContraseñaActual(contraseñaEmpleado); // Guardar la contraseña actual
      } else {
        // Login exitoso
        setEstadoEmpleado(EstadoLoginEmpleado.EXITOSO);
        if (response.token) {
          localStorage.setItem('empleadoToken', response.token);
          setEmpleadoAuth(response.empleado);

          // Redirigir siempre al perfil de empleado
          navigate('/empleado/perfil');
        }
        // Limpiar form y cerrar modal
        setEmailEmpleado('');
        setContraseñaEmpleado('');
        setIsLoginEmpleadoOpen(false);
      }
    } catch (error: any) {
      setErrorEmpleado(error.message);
      setEstadoEmpleado(EstadoLoginEmpleado.ERROR);
      setAttemptsEmpleado((prev) => prev + 1);

      if (attemptsEmpleado + 1 >= 3) {
        setIsBlockedEmpleado(true);
        setBlockTimeEmpleado(30);
        setEstadoEmpleado(EstadoLoginEmpleado.BLOQUEADO);
      }
    }
  };

  // Función para manejar cambio de contraseña
  const handleCambiarContraseña = async () => {
    try {
      setErrorEmpleado('');

      if (!empleadoTemp?.id) {
        setErrorEmpleado('Error: datos de empleado no válidos');
        return;
      }

      const datosValidacion = validarCambioContraseña({
        currentPassword: contraseñaActual,
        newPassword: nuevaContraseña,
        confirmPassword: confirmarNuevaContraseña,
      });

      if (datosValidacion) {
        setErrorEmpleado(datosValidacion);
        return;
      }

      setIsChangingPassword(true);

      await cambiarContraseñaEmpleado(empleadoTemp.id, {
        currentPassword: contraseñaActual,
        newPassword: nuevaContraseña,
        confirmPassword: confirmarNuevaContraseña,
      });

      // Contraseña cambiada exitosamente, hacer login automático
      try {
        const loginResponse = await loginEmpleado({
          email: emailEmpleado,
          password: nuevaContraseña,
        });

        if (loginResponse.token) {
          localStorage.setItem('empleadoToken', loginResponse.token);
          setEmpleadoAuth(loginResponse.empleado);

          // Redirigir siempre al perfil de empleado tras cambio de contraseña
          navigate('/empleado/perfil');
        }

        // Limpiar formulario y cerrar modal
        limpiarFormularioEmpleado();
        setIsLoginEmpleadoOpen(false);
      } catch (error: any) {
        setErrorEmpleado(
          'Contraseña cambiada, pero error en login automático. Intente ingresar manualmente.'
        );
      }
    } catch (error: any) {
      setErrorEmpleado(error.message);
      setEstadoEmpleado(EstadoLoginEmpleado.ERROR);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Función para limpiar el formulario
  const limpiarFormularioEmpleado = () => {
    setEmailEmpleado('');
    setContraseñaEmpleado('');
    setErrorEmpleado('');
    setEstadoEmpleado(EstadoLoginEmpleado.INICIAL);
    setAttemptsEmpleado(0);
    setEmpleadoTemp(null);
    setContraseñaActual('');
    setNuevaContraseña('');
    setConfirmarNuevaContraseña('');
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
            {/* Verificar si hay empleado autenticado primero */}
            {empleadoAutenticado ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-white hover:text-blanco"
                  onClick={toggleUserMenu}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {empleadoAutenticado.nombre?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>
                    {empleadoAutenticado.nombre} ({obtenerNombreRol(empleadoAutenticado.rol)})
                  </span>
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
                      to="/empleado/perfil"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        // Redirigir según el rol del empleado
                        switch (empleadoAutenticado.rol) {
                          case 'ADMIN':
                            navigate('/admin/historial');
                            break;
                          case 'CAJERO':
                            navigate('/admin/recepcion');
                            break;
                          case 'COCINERO':
                            navigate('/admin/cocina');
                            break;
                          case 'DELIVERY':
                            navigate('/admin/delivery');
                            break;
                          default:
                            navigate('/admin');
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Mi Área de Trabajo
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => {
                        logoutEmpleado();
                        setUserMenuOpen(false);
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : user ? (
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
                    <hr className="my-1 border-gray-200" />
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
              <div className="flex items-center gap-2">
                <button
                  className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
                  onMouseEnter={() => setHoverLogin(true)}
                  onMouseLeave={() => setHoverLogin(false)}
                  onClick={toggleLoginModal}
                  title="Iniciar Sesión Cliente"
                >
                  <IconoLoggin color={hoverLogin ? '#E11D48' : 'white'} />
                </button>
                <button
                  className="text-white text-sm font-medium hover:text-blanco px-2 py-1 rounded"
                  onClick={toggleLoginEmpleadoModal}
                  title="Acceso Empleados"
                >
                  Empleados
                </button>
              </div>
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

      {/* Modal de Login para Empleados */}
      {isLoginEmpleadoOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-[500px] max-h-[90vh] overflow-y-auto shadow-lg relative p-8">
            <button
              className="absolute font-bold top-6 right-8 text-negro text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
              onClick={toggleLoginEmpleadoModal}
            >
              X
            </button>

            {estadoEmpleado === EstadoLoginEmpleado.CAMBIO_CONTRASEÑA ? (
              // Formulario de cambio de contraseña
              <>
                <h2 className="text-2xl font-bold mb-6 text-negro">Cambiar Contraseña</h2>
                <p className="text-gris mb-6">
                  Como es tu primer acceso, debes establecer una nueva contraseña.
                </p>

                <div className="mb-4">
                  <label className="block text-negro text-sm font-bold mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    placeholder="Tu contraseña actual"
                    className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
                    value={contraseñaActual}
                    onChange={(e) => setContraseñaActual(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-negro text-sm font-bold mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 símbolo"
                    className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
                    value={nuevaContraseña}
                    onChange={(e) => setNuevaContraseña(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-negro text-sm font-bold mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Confirma tu nueva contraseña"
                    className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
                    value={confirmarNuevaContraseña}
                    onChange={(e) => setConfirmarNuevaContraseña(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>

                {errorEmpleado && <p className="text-primary mb-4">{errorEmpleado}</p>}

                <button
                  className={`w-full bg-primary text-blanco py-2 rounded-lg mb-2 ${
                    isChangingPassword ? 'opacity-50' : 'cursor-pointer'
                  }`}
                  onClick={handleCambiarContraseña}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                </button>

                <button
                  className="w-full bg-secondary text-negro py-2 rounded-lg cursor-pointer"
                  onClick={() => {
                    setEstadoEmpleado(EstadoLoginEmpleado.INICIAL);
                    setEmpleadoTemp(null);
                    setContraseñaActual('');
                    setNuevaContraseña('');
                    setConfirmarNuevaContraseña('');
                    setErrorEmpleado('');
                  }}
                >
                  Volver al Login
                </button>
              </>
            ) : (
              // Formulario de login normal
              <>
                <h2 className="text-2xl font-bold mb-6 text-negro">Acceso Empleados</h2>

                <div className="mb-4">
                  <label className="block text-negro text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Ingresa tu email"
                    className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
                    value={emailEmpleado}
                    onChange={(e) => setEmailEmpleado(e.target.value)}
                    disabled={
                      isBlockedEmpleado || estadoEmpleado === EstadoLoginEmpleado.AUTENTICANDO
                    }
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-negro text-sm font-bold mb-2">Contraseña</label>
                  <input
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
                    value={contraseñaEmpleado}
                    onChange={(e) => setContraseñaEmpleado(e.target.value)}
                    disabled={
                      isBlockedEmpleado || estadoEmpleado === EstadoLoginEmpleado.AUTENTICANDO
                    }
                  />
                </div>

                {errorEmpleado && <p className="text-primary mb-4">{errorEmpleado}</p>}

                <button
                  className={`w-full bg-primary text-blanco py-2 rounded-lg ${
                    isBlockedEmpleado || estadoEmpleado === EstadoLoginEmpleado.AUTENTICANDO
                      ? 'opacity-50'
                      : 'cursor-pointer'
                  }`}
                  onClick={handleLoginEmpleado}
                  disabled={
                    isBlockedEmpleado || estadoEmpleado === EstadoLoginEmpleado.AUTENTICANDO
                  }
                >
                  {isBlockedEmpleado
                    ? `Bloqueado (${blockTimeEmpleado}s)`
                    : estadoEmpleado === EstadoLoginEmpleado.AUTENTICANDO
                      ? 'Verificando...'
                      : 'Ingresar'}
                </button>

                <div className="mt-4 text-center text-sm text-gris">
                  <p>Solo para personal autorizado</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => {
                toggleMenu();
                toggleLoginModal();
              }}
              className="block w-full text-left py-2 hover:bg-gray-700"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                toggleMenu();
                toggleLoginEmpleadoModal();
              }}
              className="block w-full text-left py-2 hover:bg-gray-700"
            >
              Acceso Empleados
            </button>
          </div>
        )}
      </div>

      {menuOpen && (
        <div onClick={toggleMenu} className="fixed inset-0 bg-black opacity-50 z-10"></div>
      )}
    </>
  );
};
