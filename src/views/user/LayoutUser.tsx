import { Outlet } from 'react-router-dom';
import { Header } from '../../components/header/Header';
import { useState } from 'react';

export const LayoutUser = () => {
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda

  const handleSearch = (query: string) => {
    setSearchTerm(query); // Actualizar el término de búsqueda
  };
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onSearch={handleSearch}
      />
      <main>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
};
