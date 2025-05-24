import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import IconoVer from '../../../assets/svgs/icons/IconoVer';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import type { NavItemStructure } from './AsideAdmin';

interface CollapsibleNavItemProps {
  itemData: NavItemStructure;
  onLinkClick: () => void;
}

const CollapsibleNavItem: React.FC<CollapsibleNavItemProps> = ({ itemData, onLinkClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <li className="mb-3 bg-blanco rounded-lg shadow-md overflow-hidden">
      <button
        onClick={toggleExpand}
        className="w-full flex items-center justify-between p-3 text-left text-primary font-bold text-xl hover:bg-gray-50 transition-colors duration-150 ease-in-out focus:outline-none"
      >
        <span>{itemData.title}</span>
        <span
          className={`transform transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
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
        <ul className="pl-4 pr-2 pb-2 pt-1 border-t border-gray-200">
          {itemData.subItems.map((subItem) => (
            <li key={subItem.to} className="my-1.5">
              <div
                className={`flex items-center justify-between p-2.5 rounded-md transition-colors duration-150 ease-in-out ${subItem.hasActions ? 'bg-primary text-blanco shadow-sm' : 'hover:bg-gray-100 text-negro '}`}
              >
                <Link
                  to={subItem.to}
                  onClick={onLinkClick}
                  className="block w-full text-md font-medium"
                >
                  {subItem.label}
                </Link>
                {subItem.hasActions && (
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
          ))}
        </ul>
      )}
    </li>
  );
};

export default CollapsibleNavItem;
