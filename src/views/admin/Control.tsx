import React, { useEffect, useState } from 'react';
import { getAllTransaccion } from '../../utils/services/axios/transaccionService';

export const Control: React.FC = () => {
  const [transaccions, setTransaccions] = useState<any[]>([]);
  const [asientosContables, setAsientosContables] = useState<any[]>([]);
  const [libroDiario, setLibroDiario] = useState<any[]>([]);
  const [libroMayor, setLibroMayor] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const transaccionsData = await getAllTransaccion();
    setTransaccions(transaccionsData);
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
        : detalles.reduce((acc: number, detalle: any) => acc + detalle.costo, 0);

      const haber = ['MP', 'EFECTIVO', 'CRIPTO'].includes(transaccion.tipo)
        ? detalles.reduce((acc: number, detalle: any) => acc + detalle.costo + detalle.ganancia, 0)
        : detalles.reduce((acc: number, detalle: any) => acc + detalle.costo, 0);

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
    generateLibroDiario(asientos);
    generateLibroMayor(asientos);
  };

  const generateLibroDiario = (asientos: any[]) => {
    const diario = asientos.map(asiento => ({
      fecha: asiento.fecha,
      descripcion: `Venta de productos - Transacción ID: ${asiento.id}`,
      debe: asiento.debe,
      haber: asiento.haber,
    }));
    setLibroDiario(diario);
  };

  const generateLibroMayor = (asientos: any[]) => {
    const mayor = asientos.reduce((acc, asiento) => {
      asiento.detalles.forEach((detalle: any) => {
        if (!acc[detalle.producto]) {
          acc[detalle.producto] = { debe: 0, haber: 0 };
        }
        if (['MP', 'EFECTIVO', 'CRIPTO'].includes(asiento.tipo)) {
          acc[detalle.producto].haber += detalle.ganancia * detalle.cantidad;
        } else if (asiento.tipo === 'MERCADERIA') {
          acc[detalle.producto].debe += detalle.precio * detalle.cantidad;
          acc[detalle.producto].haber += detalle.precio * detalle.cantidad;
        }
      });
      return acc;
    }, {});
    setLibroMayor(Object.entries(mayor).map(([producto, valores]) => ({
      producto,
      ...valores,
    })));
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Control de Asientos Contables</h1>

      {/* Mostrar Asientos Contables */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Asientos Contables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {asientosContables.map(asiento => (
            <div
              key={asiento.id}
              className="p-4 border border-gray-300 rounded-lg shadow-md bg-white">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Asiento ID: {asiento.id}
              </h3>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Fecha:</span> {formatDate(asiento.fecha)}
              </div>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Debe:</span> {formatCurrency(asiento.debe)}
              </div>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Haber:</span> {formatCurrency(asiento.haber)}
              </div>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Caja:</span> {asiento.tipo}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <h4 className="font-semibold">Detalles:</h4>
                <ul>
                  {asiento.detalles.map((detalle: any, index: number) => (
                    <li key={index}>
                      {detalle.cantidad} x {detalle.producto} - Precio: {formatCurrency(detalle.precio)} - Costo: {formatCurrency(detalle.costo)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mostrar Libro Diario */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Libro Diario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {libroDiario.map((entry, index) => (
            <div
              key={index}
              className="p-4 border border-gray-300 rounded-lg shadow-md bg-white">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {formatDate(entry.fecha)}
              </h3>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Descripción:</span> {entry.descripcion}
              </div>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Debe:</span> {formatCurrency(entry.debe)}
              </div>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Haber:</span> {formatCurrency(entry.haber)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mostrar Libro Mayor */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Libro Mayor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {libroMayor.map((entry, index) => (
            <div
              key={index}
              className="p-4 border border-gray-300 rounded-lg shadow-md bg-white">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Producto: {entry.producto}
              </h3>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Debe:</span> {formatCurrency(entry.debe)}
              </div>
              <div className="text-lg text-gray-600">
                <span className="font-medium">Haber:</span> {formatCurrency(entry.haber)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};