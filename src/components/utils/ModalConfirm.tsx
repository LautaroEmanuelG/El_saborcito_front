interface ModalConfirmProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
}

export const ModalConfirm = ({
  isOpen,
  setIsOpen,
  onConfirm,
  title,
  message,
  confirmText,
}: ModalConfirmProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isOpen ? 'block' : 'hidden'
      }`}>
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={() => setIsOpen(false)}></div>
      <div className="bg-white p-8 rounded-lg z-10">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-lg">{message}</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsOpen(false)}
            className="mr-2 bg-gray-300 px-4 py-2 rounded">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
