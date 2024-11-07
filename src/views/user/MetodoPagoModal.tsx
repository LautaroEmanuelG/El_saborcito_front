import React from 'react';
import { useCart } from '../../hooks/useCart';
import { createTicket } from '../../utils/services/axios/ticketService';

interface MetodoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

const MetodoPagoModal: React.FC<MetodoPagoModalProps> = ({ isOpen, onClose, total }) => {
  if (!isOpen) return null;
  const { carrito, clearCarrito } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('');

  if (!isOpen) return null;

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }

    try {
      const productos = carrito.map(producto => ({
        productoId: producto.id ?? 0, // Ensure productoId is a number
        cantidad: producto.quantity,
      }));

      await createTicket(productos);
      clearCarrito();
      onClose();
      alert('Compra realizada con éxito.');
    } catch (error) {
      console.error('Error al crear el ticket:', error);
      alert('No hay stock suficiente. Por favor, intenta nuevamente más tarde.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[750px] h-[350px] rounded-lg shadow-lg p-6 relative">
      <button
          className="absolute font-bold top-6 right-8 text-negro text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
          onClick={onClose}>
          X
        </button>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu método de pago</h2>
        
        <div className="flex flex-col space-y-4">
        <label className="flex items-center text-lg">
            <input
              type="radio"
              name="pago"
              value="Mercado Pago"
              className="mr-2"
              onChange={handlePaymentMethodChange}
            />
            Mercado Pago
          </label>
          <label className="flex items-center text-lg">
            <input
              type="radio"
              name="pago"
              value="Transferencia bancaria"
              className="mr-2"
              onChange={handlePaymentMethodChange}
            />
            Transferencia bancaria
          </label>
          <label className="flex items-center text-lg">
            <input
              type="radio"
              name="pago"
              value="Criptomonedas"
              className="mr-2"
              onChange={handlePaymentMethodChange}
            />
            Criptomonedas
              </label>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span className="text-3xl text-primary font-black">Total: ${total.toFixed(2)}</span>
          <button className="bg-primary text-white py-2 px-4 rounded-lg text-lg" onClick={handleConfirmPayment}>Pagar</button>
        </div>
      </div>
    </div>
  );
};

export default MetodoPagoModal;

