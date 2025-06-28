import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';

interface ModalEditarInsumoCompraProps {
  open: boolean;
  onClose: () => void;
  nombre: string;
  cantidad: number;
  precioCosto: number;
  unidadMedida?: string;
  esParaElaborar: boolean;
  onSave: (nuevaCantidad: number, nuevoPrecioCosto: number) => void;
}

const ModalEditarInsumoCompra: React.FC<ModalEditarInsumoCompraProps> = ({
  open,
  onClose,
  nombre,
  cantidad,
  precioCosto,
  unidadMedida,
  esParaElaborar,
  onSave,
}) => {
  const [nuevaCantidad, setNuevaCantidad] = useState<string>(cantidad.toString());
  const [nuevoPrecioCosto, setNuevoPrecioCosto] = useState<string>(precioCosto.toString());
  const [errores, setErrores] = useState<{ cantidad?: string; precio?: string }>({});

  const handleCantidadChange = (value: string) => {
    setNuevaCantidad(value);
    // Limpiar error cuando el usuario empiece a escribir
    if (errores.cantidad) {
      setErrores((prev) => ({ ...prev, cantidad: undefined }));
    }
  };

  const handlePrecioChange = (value: string) => {
    setNuevoPrecioCosto(value);
    // Limpiar error cuando el usuario empiece a escribir
    if (errores.precio) {
      setErrores((prev) => ({ ...prev, precio: undefined }));
    }
  };

  useEffect(() => {
    setNuevaCantidad(cantidad.toString());
    setNuevoPrecioCosto(precioCosto.toString());
    setErrores({});
  }, [cantidad, precioCosto, open]);

  const validarFormulario = () => {
    const nuevosErrores: { cantidad?: string; precio?: string } = {};

    const cantidadNum = Number(nuevaCantidad);
    const precioNum = Number(nuevoPrecioCosto);

    if (isNaN(cantidadNum) || cantidadNum === 0) {
      nuevosErrores.cantidad =
        'La cantidad debe ser diferente de cero (puede ser negativa para ajustes)';
    }

    if (isNaN(precioNum) || precioNum <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = () => {
    if (validarFormulario()) {
      const cantidadNum = Number(nuevaCantidad);
      const precioNum = Number(nuevoPrecioCosto);

      // Si no es para elaborar, redondear a entero; si es para elaborar, mantener decimales
      const cantidadFinal = !esParaElaborar ? Math.round(cantidadNum) : cantidadNum;

      onSave(cantidadFinal, precioNum);
      onClose();
    }
  };

  const calcularSubtotal = () => {
    const cantidadNum = Number(nuevaCantidad) || 0;
    const precioNum = Number(nuevoPrecioCosto) || 0;
    return (cantidadNum * precioNum).toFixed(2);
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
          <label className="block text-base font-medium mb-2" htmlFor="precioCostoInput">
            Precio de costo (por unidad)
          </label>
          <input
            id="precioCostoInput"
            type="number"
            min="0.01"
            step="0.01"
            className={`w-full border rounded px-3 py-2 bg-gray-100 text-base text-negro ${
              errores.precio ? 'border-red-500' : ''
            }`}
            value={nuevoPrecioCosto}
            onChange={(e) => handlePrecioChange(e.target.value)}
            placeholder="Precio unitario"
          />
          {errores.precio && <div className="text-red-500 text-sm mt-1">{errores.precio}</div>}
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
          >
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalEditarInsumoCompra;
