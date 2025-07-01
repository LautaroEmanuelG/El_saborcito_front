import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../shared/providers/UserProvider';
import IconoMenuHamburguesa from '../../../assets/svgs/icons/IconoMenuHamburguesa';
import IconoUsuario from '../../../assets/svgs/icons/IconoUsuario';
import IconoPassword from '../../../assets/svgs/icons/IconoPassword';
import IconoUbicacion from '../../../assets/svgs/icons/IconoUbicacion';
import { obtenerNombreRol } from '../logic';
import { VistaPerfilEmpleado } from '../model';

interface AsideEmpleadoProps {
  onMenuSelect: (view: VistaPerfilEmpleado) => void;
  activeView: VistaPerfilEmpleado;
}

export const AsideEmpleado = ({ onMenuSelect, activeView }: AsideEmpleadoProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isPerfilExpanded, setIsPerfilExpanded] = useState(true);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const shouldShowAreaTrabajo = (): boolean => {
    if (!user || !user.rol) return false;
    // Mostrar 'Mi Área de Trabajo' para todos los roles excepto CLIENTE
    const rolesExcluidos = ['CLIENTE'];
    return !rolesExcluidos.includes(user.rol);
  };

  const handleAreaTrabajo = () => {
    if (!user) return;

    closeMenu();
    switch (user.rol) {
      case 'ADMIN':
        navigate('/admin/empleados');
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
  };

  const handleMenuClick = (view: VistaPerfilEmpleado) => {
    onMenuSelect(view);
    closeMenu();
  };

  const togglePerfil = () => {
    setIsPerfilExpanded(!isPerfilExpanded);
  };

  const menuItems = [
    {
      id: VistaPerfilEmpleado.DATOS,
      label: 'Mis Datos Personales',
      icon: <IconoUsuario className="w-5 h-5" />,
      onClick: () => handleMenuClick(VistaPerfilEmpleado.DATOS),
    },
    {
      id: VistaPerfilEmpleado.CONTRASEÑA,
      label: 'Cambiar Contraseña',
      icon: <IconoPassword className="w-5 h-5" />,
      onClick: () => handleMenuClick(VistaPerfilEmpleado.CONTRASEÑA),
    },
  ] as const;

  if (!user) {
    return (
      <div className="bg-primary text-negro xl:flex flex-col shrink-0 w-72 h-full min-h-screen fixed xl:sticky top-0 shadow-xl xl:shadow-none z-50 p-4 pt-6">
        <div className="flex items-center justify-center mt-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2 text-white text-sm">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        className={`fixed top-22 mt-1 left-1 lg:mt-0 lg:top-6 xl:hidden text-negro text-xl p-2 z-30 rounded shadow-lg lg:shadow-none focus:outline-none bg-primary ${isOpen ? 'bg-primarydark' : ''}`}
        onClick={toggleMenu}
        aria-label="Abrir menú"
        aria-expanded={isOpen}
      >
        <IconoMenuHamburguesa />
      </button>

      <aside
        className={`bg-primary text-negro transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0 transition-transform duration-300 ease-in-out xl:flex flex-col shrink-0 w-72 h-full min-h-screen fixed xl:sticky top-0 shadow-xl xl:shadow-none z-50 p-4 pt-6 overflow-y-auto`}
      >
        {/* Perfil del empleado */}
        <div className="flex flex-col gap-3 px-4 py-6 border-b border-white/20 mt-12 xl:mt-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <IconoUsuario className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <p className="font-medium">
                {user.nombre} {user.apellido}
              </p>
              <p className="text-sm text-white/70">{user.email}</p>
            </div>
          </div>

          {/* Información del empleado */}
          <div className="text-white text-sm space-y-1">
            <p>
              <span className="font-medium">Rol:</span>{' '}
              {user.rol ? obtenerNombreRol(user.rol) : 'Sin rol'}
            </p>
            {user.telefono && (
              <p>
                <span className="font-medium">Teléfono:</span> {user.telefono}
              </p>
            )}
          </div>
        </div>

        {/* Menú de navegación con estilo de AsideAdmin */}
        <ul className="mt-6">
          <li className="mb-3 bg-blanco rounded-lg shadow-md overflow-hidden">
            <button
              type="button"
              onClick={togglePerfil}
              className={`w-full flex items-center justify-between p-3 text-left font-bold text-xl transition-colors duration-150 ease-in-out focus:outline-none ${isPerfilExpanded ? 'text-primary' : 'text-negro'}`}
              aria-expanded={isPerfilExpanded}
            >
              <span>Mi Perfil</span>
              <span
                className={`transform transition-transform duration-200 ease-in-out ${isPerfilExpanded ? 'rotate-180 text-primary' : 'rotate-0 text-negro'}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            {isPerfilExpanded && (
              <ul className="pl-6 pr-2 px-1 border-t border-gray-200">
                {menuItems.map((item) => (
                  <li key={item.id} className="my-1.5">
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-md transition-colors duration-150 ease-in-out ${
                        activeView === item.id
                          ? 'bg-primary text-blanco font-bold shadow'
                          : 'hover:bg-gray-100 text-negro'
                      }`}
                    >
                      <button
                        onClick={item.onClick}
                        className="flex items-center gap-3 w-full text-md font-medium text-left"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    </div>
                  </li>
                ))}

                {shouldShowAreaTrabajo() && (
                  <li className="py-2">
                    <hr className="border-gray-200" />
                  </li>
                )}

                {shouldShowAreaTrabajo() && (
                  <li className="my-1.5">
                    <div className="flex items-center justify-between p-2.5 rounded-md transition-colors duration-150 ease-in-out hover:bg-gray-100 text-negro">
                      <button
                        onClick={handleAreaTrabajo}
                        className="flex items-center gap-3 w-full text-md font-medium text-left"
                        title={`Ir al área de trabajo de ${user.rol}`}
                      >
                        <IconoUbicacion />
                        <span>Mi Área de Trabajo</span>
                      </button>
                    </div>
                  </li>
                )}
              </ul>
            )}
          </li>
        </ul>

        {/* Información adicional */}
        <div className="mt-auto pt-6 border-t border-white/20">
          <div className="text-white/70 text-xs px-4">
            <p>Panel de Empleado</p>
            <p>El Saborcito</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-yellow-300 text-xs">
                <p>Rol: {user.rol}</p>
                <p>Mostrar Área: {shouldShowAreaTrabajo() ? 'Sí' : 'No'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-50 xl:hidden z-40" onClick={closeMenu}></div>
      )}
    </>
  );
};
