import { useState } from 'react';
import ModalSiNo from '../modals/ModalSiNo';

// Interfaz para los props del componente
interface IButtonsTable<T> {
  el: T; // Elemento de tipo T
  handleDelete: (id: number) => void; // Función para manejar la eliminación de un elemento
  setOpenModal: (state: boolean) => void; // Función para manejar la apertura del modal
  setSelectedItem: (item: T) => void; // Función para establecer el elemento seleccionado
  handleRestore?: (id: number) => void; // Función opcional para restaurar elementos eliminados
  onView?: (item: T) => void; // Función para manejar la vista del elemento
  onEdit?: (item: T) => void; // Función para manejar la edición del elemento
}

export const ButtonsTable = <T extends { id: number; denominacion?: string; eliminado?: boolean }>({
  el,
  handleDelete,
  setOpenModal,
  setSelectedItem,
  handleRestore,
  onView,
  onEdit,
}: IButtonsTable<T>) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Función para manejar la vista del elemento
  const handleView = () => {
    if (onView) {
      onView(el);
    } else {
      // Fallback al comportamiento anterior
      setSelectedItem(el);
      setOpenModal(true);
    }
  };

  // Función para manejar la edición del elemento
  const handleEdit = () => {
    if (onEdit) {
      onEdit(el);
    } else {
      // Fallback al comportamiento anterior
      setSelectedItem(el);
      setOpenModal(true);
    }
  };

  // Función para mostrar el modal de confirmación de eliminación
  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };

  // Función para confirmar la eliminación
  const handleConfirmDelete = () => {
    handleDelete(el.id); // Llamar a la función handleDelete con el ID del elemento
    setShowDeleteModal(false);
  };

  // Función para cancelar la eliminación
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Funciones para restaurar elementos
  const handleShowRestoreModal = () => {
    setShowRestoreModal(true);
  };

  const handleConfirmRestore = () => {
    if (handleRestore) {
      handleRestore(el.id);
    }
    setShowRestoreModal(false);
  };

  const handleCancelRestore = () => {
    setShowRestoreModal(false);
  };

  return (
    <>
      <div className="flex items-center justify-around gap-1">
        {/* Botón para ver el elemento - siempre visible */}
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded"
          onClick={handleView}
          title="Ver detalles"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
          </svg>
        </button>

        {/* Mostrar botones según el estado eliminado */}
        {el.eliminado ? (
          /* Botón para restaurar si está eliminado */
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
            onClick={handleShowRestoreModal}
            title="Restaurar elemento"
            disabled={!handleRestore}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
            </svg>
          </button>
        ) : (
          <>
            {/* Botón para editar si no está eliminado */}
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              onClick={handleEdit}
              title="Editar elemento"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                <path d="M16 5l3 3" />
              </svg>
            </button>
            {/* Botón para eliminar si no está eliminado */}
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              onClick={handleShowDeleteModal}
              title="Eliminar elemento"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Modal de confirmación para eliminación */}
      <ModalSiNo
        open={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        description={`¿Estás seguro de que deseas eliminar ${el.denominacion ? `"${el.denominacion}"` : 'este elemento'}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de confirmación para restauración */}
      {handleRestore && (
        <ModalSiNo
          open={showRestoreModal}
          onClose={handleCancelRestore}
          onConfirm={handleConfirmRestore}
          title="Confirmar restauración"
          description={`¿Estás seguro de que deseas restaurar ${el.denominacion ? `"${el.denominacion}"` : 'este elemento'}?`}
          confirmText="Restaurar"
          cancelText="Cancelar"
        />
      )}
    </>
  );
};
