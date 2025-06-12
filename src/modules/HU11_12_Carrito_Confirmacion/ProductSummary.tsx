import type React from 'react';

export const ProductSummary: React.FC<{
  productos: any[];
  total: number;
  descuento?: number;
  showDiscount?: boolean;
}> = ({ productos, total, descuento = 0, showDiscount = false }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Resumen de productos</h3>
    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
      {productos.map((producto, index) => (
        <div
          key={index}
          className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
        >
          <div className="flex-1">
            <p className="font-medium text-sm">{producto.denominacion}</p>
            <p className="text-xs text-gray-600">Cantidad: {producto.cantidad}</p>
          </div>
          <p className="font-semibold text-sm">
            ${(producto.precioVenta * producto.cantidad).toFixed(2)}
          </p>
        </div>
      ))}
    </div>

    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Total:</span>
        <div className="text-right">
          {showDiscount && (
            <p className="text-sm text-gray-500 line-through">${total.toFixed(2)}</p>
          )}
          <p className="text-xl font-bold text-primary">${(total - descuento).toFixed(2)}</p>
        </div>
      </div>
    </div>
  </div>
);
