import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { NavItemStructure } from './AsideAdmin';
import IconoVer from '../../../../assets/svgs/icons/IconoVer';
import IconoEditar from '../../../../assets/svgs/icons/IconoEditar';

interface CollapsibleNavItemProps {
  itemData: NavItemStructure;
  onLinkClick: () => void;
}

// Función recursiva para detectar si la ruta está activa en cualquier subitem o submenú anidado
function isRouteActive(item: NavItemStructure, pathname: string): boolean {
  if (item.subItems && item.subItems.some((subItem) => pathname.startsWith(subItem.to))) {
    return true;
  }
  if (item.children && item.children.some((child) => isRouteActive(child, pathname))) {
    return true;
  }
  return false;
}

const CollapsibleNavItem: React.FC<CollapsibleNavItemProps> = ({ itemData, onLinkClick }) => {
  const location = useLocation();
  // Usar la función recursiva para detectar si algún subitem o submenú anidado está activo
  const isAnySubItemActive = isRouteActive(itemData, location.pathname);

  // Solo expandir automáticamente si la ruta activa cambia y pertenece al grupo, pero permitir colapsar manualmente
  const [isExpanded, setIsExpanded] = useState(isAnySubItemActive);
  useEffect(() => {
    if (isAnySubItemActive) {
      setIsExpanded(true);
    }
    // No forzar a true si ya está expandido y el usuario lo colapsó manualmente
    // eslint-disable-next-line
  }, [isAnySubItemActive]);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <li className="mb-3 bg-blanco rounded-lg shadow-md overflow-hidden">
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between p-3 text-left font-bold text-xl transition-colors duration-150 ease-in-out focus:outline-none ${isExpanded ? 'text-primary' : 'text-negro'}`}
        aria-expanded={isExpanded}
      >
        <span>{itemData.title}</span>
        <span
          className={`transform transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-180 text-primary' : 'rotate-0 text-negro'}`}
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
      {isExpanded && (
        <ul className="pl-6 pr-2 px-1 border-t border-gray-200">
          {/* Renderizar subItems si existen */}
          {itemData.subItems &&
            itemData.subItems.map((subItem) => {
              const isActive = location.pathname.startsWith(subItem.to);
              const hasActions = subItem.hasActions === true;
              return (
                <li key={subItem.to} className="my-1.5">
                  <div
                    className={`flex items-center justify-between p-2.5 rounded-md transition-colors duration-150 ease-in-out ${isActive ? 'bg-primary text-blanco font-bold shadow' : 'hover:bg-gray-100 text-negro'} ${hasActions ? 'shadow-sm' : ''}`}
                  >
                    <Link
                      to={subItem.to}
                      onClick={onLinkClick}
                      className="block w-full text-md font-medium"
                    >
                      {subItem.label}
                    </Link>
                    {hasActions && (
                      <div className="flex space-x-2.5 ml-2 flex-shrink-0">
                        <button className="text-blanco hover:text-gray-200 transition-colors duration-150 ease-in-out focus:outline-none">
                          <IconoVer className="w-5 h-5" />
                        </button>
                        <button className="text-blanco hover:text-gray-200 transition-colors duration-150 ease-in-out focus:outline-none">
                          <IconoEditar className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          {/* Renderizar children recursivamente si existen */}
          {itemData.children &&
            itemData.children.map((child) => (
              <CollapsibleNavItem key={child.title} itemData={child} onLinkClick={onLinkClick} />
            ))}
        </ul>
      )}
    </li>
  );
};

export default CollapsibleNavItem;
