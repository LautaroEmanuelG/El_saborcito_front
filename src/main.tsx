import { createRoot } from 'react-dom/client';
import './index.css';
import { Web } from './views/user/Web.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import VistaCarrito from './views/user/VistaCarrito.tsx';
import { CarritoProvider } from './components/carrito/CarritoProvider.tsx';
import { LayoutAdmin } from './views/admin/LayoutAdmin.tsx';
import { Historial } from './views/admin/Historial.tsx';
import { Control } from './views/admin/Control.tsx';
import { Productos } from './views/admin/Productos.tsx';
import ProtectedRoute from './components/utils/ProtectedRoute.tsx';
import { Categorias } from './views/admin/Categorias.tsx';
import { Reportes } from './views/admin/Reportes.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={
          <CarritoProvider>
            <Web />
          </CarritoProvider>
        }
      />
      <Route
        path="/carrito"
        element={
          <CarritoProvider>
            <VistaCarrito />
          </CarritoProvider>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <LayoutAdmin />
          </ProtectedRoute>
        }>
        <Route
          path="historial"
          element={
            <ProtectedRoute>
              <Historial />
            </ProtectedRoute>
          }
        />
        <Route
          path="productos"
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }
        />
        <Route
          path="categorias"
          element={
            <ProtectedRoute>
              <Categorias />
            </ProtectedRoute>
          }
        />
        <Route
          path="reportes"
          element={
            <ProtectedRoute>
              <Reportes />
            </ProtectedRoute>
          }
        />
        <Route
          path="control"
          element={
            <ProtectedRoute>
              <Control />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            replace
            to="/"
          />
        }
      />
    </Routes>
  </BrowserRouter>
);
