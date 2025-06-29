// src/modules/HU24_CompraIngredientes/components/ModalActualizarPreciosManufacturados.tsx

import { useState, useEffect } from 'react';
import type { ArticuloManufacturado } from '../../../types/Articulo';
import { updateArticuloManufacturado } from '../../../shared/services/articuloManufacturadoService';

interface InsumoCambioPrecio {
  insumoId: number;
  denominacion: string;
  precioAnterior: number;
  precioNuevo: number;
  porcentajeAumento: number;
}

interface ArticuloConPrecioActualizado {
  articulo: ArticuloManufacturado;
  precioVentaOriginal: number;
  precioVentaNuevo: number;
  precioSugerido: number;
  porcentajeAumentoSugerido: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  insumosConCambios: InsumoCambioPrecio[];
  articulosManufacturados: ArticuloManufacturado[];
  onActualizacionCompleta: () => void;
}

export const ModalActualizarPreciosManufacturados = ({
  open,
  onClose,
  insumosConCambios,
  articulosManufacturados,
  onActualizacionCompleta,
}: Props) => {
  const [articulosConPrecios, setArticulosConPrecios] = useState<ArticuloConPrecioActualizado[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular sugerencias de precios basadas en el aumento de insumos
  useEffect(() => {
    if (open && articulosManufacturados.length > 0 && insumosConCambios.length > 0) {
      const articulosConSugerencias = articulosManufacturados.map((articulo) => {
        // Calcular el porcentaje de aumento promedio de los insumos que usa este artículo
        const insumosDelArticulo = articulo.articuloManufacturadoDetalles
          .map((detalle) => detalle.articuloInsumo.id)
          .filter((insumoId) => insumosConCambios.some((cambio) => cambio.insumoId === insumoId));

        if (insumosDelArticulo.length === 0) {
          // Si este artículo no usa ningún insumo con cambio de precio, no sugerir cambio
          return {
            articulo,
            precioVentaOriginal: articulo.precioVenta,
            precioVentaNuevo: articulo.precioVenta,
            precioSugerido: articulo.precioVenta,
            porcentajeAumentoSugerido: 0,
          };
        }

        // Calcular porcentaje promedio de aumento de los insumos afectados
        const porcentajesAumento = insumosDelArticulo.map((insumoId) => {
          const cambio = insumosConCambios.find((c) => c.insumoId === insumoId);
          return cambio?.porcentajeAumento ?? 0;
        });

        const porcentajePromedioAumento =
          porcentajesAumento.reduce((a, b) => a + b, 0) / porcentajesAumento.length;

        // Sugerir un aumento más conservador (por ejemplo, 70% del aumento de los insumos)
        const factorConservador = 0.7;
        const porcentajeAumentoSugerido = porcentajePromedioAumento * factorConservador;
        const precioSugerido = articulo.precioVenta * (1 + porcentajeAumentoSugerido / 100);

        return {
          articulo,
          precioVentaOriginal: articulo.precioVenta,
          precioVentaNuevo: articulo.precioVenta,
          precioSugerido: Math.round(precioSugerido),
          porcentajeAumentoSugerido: Number(porcentajeAumentoSugerido.toFixed(2)),
        };
      });

      setArticulosConPrecios(articulosConSugerencias);
    }
  }, [open, articulosManufacturados, insumosConCambios]);

  const handlePrecioChange = (index: number, nuevoPrecio: number) => {
    setArticulosConPrecios((prev) =>
      prev.map((item, i) => (i === index ? { ...item, precioVentaNuevo: nuevoPrecio } : item))
    );
  };

  const handleAplicarSugerencia = (index: number) => {
    setArticulosConPrecios((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, precioVentaNuevo: item.precioSugerido } : item
      )
    );
  };

  const handleGuardarCambios = async () => {
    setLoading(true);
    setError(null);

    try {
      // Filtrar solo los artículos que tuvieron cambios de precio
      const articulosConCambios = articulosConPrecios.filter(
        (item) => item.precioVentaNuevo !== item.precioVentaOriginal
      );

      if (articulosConCambios.length === 0) {
        onActualizacionCompleta();
        onClose();
        return;
      }

      // Actualizar cada artículo manufacturado
      for (const item of articulosConCambios) {
        await updateArticuloManufacturado({
          ...item.articulo,
          precioVenta: item.precioVentaNuevo,
        });
      }

      onActualizacionCompleta();
      onClose();
    } catch (e) {
      console.error('Error al actualizar precios:', e);
      setError('Error al actualizar los precios de los artículos');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl h-[700px] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-center">
          📈 Actualizar Precios de Artículos Manufacturados
        </h2>

        {/* Información sobre los insumos con cambios */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <h3 className="text-blue-800 font-semibold mb-2">Insumos con cambios de precio:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {insumosConCambios.map((insumo) => (
              <div key={insumo.insumoId} className="text-sm text-blue-700">
                <span className="font-medium">{insumo.denominacion}</span>{' '}
                <span className="text-green-600">+{insumo.porcentajeAumento.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de artículos manufacturados */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {articulosConPrecios.map((item, index) => {
              const cambioRealPorcentaje =
                item.precioVentaOriginal > 0
                  ? ((item.precioVentaNuevo - item.precioVentaOriginal) /
                      item.precioVentaOriginal) *
                    100
                  : 0;

              return (
                <div key={item.articulo.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información del artículo */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{item.articulo.denominacion}</h4>
                      <p className="text-gray-600 text-sm">{item.articulo.descripcion}</p>
                      <div className="text-sm text-gray-500 mt-1">
                        Precio actual:{' '}
                        <span className="font-medium">${item.precioVentaOriginal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Sugerencia de precio */}
                    {item.porcentajeAumentoSugerido > 0 && (
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Precio sugerido:</div>
                        <div className="text-lg font-semibold text-green-600">
                          ${item.precioSugerido.toFixed(2)}
                        </div>
                        <div className="text-xs text-green-500">
                          +{item.porcentajeAumentoSugerido}%
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAplicarSugerencia(index)}
                          className="mt-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                        >
                          Aplicar
                        </button>
                      </div>
                    )}

                    {/* Input para nuevo precio */}
                    <div className="text-center">
                      <label className="block text-sm text-gray-600 mb-1">Nuevo precio:</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.precioVentaNuevo}
                        onChange={(e) => handlePrecioChange(index, Number(e.target.value))}
                        className="w-32 px-3 py-2 border rounded text-center"
                      />
                      {cambioRealPorcentaje !== 0 && (
                        <div
                          className={`text-xs mt-1 ${
                            cambioRealPorcentaje > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {cambioRealPorcentaje > 0 ? '+' : ''}
                          {cambioRealPorcentaje.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mt-4">{error}</div>}

        {/* Botones de acción */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardarCambios}
            disabled={loading}
            className={`bg-primary text-white px-6 py-2 rounded ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primarydark'
            }`}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalActualizarPreciosManufacturados;
