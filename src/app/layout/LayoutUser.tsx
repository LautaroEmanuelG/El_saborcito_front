import { Outlet } from 'react-router-dom';
import { Header } from '../views/user/header/Header';

export const LayoutUser = () => {
  const handleSearch = (query: string | string[]) => {
    // Manejar búsqueda
    console.log('Búsqueda:', query);
  };
  return (
    <div className="flex flex-col min-h-screen max-w-full py-4">
      <Header onSearch={handleSearch} />
      <main>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
};
