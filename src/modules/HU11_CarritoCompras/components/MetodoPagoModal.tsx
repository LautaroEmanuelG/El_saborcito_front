import React, { useState, useEffect } from 'react';
import { useCart } from '../../../shared/hooks/useCart';
import { createTicket } from '../../../shared/services/antiguos/ticketService';

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
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC'); // Default to BTC
  const [loading, setLoading] = useState(false);
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cryptoOptions = ['BTC', 'USDT', 'BNB']; // Available cryptos

  // Mapeo de monedas
  const coinMap: Record<string, string> = {
    usdt: 'tether',
    btc: 'bitcoin',
    bnb: 'binancecoin',
    // Agrega más monedas según sea necesario
  };

  const monedaId =
    (selectedCrypto && coinMap[selectedCrypto.toLowerCase()]) || selectedCrypto.toLowerCase();

  useEffect(() => {
    const fetchConversionRate = async () => {
      try {
        setError(null);
        if (!monedaId) {
          throw new Error('Moneda no válida');
        }

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${monedaId}&vs_currencies=ars`
        );

        if (!response.ok) {
          throw new Error(`Error al conectar con la API: ${response.statusText}`);
        }

        const data = await response.json();
        if (data[monedaId]?.ars) {
          setConversionRate(data[monedaId].ars);
        } else {
          throw new Error(`Moneda ${selectedCrypto} no encontrada en la API`);
        }
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    if (selectedCrypto) {
      fetchConversionRate();
    }
  }, [selectedCrypto]);

  // Cargando mientras obtenemos la tasa de conversión
  const totalEnCripto = conversionRate ? (total / conversionRate).toFixed(8) : 'Cargando...';

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(event.target.value);
    setSelectedCrypto(''); // Reset crypto selection if switching payment method
  };

  const handleCryptoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCrypto(event.target.value);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }

    setLoading(true);

    try {
      if (selectedPaymentMethod === 'MP') {
        // Mercado Pago Payment
        const productos = carrito.map((producto) => ({
          productoId: producto.id ?? 0,
          cantidad: producto.quantity,
        }));

        await createTicket(productos, selectedPaymentMethod);
        const response = await fetch('http://localhost:5252/api/mp/crear-preferencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          onClose();
        } else {
          alert('Error al crear la preferencia de pago con Mercado Pago.');
        }
      } else if (selectedPaymentMethod === 'CRIPTO') {
        // Coinbase Commerce Crypto Payment
        // Simulate crypto payment success after 2 seconds
        const productos = carrito.map((producto) => ({
          productoId: producto.id ?? 0,
          cantidad: producto.quantity,
        }));

        await createTicket(productos, selectedPaymentMethod);
        alert(`Pago exitoso con ${selectedCrypto}`);
        clearCarrito();
        onClose();
        // Redirigir a la página de compra exitosa
        // const tipoPago = 'cripto';
        // const url = `/compra-exitosa?total=${total}&tipoPago=${tipoPago}&moneda=${selectedCrypto}`;
        // window.location.href = url; // Redirección a la página de compra exitosa
      } else {
        // Efectivo or other payment methods
        const productos = carrito.map((producto) => ({
          productoId: producto.id ?? 0,
          cantidad: producto.quantity,
        }));
        await createTicket(productos, selectedPaymentMethod);
        clearCarrito();
        alert('Compra realizada con éxito.');
        onClose();
        // const tipoPago = 'efectivo';
        // const url = `/compra-exitosa?total=${total}&tipoPago=${tipoPago}`;
        // window.location.href = url; // Redirección a la página de compra exitosa
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
      <div className="bg-white rounded-lg mx-6 shadow-lg p-4 relative">
        <button
          className="absolute font-bold top-2 right-2 sm:top-6 sm:right-8 text-negro sm:text-xl hover:text-blanco hover:bg-primary rounded-full w-6 h-6 sm:w-10 sm:h-10"
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

        {selectedPaymentMethod === 'CRIPTO' && (
          <div className="mt-6">
            <label htmlFor="crypto-select" className="block text-lg font-medium mb-2">
              Selecciona la moneda:
            </label>
            <select
              id="crypto-select"
              className="border border-gray-300 rounded-lg p-2 w-full"
              value={selectedCrypto}
              onChange={handleCryptoChange}
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              {cryptoOptions.map((crypto) => (
                <option key={crypto} value={crypto}>
                  {crypto}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex justify-end align-bottom w-full gap-6 mt-6">
          <div className="flex flex-col flex-1 h-full w-full">
            {selectedPaymentMethod === 'CRIPTO' && selectedCrypto ? (
              <>
                <span className="text-lg sm:text-2xl text-primary font-black">
                  Total en {selectedCrypto}: {totalEnCripto}
                </span>
                <span className="text-sm sm:text-lg text-black  font-bold">
                  Total: ${total.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg sm:text-2xl text-primary font-black">
                Total: ${total.toFixed(2)}
              </span>
            )}
          </div>
          <button
            className={`relative py-2 px-4 h-10 sm:h-14 w-42 sm:w-80 rounded-lg sm:text-lg flex justify-end overflow-hidden ${
              selectedPaymentMethod === 'MP'
                ? 'btn-mercado-pago'
                : selectedPaymentMethod === 'EFECTIVO'
                  ? 'btn-efectivo'
                  : selectedPaymentMethod === 'CRIPTO'
                    ? 'btn-cripto'
                    : null
            }`}
            onClick={handleConfirmPayment}
            disabled={loading}
            style={{
              visibility: selectedPaymentMethod ? 'visible' : 'hidden',
            }}
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
              <span className="hidden sm:inline">
                {selectedPaymentMethod === 'MP'
                  ? 'Pagar con '
                  : selectedPaymentMethod === 'EFECTIVO'
                    ? 'Pagar con '
                    : selectedPaymentMethod === 'CRIPTO'
                      ? 'Pagar con '
                      : null}
              </span>
              {selectedPaymentMethod === 'MP'
                ? 'Mercado Pago'
                : selectedPaymentMethod === 'EFECTIVO'
                  ? 'Efectivo'
                  : selectedPaymentMethod === 'CRIPTO'
                    ? 'Criptomonedas'
                    : null}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetodoPagoModal;
