// src/shared/config/navigationConfig.ts
import { Rol } from '../../types/Rol';
import { NavItemStructure } from '../components/AsideAdmin/NavItemTypes';

export const getNavigationByRole = (rol: Rol): NavItemStructure[] => {
  switch (rol) {
    case Rol.ADMIN:
      return ADMIN_NAV;
    case Rol.CAJERO:
      return CAJERO_NAV;
    case Rol.DELIVERY:
      return DELIVERY_NAV;
    case Rol.COCINERO:
      return COCINERO_NAV;
    default:
      return [];
  }
};

// Admin: acceso completo
const ADMIN_NAV: NavItemStructure[] = [
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
          { to: '/admin/compra-insumos', label: 'Compra de Insumos' },
          { to: '/admin/control-stock-insumos', label: 'Control Stock Insumos' },
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
    title: 'Gestión de Personal',
    subItems: [
      { to: '/admin/empleados', label: 'Empleados' },
      { to: '/admin/clientes', label: 'Clientes' },
    ],
  },
];

// Cajero: solo recepción
const CAJERO_NAV: NavItemStructure[] = [
  {
    title: 'Recepción y Gestión',
    subItems: [{ to: '/admin/recepcion', label: 'Recepción de Pedidos' }],
  },
];

// Delivery: solo delivery
const DELIVERY_NAV: NavItemStructure[] = [
  {
    title: 'Recepción y Gestión',
    subItems: [{ to: '/admin/delivery', label: 'Delivery' }],
  },
];

// Cocinero: contenido y cocina
const COCINERO_NAV: NavItemStructure[] = [
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
          { to: '/admin/compra-insumos', label: 'Compra de Insumos' },
          { to: '/admin/control-stock-insumos', label: 'Control Stock Insumos' },
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
];
