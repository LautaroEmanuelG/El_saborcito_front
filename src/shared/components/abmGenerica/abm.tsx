import React from 'react';
import ReactDOM from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.min.css'; // Importamos los estilos de Bootstrap

import '@fontsource/roboto/300.css'; // Importamos los estilos de la fuente Roboto en diferentes pesos
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { BrowserRouter } from 'react-router-dom'; // Importamos BrowserRouter para el enrutamiento
import { Provider } from 'react-redux'; // Importamos Provider para proporcionar el store de Redux
import { store } from './redux/store.ts'; // Importamos la tienda de Redux
import { ScreenPersona } from './components/pages/ScreenPersona.tsx';

// Renderizamos la aplicación en el elemento con el ID "root"
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Envolvemos la aplicación en BrowserRouter para el enrutamiento */}
    <BrowserRouter>
      {/* Envolvemos la aplicación en Provider y pasamos la tienda de Redux como prop */}
      <Provider store={store}>
        <ScreenPersona /> {/* Renderizamos el componente principal de la aplicación */}
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
