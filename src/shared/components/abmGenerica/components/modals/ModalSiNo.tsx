import React from 'react';

interface ModalSiNoProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

const ModalSiNo: React.FC<ModalSiNoProps> = ({
  open,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  description = '¿Desea continuar?',
  confirmText = 'Sí',
  cancelText = 'Cancelar',
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-2 text-center">{title}</h2>
        <p className="mb-4 text-gray-700 break-words text-center">{description}</p>
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className="bg-primary hover:bg-primarydark text-white font-bold py-2 px-4 rounded"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSiNo;
