import React, { useEffect, useState } from 'react';
import { getAllTransaccion } from '../../utils/services/axios/transaccionService';

export const Control: React.FC = () => {
  const [asientosContables, setAsientosContables] = useState<any[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<string>('MP');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const transaccionsData = await getAllTransaccion();
    generateAsientosContables(transaccionsData);
  };

  const generateAsientosContables = (transaccions: any[]) => {
    const asientos = transaccions.map(transaccion => {
      const detalles = transaccion.ticket.ticketProductos.map((tp: any) => ({
        producto: tp.producto.nombre,
        cantidad: tp.cantidad,
        precio: tp.producto.valor.precio,
        costo: tp.producto.valor.costo,
        ganancia: tp.producto.valor.precio - tp.producto.valor.costo,
      }));

      const debe = ['MP', 'EFECTIVO', 'CRIPTO'].includes(transaccion.tipo)
        ? detalles.reduce((acc: number, detalle: any) => acc + detalle.precio, 0)
        : detalles.reduce(
            (acc: number, detalle: any) => acc + detalle.costo * detalle.cantidad,
            0
          );

      const haber = ['MP', 'EFECTIVO', 'CRIPTO'].includes(transaccion.tipo)
        ? detalles.reduce(
            (acc: number, detalle: any) => acc + detalle.costo + detalle.ganancia,
            0
          )
        : detalles.reduce(
            (acc: number, detalle: any) => acc + detalle.costo * detalle.cantidad,
            0
          );

      return {
        id: transaccion.id,
        fecha: transaccion.fecha,
        tipo: transaccion.tipo,
        debe,
        haber,
        detalles,
      };
    });
    setAsientosContables(asientos);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Intl.DateTimeFormat('es-ES', options).format(
      new Date(dateString)
    );
  };

  const handleTipoChange = (tipo: string) => {
    setSelectedTipo(tipo);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setEndDate(event.target.value);
  };

  const filterByDate = (asiento: any) => {
    const asientoDate = new Date(asiento.fecha).toISOString().split('T')[0]; // Asegura que esté en formato 'YYYY-MM-DD'
    const start = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
    const end = endDate ? new Date(endDate).toISOString().split('T')[0] : null;
  
    return (!start || asientoDate >= start) && (!end || asientoDate <= end);
  };
  

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Control de Asientos Contables</h1>

      {/* Mostrar Asientos Contables */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold pb-4">Libro Diario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {asientosContables.map(asiento => (
            <div
              key={asiento.id}
              className="p-4 border border-gray-300 rounded-lg shadow-md bg-white">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Asiento ID: {asiento.id}
              </h3>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Fecha:</span>{' '}
                {formatDate(asiento.fecha)}
              </div>
              {asiento.tipo === 'MERCADERIA' ? (
                <>
                  <div className="text-lg text-gray-600">
                    <span className="font-medium">Debe:</span>{' '}
                    {formatCurrency(asiento.debe)}
                  </div>
                  
                  <div className="text-lg text-gray-600">
                    <span className="pl-4 font-medium">- Caja:</span> MERCADERIA
                  </div>
                  <div className="text-lg text-gray-600">
                    <span className="font-medium">Haber:</span>{' '}
                    {formatCurrency(asiento.haber)}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg text-gray-600">
                    <span className="font-medium">Debe:</span>{' '}
                    {formatCurrency(asiento.debe)}
                  </div>
                  <div className="text-lg text-gray-600">
                    <span className="pl-4 font-medium">- Caja:</span> {asiento.tipo}
                  </div>
                  <div className="text-lg text-gray-600">
                    <span className="font-medium">Haber:</span>{' '}
                    {formatCurrency(asiento.haber)}
                  </div>
                  
                  <div className="text-lg text-gray-600">
                    <span className="pl-4 font-medium">- Caja:</span> MERCADERIA
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mostrar Libro Mayor */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold pb-4">Libro Mayor</h2>
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 mx-2 rounded ${selectedTipo === 'MP' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            onClick={() => handleTipoChange('MP')}
          >
            MP
          </button>
          <button
            className={`px-4 py-2 mx-2 rounded ${selectedTipo === 'EFECTIVO' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            onClick={() => handleTipoChange('EFECTIVO')}
          >
            EFECTIVO
          </button>
          <button
            className={`px-4 py-2 mx-2 rounded ${selectedTipo === 'CRIPTO' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            onClick={() => handleTipoChange('CRIPTO')}
          >
            CRIPTO
          </button>
          <button
            className={`px-4 py-2 mx-2 rounded ${selectedTipo === 'MERCADERIA' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            onClick={() => handleTipoChange('MERCADERIA')}
          >
            MERCADERIA
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="px-4 py-2 mx-2 border rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="px-4 py-2 mx-2 border rounded"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {asientosContables
            .filter(asiento => asiento.tipo === selectedTipo)
            .filter(filterByDate)
            .map((asiento) => (
              <div
              key={asiento.id}
              className="p-4 border border-gray-300 rounded-lg shadow-md bg-white">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Asiento ID: {asiento.id}
              </h3>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Fecha:</span>{' '}
                {formatDate(asiento.fecha)}
              </div>
              {asiento.tipo === 'MERCADERIA' ? (
                <>
                  <div className="text-lg text-gray-600">
                    <span className="font-medium">Debe:</span>{' '}
                    {formatCurrency(asiento.debe)}
                  </div>
                  
                  <div className="text-lg text-gray-600">
                    <span className="pl-4 font-medium">- Caja:</span> MERCADERIA
                  </div>
                  <div className="text-lg text-gray-600">
                    <span className="font-medium">Haber:</span>{' '}
                    {formatCurrency(asiento.haber)}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg text-gray-600">
                    <span className="font-medium">Debe:</span>{' '}
                    {formatCurrency(asiento.debe)}
                  </div>
                  <div className="text-lg text-gray-600">
                    <span className="pl-4 font-medium">- Caja:</span> {asiento.tipo}
                  </div>
                  <div className="text-lg text-gray-600">
                    <span className="font-medium">Haber:</span>{' '}
                    {formatCurrency(asiento.haber)}
                  </div>
                  
                  <div className="text-lg text-gray-600">
                    <span className="pl-4 font-medium">- Caja:</span> MERCADERIA
                  </div>
                </>
              )}
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};