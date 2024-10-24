import React from 'react';
import { useState } from 'react';

type MetodoPagoProps = {
  isOpen: boolean;
  onClose: () => void;
  total: number;
};

const MetodoPagoModal: React.FC<MetodoPagoProps> = ({ isOpen, onClose, total }) => {
  const [metodoPago, setMetodoPago] = useState('');

  if (!isOpen) return null;

  const handlePaymentSelection = (metodo: string) => {
    setMetodoPago(metodo);
  };

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <article className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
        <h3 className="text-[24px] font-semibold mb-4">Elegir Metodo de Pago</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="Efectivo"
              checked={metodoPago === 'Efectivo'}
              onChange={() => handlePaymentSelection('Efectivo')}
              className="mr-2"
            />
            <span>Efectivo (Pagar en local)</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="Cripto"
              checked={metodoPago === 'Cripto'}
              onChange={() => handlePaymentSelection('Cripto')}
              className="mr-2"
            />
            <span>Cripto (Binance)</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="Virtual"
              checked={metodoPago === 'Virtual'}
              onChange={() => handlePaymentSelection('Virtual')}
              className="mr-2"
            />
            <span>Virtual (Mercado Pago)</span>
          </label>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold">${total.toFixed(2)}</span>
          <button className="bg-[#E11D48] text-white px-4 py-2 rounded-lg" onClick={onClose}>
            Pagar
          </button>
        </div>
      </article>
    </section>
  );
};

export default MetodoPagoModal;
