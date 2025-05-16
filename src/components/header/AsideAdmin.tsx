import { useState } from 'react';
import { Link } from 'react-router-dom';
import IconoMenuHamburguesa from '../iconos/IconoMenuHamburguesa';

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
        className="absolute top-3 right-0 md:hidden text-white text-3xl p-4"
        onClick={toggleMenu}
      >
        <IconoMenuHamburguesa />
      </button>
      <nav
        className={`bg-primary text-white ${
          isOpen ? 'block' : 'hidden'
        } md:flex text-2xl font-bold shrink-0 w-[265px]`}
      >
        <ul className="space-y-4 p-4 mt-6">
          <li>
            <Link to="/admin/historial" onClick={closeMenu}>
              Control
            </Link>
          </li>
          <li>
            <Link to="/admin/productos" onClick={closeMenu}>
              Productos
            </Link>
          </li>
          <li>
            <Link to="/admin/categorias" onClick={closeMenu}>
              Categorias
            </Link>
          </li>
          <li>
            <Link to="/admin/reportes" onClick={closeMenu}>
              Reportes
            </Link>
          </li>
          <li>
            <Link to="/admin/control" onClick={closeMenu}>
              Libros Contables
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};
