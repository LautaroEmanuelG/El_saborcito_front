import { useState } from 'react';
import CollapsibleNavItem from './CollapsibleNavItem'; // Importar el nuevo componente
import IconoMenuHamburguesa from '../../../../assets/svgs/icons/IconoMenuHamburguesa';

export interface SubItem {
  to: string;
  label: string;
  hasActions?: boolean;
}

export interface NavItemStructure {
  title: string;
  subItems: SubItem[];
}

// Datos para la navegación del aside
const NAV_DATA: NavItemStructure[] = [
  {
    title: 'Estadística e Informes',
    subItems: [{ to: '/admin/historial', label: 'Control' }],
  },
  {
    title: 'Informes estadísticos',
    subItems: [
      { to: '/admin/informes/ranking-productos', label: 'Ranking Producto' },
      { to: '/admin/informes/ranking-clientes', label: 'Ranking Cliente' },
      { to: '/admin/informes/movimientos-monetarios', label: 'Movimiento Monetario' },
    ],
  },
  {
    title: 'Gestión de Contenido',
    subItems: [
      { to: '/admin/articulos', label: 'Artículos Manufacturados' },
      { to: '/admin/categorias-articulos', label: 'Categorias Artículos' },
      { to: '/admin/subcategorias-articulos', label: 'Subcategorias Artículos' },
      { to: '/admin/insumos', label: 'Insumos' },
      { to: '/admin/subcategorias-insumos', label: 'Subcategorias Insumos' },
    ],
  },
  {
    title: 'Cocina',
    subItems: [
      { to: '/admin/cocina', label: 'Administrar Cocina' },
      { to: '/admin/historial-cocina', label: 'Historial' },
    ],
  },
  {
    title: 'Finanzas',
    subItems: [
      { to: '/admin/reportes', label: 'Reportes' },
      { to: '/admin/control', label: 'Libros Contables' },
    ],
  },
];

export const AsideAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="fixed top-4 right-4 md:hidden text-negro text-2xl p-2 z-30 bg-blanco rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={toggleMenu}
        aria-label="Abrir menú"
        aria-expanded={isOpen}
      >
        <IconoMenuHamburguesa />
      </button>
      <aside
        className={`bg-primary text-negro transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out md:flex flex-col shrink-0 w-72 h-full min-h-screen fixed md:sticky top-0 shadow-xl md:shadow-none z-20 p-4 pt-6 overflow-y-auto`}
      >
        <ul className="mt-12 md:mt-0">
          {NAV_DATA.map((navItem) => (
            <CollapsibleNavItem key={navItem.title} itemData={navItem} onLinkClick={closeMenu} />
          ))}
        </ul>
      </aside>
      {/* Overlay for mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-50 md:hidden z-10" onClick={closeMenu}></div>
      )}
      {/* No renderices la tabla aquí, solo deja el menú y navegación */}
      {/* El AsideAdmin ya está correcto, solo muestra el menú y navega por rutas */}
    </>
  );
};
