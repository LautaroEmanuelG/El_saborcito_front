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

  return (
    <>
      <button
        className={`fixed top-22 mt-1 left-1 lg:mt-0 lg:top-6 xl:hidden text-negro text-2xl p-2 z-30 rounded shadow-lg lg:shadow-none focus:outline-none bg-primary ${isOpen ? 'bg-primarydark' : ''}`}
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
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/20">
          {user?.imagen ? (
            <img src={user.imagen} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
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

        {/* Menú de navegación */}
        <nav className="mt-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full text-left px-4 py-2 text-white hover:bg-primarydark rounded transition-colors duration-200 ${
                    activeView === item.id ? 'bg-primarydark' : ''
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-50 xl:hidden z-40" onClick={closeMenu}></div>
      )}
    </>
  );
};
