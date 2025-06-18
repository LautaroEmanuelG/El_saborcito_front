import { useState } from 'react';
import { useUser } from '../../../shared/providers/UserProvider';
import IconoMenuHamburguesa from '../../../assets/svgs/icons/IconoMenuHamburguesa';
import IconoUsuario from '../../../assets/svgs/icons/IconoUsuario';

interface AsideClienteProps {
  onMenuSelect: (view: 'datos' | 'cuenta' | 'direcciones' | 'pedidos') => void;
  activeView: 'datos' | 'cuenta' | 'direcciones' | 'pedidos';
}

export const AsideCliente = ({ onMenuSelect, activeView }: AsideClienteProps) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isPerfilExpanded, setIsPerfilExpanded] = useState(true);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { id: 'datos', label: 'Mis Datos' },
    { id: 'cuenta', label: 'Mi Cuenta' },
    { id: 'direcciones', label: 'Mis Direcciones' },
    { id: 'pedidos', label: 'Mis Pedidos' },
  ] as const;

  const handleMenuClick = (view: 'datos' | 'cuenta' | 'direcciones' | 'pedidos') => {
    onMenuSelect(view);
    closeMenu();
  };

  const togglePerfil = () => {
    setIsPerfilExpanded(!isPerfilExpanded);
  };

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
        {/* Perfil del usuario */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/20 mt-12 xl:mt-0">
          {user?.imagen?.url ? (
            <img
              src={user.imagen.url}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <IconoUsuario className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="text-white">
            <p className="font-medium">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-sm text-white/70">{user?.email}</p>
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
                        onClick={() => handleMenuClick(item.id)}
                        className="block w-full text-md font-medium text-left"
                      >
                        {item.label}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </aside>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-50 xl:hidden z-40" onClick={closeMenu}></div>
      )}
    </>
  );
};
