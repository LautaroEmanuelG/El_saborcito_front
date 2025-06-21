import React, { useEffect, useState } from 'react';
import type { ArticuloInsumo } from '../../../types/Articulo';
import * as articuloInsumoService from '../../../shared/services/articuloInsumoService';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';

interface ModalCompraSeleccionInsumoProps {
  open: boolean;
  onClose: () => void;
  onAddInsumo: (insumo: ArticuloInsumo, precioCosto: number, cantidad: number) => void;
  onAddMultipleInsumos?: (
    insumos: { insumo: ArticuloInsumo; precioCosto: number; cantidad: number }[]
  ) => void;
  insumosExistentes?: ArticuloInsumo[];
}

const ModalCompraSeleccionInsumo: React.FC<ModalCompraSeleccionInsumoProps> = ({
  open,
  onClose,
  onAddInsumo,
  onAddMultipleInsumos,
  insumosExistentes = [],
}) => {
  const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
  const [filteredInsumos, setFilteredInsumos] = useState<ArticuloInsumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsumos, setSelectedInsumos] = useState<
    Map<number, { precioCosto: number; cantidad: number }>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      loadInsumos();
      setSelectedInsumos(new Map());
      setSearchTerm('');
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = insumos.filter((insumo) =>
        insumo.denominacion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInsumos(filtered);
    } else {
      setFilteredInsumos(insumos);
    }
  }, [searchTerm, insumos]);

  const loadInsumos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await articuloInsumoService.getAllArticuloInsumos();
      setInsumos(data ?? []);
      setFilteredInsumos(data ?? []);
    } catch (err) {
      setError('Error al cargar insumos');
      console.error('Error loading insumos:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleAddInsumos = () => {
    if (selectedInsumos.size === 0 || !hasValidQuantities()) return;

    const insumosToAdd = Array.from(selectedInsumos.entries())
      .filter(([, data]) => data.cantidad > 0) // Solo incluir insumos con cantidad > 0
      .map(([insumoId, data]) => {
        const insumo = insumos.find((i) => i.id === insumoId)!;
        return { insumo, precioCosto: data.precioCosto, cantidad: data.cantidad };
      });

    if (onAddMultipleInsumos) {
      onAddMultipleInsumos(insumosToAdd);
    } else {
      // Fallback: agregar uno por uno si no se proporciona la función múltiple
      insumosToAdd.forEach(({ insumo, precioCosto, cantidad }) => {
        onAddInsumo(insumo, precioCosto, cantidad);
      });
    }
    onClose();
  };

  const handleInsumoToggle = (insumo: ArticuloInsumo) => {
    setSelectedInsumos((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(insumo.id!)) {
        newMap.delete(insumo.id!);
      } else {
        newMap.set(insumo.id!, {
          precioCosto: insumo.precioCompra ?? 0,
          cantidad: 0,
        });
      }
      return newMap;
    });
  };

  const handlePrecioCostoChange = (insumoId: number, precioCosto: number) => {
    setSelectedInsumos((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(insumoId);
      if (current) {
        newMap.set(insumoId, { ...current, precioCosto });
      }
      return newMap;
    });
  };

  const handleCantidadChange = (insumoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      setSelectedInsumos((prev) => {
        const newMap = new Map(prev);
        newMap.delete(insumoId);
        return newMap;
      });
    } else {
      setSelectedInsumos((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(insumoId);
        if (current) {
          newMap.set(insumoId, { ...current, cantidad });
        }
        return newMap;
      });
    }
  };

  // Verificar si todos los insumos seleccionados tienen cantidad > 0
  const hasValidQuantities = () => {
    if (selectedInsumos.size === 0) return false;
    return Array.from(selectedInsumos.values()).every((data) => data.cantidad > 0);
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="🍲 Seleccionar Insumos para Compra"
      maxWidth="max-w-4xl"
    >
      <div className="h-[65vh] flex flex-col">
        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {/* Vista previa de insumos seleccionados */}
          {selectedInsumos.size > 0 && (
            <div className="bg-blue-50 p-4 rounded border">
              <h4 className="font-medium text-blue-800 mb-2">
                Insumos seleccionados para compra ({selectedInsumos.size}):
              </h4>
              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Array.from(selectedInsumos.entries()).map(([insumoId, data]) => {
                    const insumo = insumos.find((i) => i.id === insumoId);
                    if (!insumo) return null;
                    return (
                      <div
                        key={insumoId}
                        className={`text-sm p-2 rounded border ${data.cantidad > 0 ? 'bg-white' : 'bg-gray-100'}`}
                      >
                        <div className="font-medium">{insumo.denominacion}</div>
                        <div
                          className={`text-gray-600 ${data.cantidad === 0 ? 'text-red-500' : ''}`}
                        >
                          {data.cantidad > 0
                            ? `Cantidad: ${data.cantidad} ${insumo.unidadMedida?.denominacion ?? ''}`
                            : 'Sin cantidad'}
                        </div>
                        <div className="text-green-600 font-semibold">
                          Precio: ${data.precioCosto}
                        </div>
                        {data.cantidad > 0 && (
                          <div className="text-blue-600 font-semibold">
                            Total: ${(data.cantidad * data.precioCosto).toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="font-semibold text-blue-800">
                  Total compra: $
                  {Array.from(selectedInsumos.entries())
                    .filter(([, data]) => data.cantidad > 0)
                    .reduce((total, [, data]) => total + data.cantidad * data.precioCosto, 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium mb-1">Buscar insumo</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Escribe para buscar..."
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Lista de insumos */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Seleccionar insumos para compra (haz clic para agregar/quitar)
            </label>
            {loading ? (
              <div className="text-center py-4">Cargando insumos...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : filteredInsumos.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                {searchTerm ? 'No se encontraron insumos' : 'No hay insumos disponibles'}
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border rounded p-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {filteredInsumos.map((insumo) => {
                    const yaSeleccionado = insumosExistentes.some(
                      (existing) => existing.id === insumo.id
                    );
                    const isSelected = selectedInsumos.has(insumo.id!);
                    const data = selectedInsumos.get(insumo.id!) || {
                      precioCosto: insumo.precioCompra ?? 0,
                      cantidad: 0,
                    };

                    return (
                      <div
                        key={insumo.id}
                        className={`p-3 rounded border transition-colors ${
                          isSelected
                            ? 'bg-blue-100 border-blue-300'
                            : yaSeleccionado
                              ? 'bg-yellow-50 border-yellow-300'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => !yaSeleccionado && handleInsumoToggle(insumo)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2">
                                {isSelected && <span className="text-blue-600">✓</span>}
                                {insumo.denominacion}
                                {yaSeleccionado && (
                                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                    Ya agregado
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                Stock: {insumo.stockActual}{' '}
                                {insumo.unidadMedida?.denominacion ?? ''}
                              </div>
                              <div className="text-sm text-gray-500">
                                Categoría: {insumo.categoria?.denominacion ?? 'Sin categoría'}
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-green-600">
                              ${insumo.precioCompra}
                            </div>
                          </div>
                        </div>

                        {/* Campos de precio y cantidad para insumos seleccionados */}
                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-blue-200 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium mb-1">
                                  Precio de costo<span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={data.precioCosto}
                                  onChange={(e) =>
                                    handlePrecioCostoChange(insumo.id!, Number(e.target.value))
                                  }
                                  min="0.01"
                                  step="0.01"
                                  className="w-full border rounded px-2 py-1 text-sm"
                                  placeholder="Precio"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">
                                  Cantidad ({insumo.unidadMedida?.denominacion ?? 'unidad'})
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={data.cantidad}
                                  onChange={(e) =>
                                    handleCantidadChange(insumo.id!, Number(e.target.value))
                                  }
                                  min="0.01"
                                  step="0.01"
                                  className="w-full border rounded px-2 py-1 text-sm"
                                  placeholder="Cantidad"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            {data.precioCosto > 0 && data.cantidad > 0 && (
                              <div className="text-xs text-blue-600 font-semibold">
                                Subtotal: ${(data.precioCosto * data.cantidad).toFixed(2)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-center items-center pt-4 border-t">
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`font-bold py-2 px-4 rounded bg-primary hover:bg-primarydark text-white ${
                selectedInsumos.size === 0 || !hasValidQuantities()
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
              }`}
              onClick={handleAddInsumos}
              disabled={selectedInsumos.size === 0 || !hasValidQuantities()}
            >
              Agregar{' '}
              {Array.from(selectedInsumos.values()).filter((data) => data.cantidad > 0).length}{' '}
              Insumo(s)
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalCompraSeleccionInsumo;
