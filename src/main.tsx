import { createRoot } from 'react-dom/client';
import './app/styles/index.css';
import { Web } from './app/views/user/Web.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { VistaCarrito } from './modules/HU11_12_Carrito_Confirmacion/VistaCarrito.tsx';
import { CarritoProvider } from './shared/providers/CarritoProvider';
import { LayoutAdmin } from './app/layout/LayoutAdmin.tsx';
import { Historial } from './app/views/admin/Historial.tsx';
import { Control } from './app/views/admin/Control.tsx';
import { Productos } from './app/views/admin/Productos.tsx';
import ProtectedRoute from './app/routes/ProtectedRoute.tsx';
import ProtectedCarrito from './app/routes/ProtectCarrito.tsx';
import { AppProviders } from './shared/providers/AppProviders.tsx';
import { RankingProductos } from './modules/HU26_28_informes/components/RankingProductos.tsx';
import ScreenArticulosManufacturados from './modules/HU22_CRUDArticulos/components/ScreenArticulosManufacturados.tsx';
import ScreenInsumos from './modules/HU23_CRUDInsumos/components/ScreenInsumos';
import { Cocina } from './app/views/admin/Cocina.tsx';
import { HistorialCocina } from './app/views/admin/HistorialCocina.tsx';
import { MovimientosMonetarios } from './modules/HU26_28_informes/components/MovimientosMonetarios.tsx';
import { RankingCliente } from './modules/HU26_28_informes/components/RankingCliente.tsx';
import ScreenCategoriasArticulos from './modules/HU21_CRUD_CategoriasArticulos/components/ScreenCategoriasArticulos';

createRoot(document.getElementById('root')!).render(
  <AppProviders>
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
              <ProtectedCarrito>
                <VistaCarrito />
              </ProtectedCarrito>
            </CarritoProvider>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <LayoutAdmin />
            </ProtectedRoute>
          }
        >
          <Route
            path="historial"
            element={
              <ProtectedRoute>
                <Historial />
              </ProtectedRoute>
            }
          />
          <Route
            path="articulos"
            element={
              <ProtectedRoute>
                <ScreenArticulosManufacturados />
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
            path="subcategorias-articulos"
            element={
              <ProtectedRoute>
                <ScreenCategoriasArticulos />
              </ProtectedRoute>
            }
          />
          <Route
            path="reportes"
            element={
              <ProtectedRoute>
                <RankingProductos />
              </ProtectedRoute>
            }
          />
          <Route
            path="movimientos"
            element={
              <ProtectedRoute>
                <MovimientosMonetarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="ranking-clientes"
            element={
              <ProtectedRoute>
                <RankingCliente />
              </ProtectedRoute>
            }
          />
          <Route
            path="informes/ranking-productos"
            element={
              <ProtectedRoute>
                <RankingProductos />
              </ProtectedRoute>
            }
          />
          <Route
            path="informes/ranking-clientes"
            element={
              <ProtectedRoute>
                <RankingCliente />
              </ProtectedRoute>
            }
          />
          <Route
            path="informes/movimientos-monetarios"
            element={
              <ProtectedRoute>
                <MovimientosMonetarios />
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
          <Route
            path="insumos"
            element={
              <ProtectedRoute>
                <ScreenInsumos />
              </ProtectedRoute>
            }
          />
          <Route
            path="cocina"
            element={
              <ProtectedRoute>
                <Cocina />
              </ProtectedRoute>
            }
          />
          <Route
            path="historial-cocina"
            element={
              <ProtectedRoute>
                <HistorialCocina />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  </AppProviders>
);
