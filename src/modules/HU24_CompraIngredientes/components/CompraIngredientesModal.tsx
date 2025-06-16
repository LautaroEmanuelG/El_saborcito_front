// Modal principal para registrar compras de insumos
// Importa lógica y servicios de HU23_CRUDInsumos y HU24_CompraIngredientes

import { useEffect, useState } from 'react';
import type { ArticuloInsumo } from '../../../types/Articulo';
import ModalCompraSeleccionInsumo from './ModalCompraSeleccionInsumo';
import ModalRestaurarInsumo from './ModalRestaurarInsumo';
import * as articuloInsumoService from '../../../shared/services/articuloInsumoService';

interface Props {
  open: boolean;
  onClose: () => void;
  onCompraRegistrada: () => void;
}

interface InsumoCompraDetalle {
  insumo: ArticuloInsumo;
  precioCosto: number;
  cantidad: number;
}

export const CompraIngredientesModal = ({ open, onClose, onCompraRegistrada }: Props) => {
  const [openModalInsumo, setOpenModalInsumo] = useState(false);
  const [openModalRestaurar, setOpenModalRestaurar] = useState(false);
  const [detalles, setDetalles] = useState<InsumoCompraDetalle[]>([]);
  const [denominacion, setDenominacion] = useState('');

  // Agregar insumo a la lista
  const handleAddInsumo = (insumo: ArticuloInsumo, precioCosto: number, cantidad: number) => {
    const idx = detalles.findIndex((d) => d.insumo.id === insumo.id);
    if (idx !== -1) {
      setDetalles((prev) =>
        prev.map((d, i) => (i === idx ? { ...d, precioCosto, cantidad: d.cantidad + cantidad } : d))
      );
    } else {
      setDetalles((prev) => [...prev, { insumo, precioCosto, cantidad }]);
    }
  };

  // Eliminar insumo de la lista
  const handleRemoveInsumo = (index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  // Restaurar insumos seleccionados
  const handleRestaurarInsumos = async (insumos: ArticuloInsumo[]) => {
    for (const insumo of insumos) {
      await articuloInsumoService.restoreArticuloInsumo(insumo.id);
    }
    setOpenModalRestaurar(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-negro bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-blanco p-6 rounded-lg shadow-lg w-full max-w-4xl h-[600px] flex flex-col">
        {/* Título centrado arriba de las columnas */}
        <h2 className="text-2xl font-bold mb-6 text-center">Registrar compra de insumos</h2>
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {/* Columna izquierda: campo denominación y botones */}
          <div className="flex-1 p-2">
            <label className="block text-sm font-medium mb-2" htmlFor="denominacionCompra">
              Denominación de la compra
            </label>
            <input
              id="denominacionCompra"
              type="text"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Ej: Compra semanal, Proveedor X, etc."
              value={denominacion}
              onChange={(e) => setDenominacion(e.target.value)}
            />
            <button
              type="button"
              className="bg-primary hover:bg-primarydark text-white text-sm px-3 py-2 rounded w-full mb-4"
              onClick={() => setOpenModalInsumo(true)}
            >
              + Agregar Insumo
            </button>
            <button
              type="button"
              className="bg-blue-200 px-4 py-2 rounded w-full"
              onClick={() => setOpenModalRestaurar(true)}
            >
              Restaurar insumo eliminado
            </button>
          </div>
          {/* Columna derecha: lista de insumos agregados */}
          <div className="flex-1 p-2 border-l max-h-full overflow-y-auto">
            <h3 className="text-lg font-medium mb-2">Insumos agregados</h3>
            {detalles.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">
                No hay insumos agregados. Haz clic en "Agregar Insumo" para comenzar.
              </p>
            ) : (
              detalles.map((detalle, index) => (
                <div
                  key={detalle.insumo.id}
                  className="flex justify-between items-center p-2 border rounded mb-2"
                >
                  <div>
                    <div className="font-medium">{detalle.insumo.denominacion}</div>
                    <div className="text-sm text-gray-600">
                      Cantidad: {detalle.cantidad} {detalle.insumo.unidadMedida?.denominacion ?? ''}
                    </div>
                    <div className="text-sm text-gray-600">
                      Precio costo: ${detalle.precioCosto}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bg-primary hover:bg-primarydark text-white font-bold py-1 px-2 rounded"
                    onClick={() => handleRemoveInsumo(index)}
                    title="Eliminar insumo"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Botones de acción dentro del modal */}
        <div className="flex justify-center gap-4 mt-6">
          <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="bg-primary text-blanco px-4 py-2 rounded"
            // onClick={/* handleRegistrarCompra */} // Aquí irá la lógica de registrar compra
          >
            Registrar compra
          </button>
        </div>
      </div>
      {/* Modal para seleccionar insumo y completar precio/cantidad */}
      <ModalCompraSeleccionInsumo
        open={openModalInsumo}
        onClose={() => setOpenModalInsumo(false)}
        onAddInsumo={handleAddInsumo}
        insumosExistentes={detalles.map((d) => d.insumo)}
      />
      {/* Modal para restaurar insumos eliminados */}
      <ModalRestaurarInsumo
        open={openModalRestaurar}
        onClose={() => setOpenModalRestaurar(false)}
        onRestaurar={handleRestaurarInsumos}
      />
    </div>
  );
};

export default CompraIngredientesModal;
