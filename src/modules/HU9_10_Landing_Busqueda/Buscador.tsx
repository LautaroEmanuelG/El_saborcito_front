import IconoBuscador from '../../assets/svgs/icons/IconoBuscador';
import { useProductSearch } from '../../shared/hooks/useProductSearch';
import { useProductStore } from '../../shared/providers/ProductProvider';

type Props = {
  onSearch: (query: string) => void; // Prop para manejar el evento de búsqueda
};

export const Buscador = ({ onSearch }: Props) => {
  const { searchTerm, handleSearchInputChange } = useProductSearch(''); // Usamos el nuevo hook

  // Acceder a handleCategoryFilter para limpiar la categoría cuando el usuario escribe
  const { handleCategoryFilter } = useProductStore();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // Si hay texto en el campo de búsqueda, limpiar la categoría activa
    // Si no hay texto, podemos mantener la categoría activa (o no, según el comportamiento deseado)
    if (inputValue !== '') {
      // Limpiar la categoría activa cuando el usuario escribe
      handleCategoryFilter('');
    }

    handleSearchInputChange(event);
    onSearch(inputValue); // Llamar a la función de búsqueda con el término actual
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
