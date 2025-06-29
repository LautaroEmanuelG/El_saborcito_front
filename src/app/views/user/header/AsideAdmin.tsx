// /shared/components/AsideAdmin.tsx
import { useState, useEffect } from 'react';
import CollapsibleNavItem from './CollapsibleNavItem';
import IconoMenuHamburguesa from '../../../../assets/svgs/icons/IconoMenuHamburguesa';
import { NavItemStructure } from '../../../../shared/components/AsideAdmin/NavItemTypes';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useEmpleado } from '../../../../shared/providers/EmpleadoProvider';
import { getNavigationByRole } from '../../../../shared/config/navigationConfig';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';

export const AsideAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItemStructure[]>([]);
  const { rol, email, isLoading } = useAuth();
  const { empleadoAutenticado } = useEmpleado();

  // 🚀 **LÓGICA HÍBRIDA: DETECTAR EMPLEADOS Y CLIENTES**
  const finalRol = empleadoAutenticado?.rol || rol;
  const finalEmail = empleadoAutenticado?.email || email;

  useEffect(() => {
    if (finalRol && !isLoading) {
      const navigation = getNavigationByRole(finalRol);
      setNavItems(navigation);
    } else {
      setNavItems([]);
    }
  }, [finalRol, isLoading]);

  const toggleMenu = () => setIsOpen((o) => !o);
  const closeMenu = () => setIsOpen(false);

  // Mostrar loading si aún se está obteniendo el rol
  if (isLoading) {
    return (
      <aside className="bg-primary text-negro xl:flex flex-col shrink-0 w-72 h-full min-h-screen fixed xl:sticky top-0 shadow-xl xl:shadow-none z-50 p-4 pt-6">
        <LoadingSpinner message="Cargando menú..." size="medium" />
      </aside>
    );
  }

  // Si no hay rol o no hay navegación disponible
  if (!finalRol || navItems.length === 0) {
    return (
      <aside className="bg-primary text-negro xl:flex flex-col shrink-0 w-72 h-full min-h-screen fixed xl:sticky top-0 shadow-xl xl:shadow-none z-50 p-4 pt-6">
        <div className="flex items-center justify-center mt-12">
          <p className="text-negro text-center">No hay opciones disponibles para tu perfil</p>
        </div>
      </aside>
    );
  }

  return (
    <>
      <button
        className={`fixed top-20 mt-1 left-1 lg:mt-0 lg:top-6 xl:hidden text-negro text-xl p-2 z-30 rounded shadow-lg lg:shadow-none focus:outline-none bg-primary ${isOpen ? 'bg-primarydark' : ''}`}
        onClick={toggleMenu}
        aria-label="Abrir menú"
        aria-expanded={isOpen}
      >
        <IconoMenuHamburguesa />
      </button>
      <aside
        className={`bg-primary text-negro transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0 transition-transform duration-300 ease-in-out xl:flex flex-col shrink-0 w-72 h-full min-h-screen fixed xl:sticky top-0 shadow-xl xl:shadow-none z-[41] p-4 pt-6 overflow-y-auto`}
      >
        {/* Mostrar información del usuario actual */}
        <div className="mb-4 p-4 bg-blanco rounded-lg">
          <div className="text-md font-bold text-negro mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm opacity-75">Perfil:</span>
              <span className="px-2 py-1 bg-primary rounded-full text-blanco text-xs font-bold">
                {finalRol}
              </span>
            </div>
            {finalEmail && (
              <div className="text-sm opacity-75 truncate" title={finalEmail}>
                👤 {finalEmail}
              </div>
            )}
          </div>
        </div>

        <ul className="mt-8 xl:mt-0">
          {navItems.map((navItem) => (
            <CollapsibleNavItem key={navItem.title} itemData={navItem} onLinkClick={closeMenu} />
          ))}
        </ul>
      </aside>
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-50 xl:hidden z-40" onClick={closeMenu}></div>
      )}
    </>
  );
};
