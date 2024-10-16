import { Outlet } from 'react-router-dom';

export const LayoutAdmin: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
};
