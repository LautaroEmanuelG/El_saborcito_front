import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BtnFlotanteCarrito from '../../components/carrito/BtnFlotanteCarrito';

const CompraExitosa = () => {
  const query = new URLSearchParams(useLocation().search);
  const moneda = query.get('moneda')?.toLowerCase(); // Moneda en caso de pago con cripto
  const total = parseFloat(query.get('total') || '0'); // Total en ARS
  const tipoPago = query.get('tipoPago'); // tipoPago: "efectivo" o "cripto"

  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mapeo de monedas
  const coinMap: Record<string, string> = {
    usdt: "tether",
    btc: "bitcoin",
    bnb: "binancecoin",
    // Agrega más monedas según sea necesario
  };

  const monedaId = moneda && coinMap[moneda] || moneda;

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
          throw new Error(`Moneda ${moneda} no encontrada en la API`);
        }
      } catch (err: unknown) {
        console.error(err);
        setError((err instanceof Error) ? err.message : 'Error desconocido');
      }
    };

    if (moneda && tipoPago === 'cripto') {
      fetchConversionRate();
    }
  }, [moneda, tipoPago]);

  // Cargando mientras obtenemos la tasa de conversión
  const totalEnCripto = conversionRate ? (total / conversionRate).toFixed(8) : "Cargando...";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full">

      <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col w-full">
        {error ? (
          <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg w-full sm:w-96 text-center">
            <h1 className="text-2xl font-bold mb-4">Error en la compra</h1>
            <p className="text-lg">{error}</p>
          </div>
        ) : (
          <div className="bg-white text-gray-800 p-8 rounded-lg shadow-lg w-full sm:w-96">
            <h1 className="text-3xl font-semibold text-center mb-6 text-blue-600">Compra Exitosa</h1>
            <div className="space-y-4">
              <p className="text-lg">
                <span className="font-medium">Tipo de pago:</span> {tipoPago === 'efectivo' ? 'Efectivo' : moneda?.toUpperCase()}
              </p>
              <p className="text-lg">
                <span className="font-medium">Total pagado en ARS:</span> ${total.toLocaleString()}
              </p>
              {tipoPago === 'cripto' && (
                <p className="text-lg">
                  <span className="font-medium">Total pagado en {moneda?.toUpperCase()}:</span> {totalEnCripto}
                </p>
              )}
            </div>
            {!conversionRate && tipoPago === 'cripto' && (
              <div className="mt-6 text-center">
                <div className="spinner-border animate-spin border-4 border-t-4 border-white rounded-full w-10 h-10 mx-auto"></div>
                <p className="mt-4 text-xl text-white">Cargando tasa de conversión...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón flotante del carrito */}
      <BtnFlotanteCarrito productCount={0} />
    </div>
  );
};

export default CompraExitosa;
