import React, { useEffect, useState } from 'react';
import type { ArticuloInsumo } from '../../../types/Articulo';
import * as articuloInsumoService from '../../../shared/services/articuloInsumoService';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';

interface ModalSeleccionInsumosProps {
  open: boolean;
  onClose: () => void;
  onAddInsumo: (insumo: ArticuloInsumo, cantidad: number) => void;
  onAddMultipleInsumos?: (insumos: { insumo: ArticuloInsumo; cantidad: number }[]) => void;
  insumosExistentes?: ArticuloInsumo[]; // Insumos que ya están en la lista
}

const ModalSeleccionInsumos: React.FC<ModalSeleccionInsumosProps> = ({
  open,
  onClose,
  onAddInsumo,
  onAddMultipleInsumos,
  insumosExistentes = [],
}) => {
  const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
  const [filteredInsumos, setFilteredInsumos] = useState<ArticuloInsumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsumos, setSelectedInsumos] = useState<Map<number, number>>(new Map()); // Map de id del insumo -> cantidad
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      loadInsumos();
      // Resetear formulario al abrir
      setSelectedInsumos(new Map());
      setSearchTerm('');
    }
  }, [open]);

  useEffect(() => {
    // Filtrar insumos basado en el término de búsqueda
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
      const data = await articuloInsumoService.getAllArticuloInsumoEsParaElaborar();
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
      .filter(([, cantidad]) => cantidad > 0) // Solo incluir insumos con cantidad > 0
      .map(([insumoId, cantidad]) => {
        const insumo = insumos.find((i) => i.id === insumoId)!;
        return { insumo, cantidad };
      });

    if (onAddMultipleInsumos) {
      onAddMultipleInsumos(insumosToAdd);
    } else {
      // Fallback: agregar uno por uno si no se proporciona la función múltiple
      insumosToAdd.forEach(({ insumo, cantidad }) => {
        onAddInsumo(insumo, cantidad);
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
        newMap.set(insumo.id!, 0); // Cantidad por defecto
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
        newMap.set(insumoId, cantidad);
        return newMap;
      });
    }
  };

  // Verificar si todos los insumos seleccionados tienen cantidad > 0
  const hasValidQuantities = () => {
    if (selectedInsumos.size === 0) return false;
    return Array.from(selectedInsumos.values()).every((cantidad) => cantidad > 0);
  };
  return (
    <Modal open={open} onClose={onClose} title="🍲 Seleccionar Insumos" maxWidth="max-w-4xl">
      <div className="h-[65vh] flex flex-col">
        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {/* Vista previa de insumos seleccionados */}
          {selectedInsumos.size > 0 && (
            <div className="bg-blue-50 p-4 rounded border">
              <h4 className="font-medium text-blue-800 mb-2">
                Insumos seleccionados ({selectedInsumos.size}):
              </h4>
              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Array.from(selectedInsumos.entries()).map(([insumoId, cantidad]) => {
                    const insumo = insumos.find((i) => i.id === insumoId);
                    if (!insumo) return null;
                    return (
                      <div
                        key={insumoId}
                        className={`text-sm p-2 rounded border ${cantidad > 0 ? 'bg-white' : 'bg-gray-100'}`}
                      >
                        <div className="font-medium">{insumo.denominacion}</div>
                        <div className={`text-gray-600 ${cantidad === 0 ? 'text-red-500' : ''}`}>
                          {cantidad > 0
                            ? `${cantidad} ${insumo.unidadMedida?.denominacion ?? ''}`
                            : 'Sin cantidad'}
                        </div>
                      </div>
                    );
                  })}
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
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Seleccionar insumos (haz clic para agregar/quitar)
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
                    const cantidad = selectedInsumos.get(insumo.id!) || 0;

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

                        {/* Campo de cantidad para insumos seleccionados */}
                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <label className="block text-xs font-medium mb-1">
                              Cantidad ({insumo.unidadMedida?.denominacion ?? 'unidad'})
                            </label>
                            <input
                              type="number"
                              value={cantidad}
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
              {Array.from(selectedInsumos.values()).filter((cantidad) => cantidad > 0).length}{' '}
              Insumo(s)
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalSeleccionInsumos;
