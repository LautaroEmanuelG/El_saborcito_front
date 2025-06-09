import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-negro bg-opacity-40">
      <div className="bg-blanco rounded-lg shadow-lg w-full max-w-3xl p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-negro hover:text-gray-400 text-2xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-negro">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
