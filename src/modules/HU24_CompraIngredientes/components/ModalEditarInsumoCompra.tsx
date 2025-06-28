import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';

interface ModalEditarInsumoCompraProps {
  open: boolean;
  onClose: () => void;
  nombre: string;
  cantidad: number;
  subtotal: number;
  unidadMedida?: string;
  esParaElaborar: boolean;
  onSave: (nuevaCantidad: number, nuevoSubtotal: number) => void;
}

const ModalEditarInsumoCompra: React.FC<ModalEditarInsumoCompraProps> = ({
  open,
  onClose,
  nombre,
  cantidad,
  subtotal,
  unidadMedida,
  esParaElaborar,
  onSave,
}) => {
  const [nuevaCantidad, setNuevaCantidad] = useState<string>(cantidad.toString());
  const [nuevoSubtotal, setNuevoSubtotal] = useState<string>(subtotal.toString());
  const [errores, setErrores] = useState<{ cantidad?: string; subtotal?: string }>({});

  const handleCantidadChange = (value: string) => {
    setNuevaCantidad(value);
    // Limpiar error cuando el usuario empiece a escribir
    if (errores.cantidad) {
      setErrores((prev) => ({ ...prev, cantidad: undefined }));
    }
  };

  const handleSubtotalChange = (value: string) => {
    setNuevoSubtotal(value);
    // Limpiar error cuando el usuario empiece a escribir
    if (errores.subtotal) {
      setErrores((prev) => ({ ...prev, subtotal: undefined }));
    }
  };

  useEffect(() => {
    setNuevaCantidad(cantidad.toString());
    setNuevoSubtotal(subtotal.toString());
    setErrores({});
  }, [cantidad, subtotal, open]);

  const validarFormulario = () => {
    const nuevosErrores: { cantidad?: string; subtotal?: string } = {};

    const cantidadNum = Number(nuevaCantidad);
    const subtotalNum = Number(nuevoSubtotal);

    if (isNaN(cantidadNum) || cantidadNum === 0) {
      nuevosErrores.cantidad =
        'La cantidad debe ser diferente de cero (puede ser negativa para ajustes)';
    }

    // Permitir subtotal $0 para productos gratuitos o muestras
    if (isNaN(subtotalNum) || subtotalNum < 0) {
      nuevosErrores.subtotal = 'El subtotal no puede ser negativo';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = () => {
    if (validarFormulario()) {
      const cantidadNum = Number(nuevaCantidad);
      const subtotalNum = Number(nuevoSubtotal);

      // Si no es para elaborar, redondear a entero; si es para elaborar, mantener decimales
      const cantidadFinal = !esParaElaborar ? Math.round(cantidadNum) : cantidadNum;

      onSave(cantidadFinal, subtotalNum);
      onClose();
    }
  };

  const calcularPrecioUnitario = () => {
    const cantidadNum = Number(nuevaCantidad) || 0;
    const subtotalNum = Number(nuevoSubtotal) || 0;
    return cantidadNum !== 0 ? (subtotalNum / cantidadNum).toFixed(2) : '0.00';
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
            step={esParaElaborar ? '0.01' : '1'}
            className={`w-full border rounded px-3 py-2 bg-gray-100 text-base text-negro ${
              errores.cantidad ? 'border-red-500' : ''
            }`}
            value={nuevaCantidad}
            onChange={(e) => handleCantidadChange(e.target.value)}
            placeholder="Cantidad (puede ser negativa para ajustes)"
          />
          {errores.cantidad && <div className="text-red-500 text-sm mt-1">{errores.cantidad}</div>}
        </div>

        <div>
          <label className="block text-base font-medium mb-2" htmlFor="subtotalInput">
            Subtotal
          </label>
          <input
            id="subtotalInput"
            type="number"
            min="0"
            step="0.01"
            className={`w-full border rounded px-3 py-2 bg-gray-100 text-base text-negro ${
              errores.subtotal ? 'border-red-500' : ''
            }`}
            value={nuevoSubtotal}
            onChange={(e) => handleSubtotalChange(e.target.value)}
            placeholder="Subtotal ($0 para gratuitos)"
          />
          {errores.subtotal && <div className="text-red-500 text-sm mt-1">{errores.subtotal}</div>}
        </div>

        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm font-medium text-blue-800">
            Precio unitario: ${calcularPrecioUnitario()}
          </div>
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
          >
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalEditarInsumoCompra;
