import { useState } from 'react';
import { Link } from 'react-router-dom';
import IconoMenuHamburguesa from '../iconos/IconoMenuHamburguesa';

export const AsideAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className="absolute top-3 right-0 md:hidden text-white text-3xl p-4"
        onClick={toggleMenu}>
        <IconoMenuHamburguesa />
      </button>
      <nav
        className={`bg-primary text-white ${
          isOpen ? 'block' : 'hidden'
        } md:flex text-2xl font-bold shrink-0 w-[265px]`}>
        <ul className="space-y-4 p-4 mt-6">
          <li>
            <Link to="/admin/historial">Control</Link>
          </li>
          <li>
            <Link to="/admin/productos">Productos</Link>
          </li>
          <li>
            <Link to="/admin/categorias">Categorias</Link>
          </li>
          <li>
            <Link to="/admin/reportes">Reportes</Link>
          </li>
          <li>
            <Link to="/admin/control">Libros Contables</Link>
          </li>
        </ul>
      </nav>
    </>
  );
};
