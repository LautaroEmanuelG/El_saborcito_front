import React from 'react';
import IconoCruz from '../../components/iconos/IconoCruz';

interface MetodoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

const MetodoPagoModal: React.FC<MetodoPagoModalProps> = ({ isOpen, onClose, total }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[750px] h-[350px] rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-2xl hover:text-[#E11D48] transition-colors duration-300 ease-in-out"
        >
          <IconoCruz />
        </button>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu método de pago</h2>
        
        <div className="flex flex-col space-y-4">
          <label className="flex items-center text-lg">
            <input type="radio" name="pago" className="mr-2" />
            Mercado Pago
          </label>
          <label className="flex items-center text-lg">
            <input type="radio" name="pago" className="mr-2" />
            Transferencia bancaria
          </label>
          <label className="flex items-center text-lg">
            <input type="radio" name="pago" className="mr-2" />
            Pago en efectivo
          </label>
          <label className="flex items-center text-lg">
            <input type="radio" name="pago" className="mr-2" />
            Cripto
          </label>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span className="text-xl font-semibold">Total: ${total.toFixed(2)}</span>
          <button className="bg-[#E11D48] text-white py-2 px-4 rounded-lg text-lg">Pagar</button>
        </div>
      </div>
    </div>
  );
};

export default MetodoPagoModal;

