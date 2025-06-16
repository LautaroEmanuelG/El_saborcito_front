import { useState } from 'react';
import CollapsibleNavItem from './CollapsibleNavItem';
import IconoMenuHamburguesa from '../../../../assets/svgs/icons/IconoMenuHamburguesa';

export interface SubItem {
  to: string;
  label: string;
  hasActions?: boolean;
}

export interface NavItemStructure {
  title: string;
  subItems?: SubItem[];
  children?: NavItemStructure[]; // Nuevo: permite submenús anidados
}

// Datos para la navegación del aside
const NAV_DATA: NavItemStructure[] = [
  {
    title: 'Usuario',
    subItems: [{ to: '/admin/mis-pedidos', label: 'Mis Pedidos' }],
  },
  {
    title: 'Recepción y Gestión',
    subItems: [
      { to: '/admin/recepcion', label: 'Recepción de Pedidos' },
      { to: '/admin/delivery', label: 'Delivery' },
    ],
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
    children: [
      {
        title: 'Artículos',
        subItems: [
          { to: '/admin/articulos', label: 'Artículos Manufacturados' },
          { to: '/admin/categorias-articulos', label: 'Categorías de Artículos' },
          { to: '/admin/subcategorias-articulos', label: 'Subcategorías de Artículos' },
        ],
      },
      {
        title: 'Insumos',
        subItems: [
          { to: '/admin/insumos', label: 'Insumos' },
          { to: '/admin/categorias-insumos', label: 'Categorías de Insumos' },
          { to: '/admin/subcategorias-insumos', label: 'Subcategorías de Insumos' },
          { to: '/admin/compra-insumos', label: 'Compra de Insumos' }, // Nuevo menú
        ],
      },
      {
        title: 'Promociones',
        subItems: [{ to: '/admin/promociones', label: 'Promociones' }],
      },
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
    subItems: [{ to: '/admin/control', label: 'Libros Contables' }],
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
        <ul className="mt-12 xl:mt-0">
          {NAV_DATA.map((navItem) => (
            <CollapsibleNavItem key={navItem.title} itemData={navItem} onLinkClick={closeMenu} />
          ))}
        </ul>
      </aside>
      {/* Overlay for mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-50 xl:hidden z-40" onClick={closeMenu}></div>
      )}
    </>
  );
};
