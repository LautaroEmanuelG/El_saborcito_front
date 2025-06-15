import type React from 'react';

interface ProductoResumen {
  denominacion: string;
  cantidad: number;
  precioVenta: number;
  tipo?: 'producto' | 'promocion';
  precioPromocional?: number;
}

export const ProductSummary: React.FC<{
  productos: ProductoResumen[];
  promociones?: any[];
  total: number;
  descuento?: number;
  showDiscount?: boolean;
}> = ({ productos, promociones = [], total, descuento = 0, showDiscount = false }) => {
  // Función para obtener el precio correcto según el tipo
  const getPrecioItem = (item: ProductoResumen): number => {
    if (item.tipo === 'promocion') {
      return item.precioPromocional ?? item.precioVenta;
    }
    return item.precioVenta;
  };

  // Combinar productos y promociones para mostrar
  const todosLosItems = [
    ...productos.map((item) => ({ ...item, tipo: 'producto' as const })),
    ...promociones.map((item) => ({
      denominacion: item.promocion?.denominacion ?? item.denominacion,
      cantidad: item.cantidad,
      precioVenta: item.promocion?.precioPromocional ?? item.precioPromocional ?? item.precioVenta,
      tipo: 'promocion' as const,
      precioPromocional: item.promocion?.precioPromocional ?? item.precioPromocional,
    })),
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">📋 Resumen de productos</h3>
      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
        {todosLosItems.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{item.denominacion}</p>
                {item.tipo === 'promocion' && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    🎁 PROMO
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">Cantidad: {item.cantidad}</p>
            </div>
            <p className="font-semibold text-sm">
              ${(getPrecioItem(item) * item.cantidad).toFixed(2)}
            </p>
          </div>
        ))}

        {todosLosItems.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No hay productos en el carrito</p>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <div className="text-right">
            {showDiscount && descuento > 0 && (
              <p className="text-sm text-gray-500 line-through">${total.toFixed(2)}</p>
            )}
            <p className="text-xl font-bold text-primary">${(total - descuento).toFixed(2)}</p>
          </div>
        </div>
        {showDiscount && descuento > 0 && (
          <div className="mt-2 text-sm text-green-600 text-right">
            💰 Descuento: -${descuento.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};
