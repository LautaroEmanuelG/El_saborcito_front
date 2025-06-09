import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';

interface ModalEditarCantidadInsumoProps {
  open: boolean;
  onClose: () => void;
  nombre: string;
  cantidad: number;
  onSave: (nuevaCantidad: number) => void;
}

const ModalEditarCantidadInsumo: React.FC<ModalEditarCantidadInsumoProps> = ({
  open,
  onClose,
  nombre,
  cantidad,
  onSave,
}) => {
  const [valor, setValor] = useState(cantidad);

  useEffect(() => {
    setValor(cantidad);
  }, [cantidad, open]);

  const handleGuardar = () => {
    if (valor > 0) {
      onSave(valor);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar cantidad" maxWidth="max-w-md">
      <div className="flex flex-col gap-3 min-w-[320px] max-w-[420px] p-4 bg-blanco text-negro">
        <div>
          <div className="font-medium mb-1 text-base">Ingrediente:</div>
          <div className="mb-1 text-negro text-base break-words">{nombre}</div>
        </div>
        <div>
          <label className="block text-base font-medium mb-1" htmlFor="cantidadInput">
            Cantidad
          </label>
          <input
            id="cantidadInput"
            type="number"
            min={1}
            className="w-full border rounded px-3 py-2 bg-gray-100 text-base text-negro"
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-negro font-bold py-1 px-4 rounded text-base"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-blanco font-bold py-1 px-4 rounded text-base"
            onClick={handleGuardar}
            disabled={valor <= 0}
          >
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalEditarCantidadInsumo;
