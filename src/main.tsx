import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Web } from './views/user/Web.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import VistaCarrito from './views/user/VistaCarrito.tsx';
import { CarritoProvider } from './components/carrito/CarritoProvider.tsx';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
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
        {/* <Route
          path="/admin"
          element={<Admin />}
        /> */}
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
  // </StrictMode>
);
