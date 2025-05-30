import { useNavigate } from 'react-router-dom';

// Definición de las páginas y sus rutas
const pages = [
  { title: 'Persona', route: '/' },
  // { title: 'Producto', route: '/producto' },
];

// Componente NavBar
export const NavBar = () => {
  // Hook de navegación de React Router
  const navigate = useNavigate();

  // Función para manejar la navegación a una ruta específica
  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    // Barra de navegación
    <nav className="bg-blue-700 shadow-md w-full">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex gap-4">
          {/* Botones para cada página */}
          {pages.map((page) => (
            <button
              key={page.title}
              onClick={() => handleNavigate(page.route)}
              className="text-white font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors"
            >
              {page.title}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
