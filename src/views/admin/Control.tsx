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
    // Inicializar los saldos de las cajas
    let saldoMP = 10000;
    let saldoCripto = 10000;
    let saldoEfectivo = 10000;
    let saldoMercaderia = 10000;

    const asientos = transaccions.map((transaccion) => {
      const detalles = transaccion.ticket.ticketProductos.map((tp: any) => ({
        producto: tp.producto.nombre,
        cantidad: tp.cantidad,
        precio: tp.producto.valor.precio,
        costo: tp.producto.valor.costo,
        ganancia: tp.producto.valor.precio - tp.producto.valor.costo,
      }));

      const debe = ['MP', 'EFECTIVO', 'CRIPTO'].includes(transaccion.tipo)
        ? detalles.reduce((acc: number, detalle: any) => acc + detalle.precio * detalle.cantidad, 0)
        : detalles.reduce((acc: number, detalle: any) => acc + detalle.costo * detalle.cantidad, 0);

      const haber = ['MP', 'EFECTIVO', 'CRIPTO'].includes(transaccion.tipo)
        ? detalles.reduce(
            (acc: number, detalle: any) =>
              acc + (detalle.costo + detalle.ganancia) * detalle.cantidad,
            0
          )
        : detalles.reduce((acc: number, detalle: any) => acc + detalle.costo * detalle.cantidad, 0);

      // Asignar al azar una de las otras cajas si el tipo es 'MERCADERIA'
      const cajas = ['MP', 'EFECTIVO', 'CRIPTO'];
      const cajaRandom = cajas[Math.floor(Math.random() * cajas.length)];

      // Actualizar los saldos de las cajas
      if (transaccion.tipo === 'MERCADERIA') {
        saldoMercaderia += debe;
        if (cajaRandom === 'MP') saldoMP -= haber;
        if (cajaRandom === 'CRIPTO') saldoCripto -= haber;
        if (cajaRandom === 'EFECTIVO') saldoEfectivo -= haber;
      } else {
        if (transaccion.tipo === 'MP') saldoMP += debe;
        if (transaccion.tipo === 'CRIPTO') saldoCripto += debe;
        if (transaccion.tipo === 'EFECTIVO') saldoEfectivo += debe;
        saldoMercaderia -= haber;
      }

      console.log('Saldos:', saldoMP, saldoCripto, saldoEfectivo, saldoMercaderia);
      return {
        id: transaccion.id,
        fecha: transaccion.fecha,
        tipo: transaccion.tipo,
        cajaAfectada: transaccion.tipo === 'MERCADERIA' ? cajaRandom : 'MERCADERIA',
        debe,
        haber,
        detalles,
        saldoMP,
        saldoCripto,
        saldoEfectivo,
        saldoMercaderia,
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
    return new Intl.DateTimeFormat('es-ES', options).format(new Date(dateString));
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

  const [selectedAsiento, setSelectedAsiento] = useState<any | null>(null);

  const handleAsientoSelect = (asientoId: string) => {
    const asiento = asientosContables.find((a) => a.id === asientoId);
    setSelectedAsiento(asiento || null);
  };

  const closeModal = () => {
    setSelectedAsiento(null);
  };

  const calcularSaldo = (selectedTipo: string) => {
    return asientosContables.reduce((acc, a) => {
      if (a.tipo === selectedTipo) {
        return acc + a.debe;
      } else if (a.cajaAfectada === selectedTipo) {
        return acc - a.haber;
      }
      return acc;
    }, 0);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Control de Asientos Contables</h1>

      {/* Mostrar Libro Mayor */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold pb-4">Libro Mayor</h2>
        <div className="flex justify-center mb-4">
          {/* Botones de selección de tipo */}
          {['MP', 'EFECTIVO', 'CRIPTO', 'MERCADERIA'].map((tipo) => (
            <button
              key={tipo}
              className={`px-4 py-2 mx-2 rounded ${
                selectedTipo === tipo ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
              onClick={() => handleTipoChange(tipo)}
            >
              {tipo}
            </button>
          ))}
        </div>
        {/* Filtros de fecha */}
        <div className="flex justify-center mb-4">
          <label htmlFor="date-desde" className="text-primary font-bold">
            Desde:{' '}
          </label>
          <input
            id="date-desde"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="px-4 py-2 mx-2 border rounded"
          />
          <label htmlFor="date-hasta" className="text-primary font-bold">
            Hasta:{' '}
          </label>
          <input
            id="date-hasta"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="px-4 py-2 mx-2 border rounded"
          />
        </div>
        {/* Lista de asientos en formato tabla */}
        <div className="border border-gray-300 rounded-lg overflow-auto max-h-[480px]  shadow-md">
          <div className="grid grid-cols-5 h-10 place-content-center font-semibold bg-gray-200 text-center">
            <div>ID</div>
            <div>Fecha</div>
            <div>Caja</div>
            <div>Debe</div>
            <div>Haber</div>
          </div>
          {asientosContables
            .slice()
            .reverse()
            // .filter(asiento => asiento.tipo === selectedTipo)
            .filter(filterByDate)
            .map((asiento) =>
              selectedTipo === 'MERCADERIA' ? (
                <>
                  <div
                    key={asiento.id}
                    className="grid grid-cols-5 place-content-center min-h-12 text-center border-t hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAsientoSelect(asiento.id)}
                  >
                    <div>{asiento.id}</div>
                    <div>{formatDate(asiento.fecha)}</div>
                    <div>{'MERCADERIA'}</div>
                    <div>{asiento.tipo === 'MERCADERIA' ? formatCurrency(asiento.debe) : null}</div>
                    <div>
                      {asiento.tipo === 'MERCADERIA' ? null : formatCurrency(asiento.haber)}
                    </div>
                  </div>
                </>
              ) : (asiento.tipo === 'MP' || asiento.cajaAfectada === 'MP') &&
                selectedTipo === 'MP' ? (
                <div
                  key={asiento.id}
                  className="grid grid-cols-5 place-content-center min-h-12 text-center border-t hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleAsientoSelect(asiento.id)}
                >
                  <div>{asiento.id}</div>
                  <div>{formatDate(asiento.fecha)}</div>
                  <div>{'MP'}</div>
                  <div>{asiento.tipo === 'MERCADERIA' ? null : formatCurrency(asiento.debe)}</div>
                  <div>{asiento.tipo === 'MERCADERIA' ? formatCurrency(asiento.haber) : null}</div>
                </div>
              ) : (asiento.tipo === 'CRIPTO' || asiento.cajaAfectada === 'CRIPTO') &&
                selectedTipo === 'CRIPTO' ? (
                <div
                  key={asiento.id}
                  className="grid grid-cols-5 place-content-center min-h-12 text-center border-t hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleAsientoSelect(asiento.id)}
                >
                  <div>{asiento.id}</div>
                  <div>{formatDate(asiento.fecha)}</div>
                  <div>{'CRIPTO'}</div>
                  <div>{asiento.tipo === 'MERCADERIA' ? null : formatCurrency(asiento.debe)}</div>
                  <div>{asiento.tipo === 'MERCADERIA' ? formatCurrency(asiento.haber) : null}</div>
                </div>
              ) : (asiento.tipo === 'EFECTIVO' || asiento.cajaAfectada === 'EFECTIVO') &&
                selectedTipo === 'EFECTIVO' ? (
                <div
                  key={asiento.id}
                  className="grid grid-cols-5 place-content-center min-h-12 text-center border-t hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleAsientoSelect(asiento.id)}
                >
                  <div>{asiento.id}</div>
                  <div>{formatDate(asiento.fecha)}</div>
                  <div>{'EFECTIVO'}</div>
                  <div>{asiento.tipo === 'MERCADERIA' ? null : formatCurrency(asiento.debe)}</div>
                  <div>{asiento.tipo === 'MERCADERIA' ? formatCurrency(asiento.haber) : null}</div>
                </div>
              ) : null
            )}
        </div>
        <div className="mt-4 font-semibold text-right cursor-pointer mb-12 bg-primary py-2 px-4 rounded-lg text-white text-3xl">
          Saldo: {formatCurrency(calcularSaldo(selectedTipo))}
        </div>
      </div>

      {/* Mostrar Asientos Contables */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold pb-4">Libro Diario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {asientosContables.map((asiento) => (
            <div
              key={asiento.id}
              className="p-4 border border-gray-300 rounded-lg shadow-md bg-white"
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Asiento ID: {asiento.id}</h3>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Fecha:</span> {formatDate(asiento.fecha)}
              </div>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Debe:</span> {formatCurrency(asiento.debe)}
              </div>

              <div className="text-lg text-gray-600">
                <span className="pl-4 font-medium">- Caja:</span> {asiento.tipo}
              </div>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Haber:</span> {formatCurrency(asiento.haber)}
              </div>
              <div className="text-lg text-gray-600">
                <span className="pl-4 font-medium">- Caja:</span> {asiento.cajaAfectada}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para Asiento Seleccionado */}
      {selectedAsiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <button
              className="absolute font-bold top-2 right-2 text-negro text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
              onClick={closeModal}
            >
              X
            </button>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Asiento ID: {selectedAsiento.id}
            </h3>
            <div className="text-lg text-gray-600">
              <span className="font-medium">Fecha:</span> {formatDate(selectedAsiento.fecha)}
            </div>
            {selectedAsiento.tipo === 'MERCADERIA' ? (
              <>
                <div className="text-lg text-gray-600">
                  <span className="font-medium">Debe:</span> {formatCurrency(selectedAsiento.debe)}
                </div>
                <div className="text-lg text-gray-600">
                  <span className="pl-4 font-medium">- Caja:</span> MERCADERIA
                </div>
                <div className="text-lg text-gray-600">
                  <span className="font-medium">Haber:</span>{' '}
                  {formatCurrency(selectedAsiento.haber)}
                </div>
              </>
            ) : (
              <>
                <div className="text-lg text-gray-600">
                  <span className="font-medium">Debe:</span> {formatCurrency(selectedAsiento.debe)}
                </div>
                <div className="text-lg text-gray-600">
                  <span className="pl-4 font-medium">- Caja:</span> {selectedAsiento.tipo}
                </div>
                <div className="text-lg text-gray-600">
                  <span className="font-medium">Haber:</span>{' '}
                  {formatCurrency(selectedAsiento.haber)}
                </div>
                <div className="text-lg text-gray-600">
                  <span className="pl-4 font-medium">- Caja:</span> MERCADERIA
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
