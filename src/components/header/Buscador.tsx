import IconoBuscador from '../iconos/IconoBuscador';

type Props = {};

export const Buscador = ({}: Props) => {
  return (
    <>
      <div className='absolute px-2 py-2 hover:fill-primary'>
        <IconoBuscador />
        </div>
      <input
        type="search"
        placeholder="Buscar productos, categorías y más..."
        className="w-full rounded-md bg-primary-foreground px-10 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary-foreground"></input>
    </>
  );
};
