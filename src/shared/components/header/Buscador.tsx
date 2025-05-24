import { useSearch } from '../../hooks/useSearch';
import IconoBuscador from '../iconos/IconoBuscador';

type Props = {
  onSearch: (query: string) => void; // Prop para manejar el evento de búsqueda
};

export const Buscador = ({ onSearch }: Props) => {
  const { searchTerm, handleSearchChange } = useSearch('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(event);
    onSearch(event.target.value); // Llamar a la función de búsqueda con el término actual
  };

  return (
    <>
      <div className="absolute px-2 py-2 hover:fill-primary">
        <IconoBuscador />
      </div>
      <input
        id="search"
        type="search"
        placeholder="Buscar productos, categorías y más..."
        className="w-full rounded-md bg-primary-foreground px-10 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary-foreground"
        value={searchTerm}
        onChange={handleChange} // Manejar el cambio en el input
      />
    </>
  );
};
