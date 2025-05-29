import { Route, Routes } from 'react-router-dom';
import { ScreenPersona } from '../components/pages/ScreenPersona'; // Importamos el componente ScreenPersona
import { NavBar } from '../components/ui/NavBar/NavBar'; // Importamos el componente NavBar

// Componente AppRouter que define las rutas de la aplicación
export const AppRouter = () => {
  return (
    <>
      {/* Barra de navegación */}
      <NavBar />
      {/* Definición de las rutas */}
      <Routes>
        {/* Ruta para la pantalla de personas */}
        <Route path="/" element={<ScreenPersona />} />
      </Routes>
    </>
  );
};
