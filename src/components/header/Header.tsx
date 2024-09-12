import { Buscador } from './Buscador';

type Props = {
  totalItems: number;
};

export const Header = ({ totalItems }: Props) => {
  return (
    <header className="bg-primary flex w-full text-primary-foreground py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        <a
          href="#"
          className="flex items-start gap-2">
          <span className="text-2xl font-bold text-white">🍔 El Saborcito</span>
        </a>
        <div className="relative flex-1 max-w-md">
          <Buscador />
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-full">
            <span className="text-blanco font-bold">Login</span>
          </button>
          {totalItems > 0 && (
            <div className="relative">
              <button className="rounded-full">
                <span className="text-blanco font-bold">Car</span>
              </button>
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-bold">
                {totalItems}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
