import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

// Definición de las páginas y sus rutas
const pages = [
  { title: 'Persona', route: '/' },
  // { title: "Producto", route: "/producto" },
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
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {/* Botones para cada página */}
            {pages.map((page) => (
              <Button
                key={page.title}
                onClick={() => {
                  handleNavigate(page.route);
                }}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.title}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
