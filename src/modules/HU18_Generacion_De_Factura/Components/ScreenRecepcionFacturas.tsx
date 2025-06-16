import React, { useState } from 'react';
import FacturaAdmin from './FacturaAdmin';
import IconoBuscador from '../../../assets/svgs/icons/IconoBuscador';

const ScreenRecepcionFacturas: React.FC = () => {
  const [pedidoId, setPedidoId] = useState<string>('');
  const [pedidoBuscado, setPedidoBuscado] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPedidoBuscado(null);
    if (!pedidoId || isNaN(Number(pedidoId))) {
      setError('Ingrese un ID de pedido válido');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setPedidoBuscado(Number(pedidoId));
      setLoading(false);
    }, 500); // Simula búsqueda
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
        <div className="w-7 h-7 text-primary">
          <IconoBuscador />
        </div>
        Recepción de Facturas
      </h1>
      <form onSubmit={handleBuscar} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="ID de pedido"
          value={pedidoId}
          onChange={(e) => setPedidoId(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primarydark transition-colors font-semibold"
        >
          <div className="w-5 h-5">
            <IconoBuscador />
          </div>
          Buscar
        </button>
      </form>
      {loading && <div className="text-center text-primary font-medium py-4">Buscando...</div>}
      {error && <div className="text-center text-red-600 font-medium py-2">{error}</div>}
      {pedidoBuscado && !loading && (
        <div className="mt-6">
          <FacturaAdmin pedidoId={pedidoBuscado} className="" mostrarSiempre={true} />
        </div>
      )}
    </div>
  );
};

export { ScreenRecepcionFacturas };
