// /shared/components/AsideAdmin.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CollapsibleNavItem from './CollapsibleNavItem';
import IconoMenuHamburguesa from '../../../../assets/svgs/icons/IconoMenuHamburguesa';
import IconoUsuario from '../../../../assets/svgs/icons/IconoUsuario';
import { NavItemStructure } from '../../../../shared/components/AsideAdmin/NavItemTypes';
import { useEmpleado } from '../../../../shared/providers/EmpleadoProvider';
import { getNavigationByRole } from '../../../../shared/config/navigationConfig';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { obtenerNombreRol } from '../../../../modules/HU6_Perfil_Empleado/logic';
import { useRoleRedirection } from '../../../../shared/hooks/useRoleRedirection';

export const AsideAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItemStructure[]>([]);
  const { empleadoAutenticado, logoutEmpleado } = useEmpleado();
  const { redirectByRole } = useRoleRedirection();
  const navigate = useNavigate();

  useEffect(() => {
    if (empleadoAutenticado?.rol) {
      const navigation = getNavigationByRole(empleadoAutenticado.rol);
      setNavItems(navigation);
    } else {
      setNavItems([]);
    }
  }, [empleadoAutenticado]);

  const toggleMenu = () => setIsOpen((o) => !o);
  const closeMenu = () => setIsOpen(false);

  const handleMiPerfil = () => {
    navigate('/empleado/perfil');
    closeMenu();
  };

  const handleMiAreaTrabajo = () => {
    redirectByRole();
    closeMenu();
  };

  const handleCerrarSesion = () => {
    logoutEmpleado();
    navigate('/');
    closeMenu();
  };

  // Mostrar loading si aún no hay empleado autenticado
  if (!empleadoAutenticado) {
    return (
      <aside className="bg-primary text-negro xl:flex flex-col shrink-0 w-72 h-full min-h-screen fixed xl:sticky top-0 shadow-xl xl:shadow-none z-50 p-4 pt-6">
        <LoadingSpinner message="Cargando menú..." size="medium" />
      </aside>
    );
  }

  // Si no hay navegación disponible
  if (navItems.length === 0) {
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
        {/* Perfil del empleado - similar al dashboard de cliente */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/20 mt-12 xl:mt-0">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <IconoUsuario className="w-6 h-6 text-white" />
          </div>
          <div className="text-white">
            <p className="font-medium">
              {empleadoAutenticado.nombre} {empleadoAutenticado.apellido}
            </p>
            <p className="text-sm text-white/70">{empleadoAutenticado.email}</p>
            <p className="text-xs text-white/60 mt-1">
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                {obtenerNombreRol(empleadoAutenticado.rol)}
              </span>
            </p>
          </div>
        </div>

        {/* Botones de acción del empleado */}
        <div className="mt-4 px-4 space-y-2">
          <button
            onClick={handleMiPerfil}
            className="w-full text-left px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
          >
            Mi Perfil
          </button>
          <button
            onClick={handleMiAreaTrabajo}
            className="w-full text-left px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
          >
            Mi Área de Trabajo Principal
          </button>
          <button
            onClick={handleCerrarSesion}
            className="w-full text-left px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white transition-colors text-sm"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Navegación por rol */}
        <ul className="mt-6">
          {navItems.map((navItem) => (
            <CollapsibleNavItem key={navItem.title} itemData={navItem} onLinkClick={closeMenu} />
          ))}
        </ul>

        {/* Información adicional */}
        <div className="mt-auto pt-6 border-t border-white/20">
          <div className="text-white/70 text-xs px-4">
            <p>Panel de Administración</p>
            <p>El Saborcito</p>
          </div>
        </div>
      </aside>
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-50 xl:hidden z-40" onClick={closeMenu}></div>
      )}
    </>
  );
};
