import React from 'react';
import type { CompraInsumoDTO } from '../model';
import { useInsumoStore } from '../../HU23_CRUDInsumos/services/insumoStore';

interface Props {
  open: boolean;
  onClose: () => void;
  compra: CompraInsumoDTO | null;
}

const ModalDetalleCompra: React.FC<Props> = ({ open, onClose, compra }) => {
  const { insumos } = useInsumoStore();
  const getDenominacion = (id: number) =>
    insumos.find((i) => i.id === id)?.denominacion || `ID: ${id}`;

  if (!open || !compra) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Detalle de Compra</h2>
        <div className="mb-2">
          <b>ID:</b> {compra.id}
        </div>
        <div className="mb-2">
          <b>Denominación:</b> {compra.denominacion}
        </div>
        <div className="mb-2">
          <b>Fecha:</b> {compra.fechaCompra.split('-').reverse().join('/')}
        </div>
        <div className="mb-2">
          <b>Total:</b> ${compra.totalCompra.toFixed(2)}
        </div>
        <div className="mt-4">
          <b>Detalles:</b>
          <ul className="list-disc ml-6 mt-2">
            {compra.detalles.map((d, i) => (
              <li key={i}>
                Insumo: {getDenominacion(d.insumoId)} | Cantidad: {d.cantidad} | Precio Unitario: $
                {d.precioUnitario.toFixed(2)} | Subtotal: ${d.subtotal.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCompra;
