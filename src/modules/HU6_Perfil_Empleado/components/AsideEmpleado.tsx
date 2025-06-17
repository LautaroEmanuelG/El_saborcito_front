import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmpleado } from '../../../shared/providers/EmpleadoProvider';
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
  const { empleadoAutenticado } = useEmpleado();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const menuItems = [
    {
      id: VistaPerfilEmpleado.DATOS,
      label: 'Mis Datos Personales',
      icon: <IconoUsuario className="w-5 h-5" />,
    },
    {
      id: VistaPerfilEmpleado.CONTRASEÑA,
      label: 'Cambiar Contraseña',
      icon: <IconoPassword className="w-5 h-5" />,
    },
  ] as const;

  const handleAreaTrabajo = () => {
    if (!empleadoAutenticado) return;

    closeMenu();
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
  };

  const handleMenuClick = (view: VistaPerfilEmpleado) => {
    onMenuSelect(view);
    closeMenu();
  };

  if (!empleadoAutenticado) {
    return <div>Cargando...</div>;
  }

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
        {/* Perfil del empleado */}
        <div className="flex flex-col gap-3 px-4 py-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <IconoUsuario className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <p className="font-medium">
                {empleadoAutenticado.nombre} {empleadoAutenticado.apellido}
              </p>
              <p className="text-sm text-white/70">{empleadoAutenticado.email}</p>
            </div>
          </div>

          {/* Información del empleado */}
          <div className="text-white text-sm space-y-1">
            <p>
              <span className="font-medium">Rol:</span> {obtenerNombreRol(empleadoAutenticado.rol)}
            </p>
            {empleadoAutenticado.telefono && (
              <p>
                <span className="font-medium">Teléfono:</span> {empleadoAutenticado.telefono}
              </p>
            )}
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="mt-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full text-left px-4 py-3 text-white hover:bg-primarydark rounded transition-colors duration-200 flex items-center gap-3 ${
                    activeView === item.id ? 'bg-primarydark' : ''
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}

            {/* Separador */}
            <li className="py-2">
              <hr className="border-white/20" />
            </li>

            {/* Botón para ir al área de trabajo */}
            <li>
              <button
                onClick={handleAreaTrabajo}
                className="w-full text-left px-4 py-3 text-white hover:bg-primarydark rounded transition-colors duration-200 flex items-center gap-3"
              >
                <IconoUbicacion />
                <span>Mi Área de Trabajo</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Información adicional */}
        <div className="mt-auto pt-6 border-t border-white/20">
          <div className="text-white/70 text-xs px-4">
            <p>Panel de Empleado</p>
            <p>El Saborcito</p>
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
