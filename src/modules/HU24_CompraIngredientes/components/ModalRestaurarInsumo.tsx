import React, { useEffect, useState } from 'react';
import type { ArticuloInsumo } from '../../../types/Articulo';
import * as articuloInsumoService from '../../../shared/services/articuloInsumoService';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';

interface ModalRestaurarInsumoProps {
  open: boolean;
  onClose: () => void;
  onRestaurar: (insumos: ArticuloInsumo[]) => void;
}

const ModalRestaurarInsumo: React.FC<ModalRestaurarInsumoProps> = ({
  open,
  onClose,
  onRestaurar,
}) => {
  const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
  const [filteredInsumos, setFilteredInsumos] = useState<ArticuloInsumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsumos, setSelectedInsumos] = useState<ArticuloInsumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadInsumos();
      setSelectedInsumos([]);
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
      const data = await articuloInsumoService.getDeletedArticuloInsumos();
      setInsumos(data ?? []);
      setFilteredInsumos(data ?? []);
    } catch (err) {
      setError('Error al cargar insumos eliminados');
      console.error('Error loading deleted insumos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInsumo = (insumo: ArticuloInsumo) => {
    setSelectedInsumos((prev) =>
      prev.some((i) => i.id === insumo.id)
        ? prev.filter((i) => i.id !== insumo.id)
        : [...prev, insumo]
    );
  };

  const handleRestaurar = () => {
    if (selectedInsumos.length === 0) return;
    onRestaurar(selectedInsumos);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Restaurar Insumos Eliminados" maxWidth="max-w-md">
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        <div>
          <label className="block text-sm font-medium mb-1">Buscar insumo eliminado</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Escribe para buscar..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Seleccionar insumos a restaurar</label>
          {loading ? (
            <div className="text-center py-4">Cargando insumos...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : filteredInsumos.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              {searchTerm ? 'No se encontraron insumos eliminados' : 'No hay insumos eliminados'}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border rounded p-2 space-y-1">
              {filteredInsumos.map((insumo) => {
                const seleccionado = selectedInsumos.some((i) => i.id === insumo.id);
                return (
                  <div
                    key={insumo.id}
                    className={`p-2 rounded cursor-pointer border transition-colors flex items-center gap-2 ${
                      seleccionado
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelectInsumo(insumo)}
                  >
                    <input type="checkbox" checked={seleccionado} readOnly className="mr-2" />
                    <div className="flex-1">
                      <div className="font-medium">{insumo.denominacion}</div>
                      <div className="text-sm text-gray-600">
                        Unidad: {insumo.unidadMedida?.denominacion ?? ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        Categoría: {insumo.categoria?.denominacion ?? 'Sin categoría'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
              selectedInsumos.length === 0 ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            onClick={handleRestaurar}
            disabled={selectedInsumos.length === 0}
          >
            Restaurar seleccionados
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalRestaurarInsumo;
