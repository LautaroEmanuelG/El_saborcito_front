import { Link } from 'react-router-dom';

export const AsideAdmin = () => {
  return (
    <nav className="bg-primary text-white text-2xl font-bold shrink-0 w-[265px]">
      <ul className="space-y-4 p-4 mt-6">
        <li>
          <Link to="/admin/historial">
            Historial
          </Link>
        </li>
        <li>
          <Link to="/admin/productos">
            Productos
          </Link>
        </li>
        <li>
          <Link to="/admin/categorias">
            Categorias
          </Link>
        </li>
        <li>
          <Link to="/admin/reportes">
            BI / Reportes
          </Link>
        </li>
      </ul>
    </nav>
  );
};