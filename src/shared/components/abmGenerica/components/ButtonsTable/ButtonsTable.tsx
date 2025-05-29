// Interfaz para los props del componente
interface IButtonsTable<T> {
  el: T; // Elemento de tipo T
  handleDelete: (id: number) => void; // Función para manejar la eliminación de un elemento
  setOpenModal: (state: boolean) => void; // Función para manejar la apertura del modal
  setSelectedItem: (item: T) => void; // Función para establecer el elemento seleccionado
}

export const ButtonsTable = <T extends { id: number }>({
  el,
  handleDelete,
  setOpenModal,
  setSelectedItem,
}: IButtonsTable<T>) => {
  // Función para manejar la selección del modal para editar
  const handleModalSelected = () => {
    setSelectedItem(el); // Establecer el elemento seleccionado
    setOpenModal(true); // Mostrar el modal para editar el elemento
  };

  // Función para manejar la eliminación de un elemento
  const handleDeleteItem = () => {
    handleDelete(el.id); // Llamar a la función handleDelete con el ID del elemento
  };

  return (
    <div className="flex items-center justify-around">
      {/* Botón para editar el elemento */}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
        onClick={handleModalSelected}
      >
        <span className="material-symbols-outlined">edit</span>
      </button>
      {/* Botón para eliminar el elemento */}
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
        onClick={handleDeleteItem}
      >
        <span className="material-symbols-outlined">delete_forever</span>
      </button>
    </div>
  );
};
