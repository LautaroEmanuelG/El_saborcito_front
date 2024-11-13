import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { createTicket } from '../../utils/services/axios/ticketService';
import '../../styles/styles.css';

interface MetodoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const MetodoPagoModal: React.FC<MetodoPagoModalProps> = ({ isOpen, onClose, total }) => {
  if (!isOpen) return null;

  const { carrito, clearCarrito } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      new window.MercadoPago('APP_USR-679e9c30-b8ee-44cf-943b-04e088ec9163', {
        locale: 'es-AR',
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }

    setLoading(true);

    try {
      const productos = carrito.map((producto) => ({
        productoId: producto.id ?? 0,
        cantidad: producto.quantity,
      }));

      if (selectedPaymentMethod === 'MP') {
        const response = await fetch('http://localhost:5252/api/mp/crear-preferencia', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total: total,
            userEmail: 'usuario@example.com',
            descripcionProducto: 'Compra en ecommerce',
            cantidad: 1,
            precioUnitario: total,
          }),
        });

        const { init_point } = await response.json();

        if (init_point) {
          window.open(init_point, '_blank');
          clearCarrito();
          onClose(); // Cierra el modal después de abrir la ventana de pago
        } else {
          console.error('Error: no se obtuvo el init_point');
          alert('Hubo un problema al crear la preferencia de pago.');
        }
      } else {
        // Simulación de efecto de carga para métodos de pago "Efectivo" y "Criptomonedas"
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Pausa de 1.5 segundos
        await createTicket(productos, selectedPaymentMethod);
        clearCarrito();
        alert('Compra realizada con éxito.');
        onClose(); // Cierra el modal después de una compra exitosa
      }
    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      alert('Hubo un problema con el pago. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[750px] h-[350px] rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute font-bold top-6 right-8 text-negro text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu método de pago</h2>

        <div className="flex flex-col space-y-4">
          <label className="flex items-center text-lg">
            <input
              type="radio"
              name="pago"
              value="MP"
              className="mr-2"
              onChange={handlePaymentMethodChange}
            />
            Mercado Pago
          </label>
          <label className="flex items-center text-lg">
            <input
              type="radio"
              name="pago"
              value="EFECTIVO"
              className="mr-2"
              onChange={handlePaymentMethodChange}
            />
            Efectivo
          </label>
          <label className="flex items-center text-lg">
            <input
              type="radio"
              name="pago"
              value="CRIPTO"
              className="mr-2"
              onChange={handlePaymentMethodChange}
            />
            Criptomonedas
          </label>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span className="text-3xl text-primary font-black">Total: ${total.toFixed(2)}</span>
          <button
            className={`relative py-2 px-4 rounded-lg text-lg flex items-center justify-center overflow-hidden ${
              selectedPaymentMethod === 'MP'
                ? 'btn-mercado-pago'
                : selectedPaymentMethod === 'EFECTIVO'
                ? 'btn-efectivo'
                : selectedPaymentMethod === 'CRIPTO'
                ? 'btn-cripto'
                : 'bg-primary text-white'
            }`}
            onClick={handleConfirmPayment}
            disabled={loading}
          >
            {selectedPaymentMethod === 'MP' && (
              <img
                src="/img/iconoMP/iconMp.png"
                alt="Icono Mercado Pago"
                className="w-6 h-6 mr-2"
              />
            )}
            {selectedPaymentMethod === 'EFECTIVO' && (
              <img
                src="/img/iconoMP/iconBillete.png"
                alt="Icono Efectivo"
                className="w-6 h-6 mr-2"
              />
            )}
            {selectedPaymentMethod === 'CRIPTO' && (
              <img
                src="/img/iconoMP/iconCoinBase.png"
                alt="Icono Criptomonedas"
                className="w-6 h-6 mr-2"
              />
            )}
            <div className={`progress-bar ${loading ? 'loading' : ''}`}></div>
            <span className="button-text">
              {selectedPaymentMethod === 'MP'
                ? 'Pagar con Mercado Pago'
                : selectedPaymentMethod === 'EFECTIVO'
                ? 'Pagar con Efectivo'
                : selectedPaymentMethod === 'CRIPTO'
                ? 'Pagar con Criptomonedas'
                : 'Pagar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetodoPagoModal;
