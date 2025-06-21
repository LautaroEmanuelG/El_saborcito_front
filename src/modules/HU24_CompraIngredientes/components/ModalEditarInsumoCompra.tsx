import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';

interface ModalEditarInsumoCompraProps {
  open: boolean;
  onClose: () => void;
  nombre: string;
  cantidad: number;
  precioCosto: number;
  unidadMedida?: string;
  onSave: (nuevaCantidad: number, nuevoPrecioCosto: number) => void;
}

const ModalEditarInsumoCompra: React.FC<ModalEditarInsumoCompraProps> = ({
  open,
  onClose,
  nombre,
  cantidad,
  precioCosto,
  unidadMedida,
  onSave,
}) => {
  const [nuevaCantidad, setNuevaCantidad] = useState(cantidad);
  const [nuevoPrecioCosto, setNuevoPrecioCosto] = useState(precioCosto);

  useEffect(() => {
    setNuevaCantidad(cantidad);
    setNuevoPrecioCosto(precioCosto);
  }, [cantidad, precioCosto, open]);

  const handleGuardar = () => {
    if (nuevaCantidad > 0 && nuevoPrecioCosto > 0) {
      onSave(nuevaCantidad, nuevoPrecioCosto);
      onClose();
    }
  };

  const calcularSubtotal = () => {
    return (nuevaCantidad * nuevoPrecioCosto).toFixed(2);
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar insumo de compra" maxWidth="max-w-md">
      <div className="flex flex-col gap-4 min-w-[350px] max-w-[450px] p-4 bg-blanco text-negro">
        <div>
          <div className="font-medium mb-2 text-base">Insumo:</div>
          <div className="mb-3 text-negro text-base break-words bg-gray-100 p-2 rounded">
            {nombre}
          </div>
        </div>

        <div>
          <label className="block text-base font-medium mb-2" htmlFor="cantidadInput">
            Cantidad {unidadMedida ? `(${unidadMedida})` : ''}
          </label>
          <input
            id="cantidadInput"
            type="number"
            min={0.01}
            step={0.01}
            className="w-full border rounded px-3 py-2 bg-gray-100 text-base text-negro"
            value={nuevaCantidad}
            onChange={(e) => setNuevaCantidad(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-base font-medium mb-2" htmlFor="precioCostoInput">
            Precio de costo (por unidad)
          </label>
          <input
            id="precioCostoInput"
            type="number"
            min={0.01}
            step={0.01}
            className="w-full border rounded px-3 py-2 bg-gray-100 text-base text-negro"
            value={nuevoPrecioCosto}
            onChange={(e) => setNuevoPrecioCosto(Number(e.target.value))}
          />
        </div>

        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm font-medium text-blue-800">Subtotal: ${calcularSubtotal()}</div>
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-negro font-bold py-2 px-4 rounded text-base"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="bg-primary hover:bg-primarydark text-blanco font-bold py-2 px-4 rounded text-base"
            onClick={handleGuardar}
            disabled={nuevaCantidad <= 0 || nuevoPrecioCosto <= 0}
          >
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalEditarInsumoCompra;
