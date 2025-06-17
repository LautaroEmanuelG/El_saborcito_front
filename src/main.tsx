import { createRoot } from 'react-dom/client';
import './app/styles/index.css';
import { Web } from './app/views/user/Web.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { VistaCarrito } from './modules/HU11_12_Carrito_Confirmacion/VistaCarrito.tsx';
import { CarritoProvider } from './shared/providers/CarritoProvider';
import { LayoutAdmin } from './app/layout/LayoutAdmin.tsx';
import { Control } from './app/views/admin/Control.tsx';
import ProtectedRoute from './app/routes/ProtectedRoute.tsx';
import ProtectedCarrito from './app/routes/ProtectCarrito.tsx';
import { AppProviders } from './shared/providers/AppProviders.tsx';
import { RankingProductos } from './modules/HU26_28_informes/components/RankingProductos.tsx';
import ScreenArticulosManufacturados from './modules/HU22_CRUDArticulos/components/ScreenArticulosManufacturados.tsx';
import ScreenInsumos from './modules/HU23_CRUDInsumos/components/ScreenInsumos';
import { Cocina } from './app/views/admin/Cocina.tsx';
import { HistorialCocina } from './app/views/admin/HistorialCocina.tsx';
import MovimientosMonetarios from './modules/HU26_28_informes/components/MovimientosMonetarios.tsx';
import { RankingCliente } from './modules/HU26_28_informes/components/RankingCliente.tsx';
import ScreenCategoriasArticulos from './modules/HU21_CRUD_CategoriasArticulos/components/ScreenCategoriasArticulos';
import ScreenCategoriaPadreArticulo from './modules/HU21_CRUD_CategoriasPadresArticulos/components/ScreenCategoriaPadreArticulo';
import ScreenSubcategoriasInsumos from './modules/HU20_CRUD_SubcategoriasInsumos/components/ScreenSubcategoriasInsumos';
import ScreenCategoriaPadreInsumo from './modules/HU20_CRUD_CategoriasPadresInsumos/components/ScreenCategoriaPadreInsumo';
import ScreenPromociones from './modules/HU25_Promociones/components/ScreenPromociones';
import { Recepcion } from './modules/HU14_Recepcion/components/Recepcion.tsx';
import { Delivery } from './modules/HU16_Delivery/components/Delivery.tsx';
import ScreenCompraIngredientes from './modules/HU24_CompraIngredientes/components/ScreenCompraIngredientes';
import { CallbackPage } from './app/views/CallbackPage.tsx';
import { HistorialPedidosCliente } from './modules/HU13_MisPedidos/index.ts';
import { PerfilClienteDashboard } from './modules/HU3_Perfil_Cliente/components/PerfilClienteDashboard.tsx';
import ScreenStockInsumos from './modules/HU25_ControlStockInsumos/components/ScreenStockInsumos';
import { GestionEmpleados } from './modules/HU4_Registro_Empleado';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppProviders>
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
            path="mis-pedidos"
            element={
              <CarritoProvider>
                <HistorialPedidosCliente />
              </CarritoProvider>
            }
          />
          <Route
            path="recepcion"
            element={
              <ProtectedRoute>
                <Recepcion />
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
          <Route
            path="categorias-articulos"
            element={
              <ProtectedRoute>
                <ScreenCategoriaPadreArticulo />
              </ProtectedRoute>
            }
          />
          <Route
            path="subcategorias-insumos"
            element={
              <ProtectedRoute>
                <ScreenSubcategoriasInsumos />
              </ProtectedRoute>
            }
          />
          <Route
            path="categorias-insumos"
            element={
              <ProtectedRoute>
                <ScreenCategoriaPadreInsumo />
              </ProtectedRoute>
            }
          />
          <Route
            path="promociones"
            element={
              <ProtectedRoute>
                <ScreenPromociones />
              </ProtectedRoute>
            }
          />
          <Route
            path="delivery"
            element={
              <ProtectedRoute>
                <Delivery />
              </ProtectedRoute>
            }
          />
          <Route
            path="compra-insumos"
            element={
              <ProtectedRoute>
                <ScreenCompraIngredientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="control-stock-insumos"
            element={
              <ProtectedRoute>
                <ScreenStockInsumos />
              </ProtectedRoute>
            }
          />
          <Route
            path="empleados"
            element={
              <ProtectedRoute>
                <GestionEmpleados />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/perfil" element={<PerfilClienteDashboard />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AppProviders>
  </BrowserRouter>
);
