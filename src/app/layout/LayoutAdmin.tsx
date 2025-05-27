import { Outlet } from 'react-router-dom';
import { HeaderAdmin } from '../views/user/header/HeaderAdmin';
import { AsideAdmin } from '../views/user/header/AsideAdmin';

export const LayoutAdmin: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main>
        <HeaderAdmin />
        <div className="flex min-h-[calc(100vh-4.9rem)]">
          <AsideAdmin />
          <Outlet />
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};
