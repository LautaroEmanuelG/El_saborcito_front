import React, { useEffect, useState } from 'react';
import type { ArticuloInsumo } from '../../../types/Articulo';
import * as articuloInsumoService from '../../../shared/services/articuloInsumoService';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';

interface ModalSeleccionInsumosProps {
  open: boolean;
  onClose: () => void;
  onAddInsumo: (insumo: ArticuloInsumo, cantidad: number) => void;
  insumosExistentes?: ArticuloInsumo[]; // Insumos que ya están en la lista
}

const ModalSeleccionInsumos: React.FC<ModalSeleccionInsumosProps> = ({
  open,
  onClose,
  onAddInsumo,
  insumosExistentes = [],
}) => {
  const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
  const [filteredInsumos, setFilteredInsumos] = useState<ArticuloInsumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsumo, setSelectedInsumo] = useState<ArticuloInsumo | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadInsumos();
      // Resetear formulario al abrir
      setSelectedInsumo(null);
      setCantidad(1);
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

  const handleAddInsumo = () => {
    if (!selectedInsumo || cantidad <= 0) return;

    onAddInsumo(selectedInsumo, cantidad);
    onClose();
  };

  const handleInsumoSelect = (insumo: ArticuloInsumo) => {
    setSelectedInsumo(insumo);
  };

  return (
    <Modal open={open} onClose={onClose} title="🍲 Seleccionar Insumos" maxWidth="max-w-md">
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {/* Vista previa de insumos seleccionados */}
        {selectedInsumo && (
          <div className="bg-blue-50 p-3 rounded border">
            <h4 className="font-medium text-blue-800 mb-1">Insumo seleccionado:</h4>
            <div className="text-sm">
              <div>
                <strong>{selectedInsumo.denominacion}</strong>
              </div>
              <div>
                Cantidad: {cantidad} {selectedInsumo.unidadMedida?.denominacion ?? ''}
              </div>
              <div>Stock disponible: {selectedInsumo.stockActual}</div>
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
          <label className="block text-sm font-medium mb-2">Seleccionar insumo</label>
          {loading ? (
            <div className="text-center py-4">Cargando insumos...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : filteredInsumos.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              {searchTerm ? 'No se encontraron insumos' : 'No hay insumos disponibles'}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border rounded p-2 space-y-1">
              {filteredInsumos.map((insumo) => {
                const yaSeleccionado = insumosExistentes.some(
                  (existing) => existing.id === insumo.id
                );
                return (
                  <div
                    key={insumo.id}
                    className={`p-2 rounded cursor-pointer border transition-colors ${
                      selectedInsumo?.id === insumo.id
                        ? 'bg-blue-100 border-blue-300'
                        : yaSeleccionado
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleInsumoSelect(insumo)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {insumo.denominacion}
                          {yaSeleccionado && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                              Ya agregado
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Stock: {insumo.stockActual} {insumo.unidadMedida?.denominacion ?? ''}
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
                );
              })}
            </div>
          )}
        </div>

        {/* Cantidad */}
        {selectedInsumo && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Cantidad ({selectedInsumo.unidadMedida?.denominacion ?? 'unidad'})
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              min="0.01"
              step="0.01"
              className="w-full border rounded px-3 py-2"
              placeholder="Ingrese la cantidad"
            />
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-center gap-2 pt-2 border-t">
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
              !(selectedInsumo && cantidad > 0) ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            onClick={handleAddInsumo}
            disabled={!selectedInsumo || cantidad <= 0}
          >
            Agregar Insumo
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalSeleccionInsumos;
