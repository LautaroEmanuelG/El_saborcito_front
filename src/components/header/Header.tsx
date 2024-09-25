import { Buscador } from './Buscador';
import IconoCarrito from '../iconos/IconoCarrito';
import IconoLoggin from '../iconos/IconoLoggin';
import IconoLogoSaborcito from '../iconos/IconoLogoSaborcito';
import { useState } from 'react';

type Props = {
  totalItems: number;
};

export const Header = ({ totalItems }: Props) => {
  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverCarrito, setHoverCarrito] = useState(false);

  return (
    <header className="bg-primary flex w-full text-primary-foreground py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        <a
          href="#"
          className="flex items-center gap-4">
          <IconoLogoSaborcito />
          <span className="text-2xl font-bold text-white">El Saborcito</span>
        </a>
        <div className="relative flex-1 max-w-md">
          <Buscador />
        </div>
        <div className="flex items-center gap-4 ">
          <button
            className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
            onMouseEnter={() => setHoverLogin(true)}
            onMouseLeave={() => setHoverLogin(false)}>
            <IconoLoggin color={hoverLogin ? '#E11D48' : 'white'}/>
          </button>
          {totalItems > 0 ? (
            <button
              className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
              onMouseEnter={() => setHoverCarrito(true)}
              onMouseLeave={() => setHoverCarrito(false)}>
              <IconoCarrito color={hoverCarrito ? '#E11D48' : 'white'} />
              <div className="absolute text-blanco -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-bold hover:bg-blanco hover:text-primary ">
                {totalItems}
              </div>
            </button>
          ) : (
            <button
              className="relative flex items-center justify-center gap-4 w-10 h-10 rounded-full hover:bg-blanco"
              onMouseEnter={() => setHoverCarrito(true)}
              onMouseLeave={() => setHoverCarrito(false)}>
              <IconoCarrito color={hoverCarrito ? '#E11D48' : 'white'} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
