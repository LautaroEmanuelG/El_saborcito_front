// src/index.tsx  (o donde tengas tu main)
import { createRoot } from 'react-dom/client';
import './app/styles/index.css';
import { Web } from './app/views/user/Web';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { VistaCarrito } from './modules/HU11_12_Carrito_Confirmacion/VistaCarrito';
import { CarritoProvider } from './shared/providers/CarritoProvider';
import { LayoutAdmin } from './app/layout/LayoutAdmin';
import ProtectedRoute from './app/routes/ProtectedRoute';
import { AppProviders } from './shared/providers/AppProviders';
import { RankingProductos } from './modules/HU26_28_informes/components/RankingProductos';
import ScreenArticulosManufacturados from './modules/HU22_CRUDArticulos/components/ScreenArticulosManufacturados';
import ScreenInsumos from './modules/HU23_CRUDInsumos/components/ScreenInsumos';
import { Cocina } from './app/views/admin/Cocina';
import { HistorialCocina } from './app/views/admin/HistorialCocina';
import MovimientosMonetarios from './modules/HU26_28_informes/components/MovimientosMonetarios';
import { RankingCliente } from './modules/HU26_28_informes/components/RankingCliente';
import ScreenCategoriasArticulos from './modules/HU21_CRUD_CategoriasArticulos/components/ScreenCategoriasArticulos';
import ScreenCategoriaPadreArticulo from './modules/HU21_CRUD_CategoriasPadresArticulos/components/ScreenCategoriaPadreArticulo';
import ScreenSubcategoriasInsumos from './modules/HU20_CRUD_SubcategoriasInsumos/components/ScreenSubcategoriasInsumos';
import ScreenCategoriaPadreInsumo from './modules/HU20_CRUD_CategoriasPadresInsumos/components/ScreenCategoriaPadreInsumo';
import ScreenPromociones from './modules/HU25_Promociones/components/ScreenPromociones';
import { Recepcion } from './modules/HU14_Recepcion/components/Recepcion';
import { Delivery } from './modules/HU16_Delivery/components/Delivery';
import ScreenCompraIngredientes from './modules/HU24_CompraIngredientes/components/ScreenCompraIngredientes';
import { CallbackPage } from './app/views/CallbackPage.tsx';
import { HistorialPedidosCliente } from './modules/HU13_MisPedidos/index.ts';
import { PerfilClienteDashboard } from './modules/HU3_Perfil_Cliente/components/PerfilClienteDashboard.tsx';
import ScreenStockInsumos from './modules/HU25_ControlStockInsumos/components/ScreenStockInsumos';
import { GestionEmpleados } from './modules/HU4_Registro_Empleado';
import { PerfilEmpleadoDashboard } from './modules/HU6_Perfil_Empleado/components/PerfilEmpleadoDashboard';
import GestionClientes from './app/views/admin/GestionClientes';
import { Rol } from './types/Rol';

// Definición de roles permitidos para cada sección
const ADMIN = [Rol.ADMIN];
const CAJERO = [Rol.ADMIN, Rol.CAJERO];
const DELIVERY = [Rol.ADMIN, Rol.DELIVERY];
const COCINERO = [Rol.ADMIN, Rol.COCINERO];
const ALL_STAFF = [Rol.ADMIN, Rol.CAJERO, Rol.DELIVERY, Rol.COCINERO];

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppProviders>
      <Routes>
        {/* Rutas públicas */}
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

        {/* Dashboard Admin (Layout) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={ALL_STAFF}>
              <LayoutAdmin />
            </ProtectedRoute>
          }
        >
          <Route
            path="recepcion"
            element={
              <ProtectedRoute allowedRoles={CAJERO}>
                <Recepcion />
              </ProtectedRoute>
            }
          />

          {/* Delivery: delivery, admin */}
          <Route
            path="delivery"
            element={
              <ProtectedRoute allowedRoles={DELIVERY}>
                <Delivery />
              </ProtectedRoute>
            }
          />

          {/* Cocina & Historial: cocinero, admin */}
          <Route
            path="cocina"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <Cocina />
              </ProtectedRoute>
            }
          />
          <Route
            path="historial-cocina"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <HistorialCocina />
              </ProtectedRoute>
            }
          />

          {/* Artículos / Categorías: cocinero, admin */}
          <Route
            path="articulos"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <ScreenArticulosManufacturados />
              </ProtectedRoute>
            }
          />
          <Route
            path="categorias-articulos"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <ScreenCategoriaPadreArticulo />
              </ProtectedRoute>
            }
          />
          <Route
            path="subcategorias-articulos"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <ScreenCategoriasArticulos />
              </ProtectedRoute>
            }
          />

          {/* Insumos / Compra / Control Stock: cocinero, admin */}
          <Route
            path="insumos"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <ScreenInsumos />
              </ProtectedRoute>
            }
          />
          <Route
            path="compra-insumos"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <ScreenCompraIngredientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="control-stock-insumos"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <ScreenStockInsumos />
              </ProtectedRoute>
            }
          />
          <Route
            path="categorias-insumos"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <ScreenCategoriaPadreInsumo />
              </ProtectedRoute>
            }
          />
          <Route
            path="subcategorias-insumos"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <ScreenSubcategoriasInsumos />
              </ProtectedRoute>
            }
          />

          {/* Promociones: cocinero, admin */}
          <Route
            path="promociones"
            element={
              <ProtectedRoute allowedRoles={COCINERO}>
                <ScreenPromociones />
              </ProtectedRoute>
            }
          />

          {/* Informes: sólo admin */}
          <Route
            path="informes/ranking-productos"
            element={
              <ProtectedRoute allowedRoles={ADMIN}>
                <RankingProductos />
              </ProtectedRoute>
            }
          />
          <Route
            path="informes/ranking-clientes"
            element={
              <ProtectedRoute allowedRoles={ADMIN}>
                <RankingCliente />
              </ProtectedRoute>
            }
          />
          <Route
            path="informes/movimientos-monetarios"
            element={
              <ProtectedRoute allowedRoles={ADMIN}>
                <MovimientosMonetarios />
              </ProtectedRoute>
            }
          />

          {/* Gestión de personal: admin */}
          <Route
            path="empleados"
            element={
              <ProtectedRoute allowedRoles={ADMIN}>
                <GestionEmpleados />
              </ProtectedRoute>
            }
          />
          <Route
            path="clientes"
            element={
              <ProtectedRoute allowedRoles={ADMIN}>
                <GestionClientes />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* OAuth callback & perfiles */}
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/pedido-exitoso" element={<PedidoExitoso />} />
        <Route path="/perfil" element={<PerfilClienteDashboard />} />
        <Route path="/empleado/perfil" element={<PerfilEmpleadoDashboard />} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProviders>
  </BrowserRouter>
);
