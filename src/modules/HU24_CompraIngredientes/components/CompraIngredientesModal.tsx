// src/modules/HU24_CompraIngredientes/components/CompraIngredientesModal.tsx

import { useState } from 'react';
import type { ArticuloInsumo } from '../../../types/Articulo';
import ModalCompraSeleccionInsumo from './ModalCompraSeleccionInsumo';
import ModalRestaurarInsumo from './ModalRestaurarInsumo';

import * as articuloInsumoService from '../../../shared/services/articuloInsumoService';
import { validarCompra } from '../logic';
import { registrarCompra } from '../services/compraInsumoService';
import type { NuevaCompraDTO, CompraInsumoDTO } from '../model';

interface Props {
  open: boolean;
  onClose: () => void;
  onCompraRegistrada: (compra: CompraInsumoDTO) => void;
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
  const [loadingRegistro, setLoadingRegistro] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);

  const handleAddInsumo = (insumo: ArticuloInsumo, precioCosto: number, cantidad: number) => {
    setErrorRegistro(null);
    const idx = detalles.findIndex((d) => d.insumo.id === insumo.id);
    if (idx !== -1) {
      setDetalles((prev) =>
        prev.map((d, i) => (i === idx ? { ...d, precioCosto, cantidad: d.cantidad + cantidad } : d))
      );
    } else {
      setDetalles((prev) => [...prev, { insumo, precioCosto, cantidad }]);
    }
  };

  const handleRemoveInsumo = (index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRestaurarInsumos = async (insumos: ArticuloInsumo[]) => {
    for (const insumo of insumos) {
      await articuloInsumoService.restoreArticuloInsumo(insumo.id);
    }
    setOpenModalRestaurar(false);
  };

  const handleRegistrarCompra = async () => {
    setErrorRegistro(null);

    const nueva: NuevaCompraDTO = {
      denominacion,
      detalles: detalles.map((d) => ({
        insumoId: d.insumo.id,
        cantidad: d.cantidad,
        precioUnitario: d.precioCosto,
      })),
    };

    const msg = validarCompra(nueva);
    if (msg) {
      setErrorRegistro(msg);
      return;
    }

    setLoadingRegistro(true);
    try {
      const compraCreada = await registrarCompra(nueva);
      onCompraRegistrada(compraCreada);
      onClose();
      setDenominacion('');
      setDetalles([]);
    } catch (e) {
      console.error(e);
      setErrorRegistro('Error al registrar la compra');
    } finally {
      setLoadingRegistro(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl h-[600px] flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-center">Registrar compra de insumos</h2>

        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="flex-1 p-2">
            <label htmlFor="denominacionCompra" className="block text-sm font-medium mb-2">
              Denominación
            </label>
            <input
              id="denominacionCompra"
              type="text"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Ej: Compra semanal"
              value={denominacion}
              onChange={(e) => setDenominacion(e.target.value)}
            />
            <button
              className="bg-primary hover:bg-primarydark text-white px-3 py-2 rounded w-full mb-4"
              onClick={() => setOpenModalInsumo(true)}
            >
              + Agregar Insumo
            </button>
            <button
              className="bg-blue-200 px-4 py-2 rounded w-full"
              onClick={() => setOpenModalRestaurar(true)}
            >
              Restaurar insumo eliminado
            </button>
          </div>

          <div className="flex-1 p-2 border-l max-h-full overflow-y-auto">
            <h3 className="text-lg font-medium mb-2">Insumos agregados</h3>
            {detalles.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">No hay insumos agregados.</p>
            ) : (
              detalles.map((d, i) => (
                <div
                  key={d.insumo.id}
                  className="flex justify-between items-center p-2 border rounded mb-2"
                >
                  <div>
                    <div className="font-medium">{d.insumo.denominacion}</div>
                    <div className="text-sm text-gray-600">
                      {d.cantidad} {d.insumo.unidadMedida?.denominacion}
                    </div>
                    <div className="text-sm text-gray-600">Costo: ${d.precioCosto}</div>
                  </div>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => handleRemoveInsumo(i)}
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {errorRegistro && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mt-4">{errorRegistro}</div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={onClose}
            disabled={loadingRegistro}
          >
            Cancelar
          </button>
          <button
            className={`bg-primary text-white px-4 py-2 rounded ${
              loadingRegistro ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primarydark'
            }`}
            onClick={handleRegistrarCompra}
            disabled={loadingRegistro}
          >
            {loadingRegistro ? 'Registrando...' : 'Registrar compra'}
          </button>
        </div>
      </div>

      <ModalCompraSeleccionInsumo
        open={openModalInsumo}
        onClose={() => setOpenModalInsumo(false)}
        onAddInsumo={handleAddInsumo}
        insumosExistentes={detalles.map((d) => d.insumo)}
      />
      <ModalRestaurarInsumo
        open={openModalRestaurar}
        onClose={() => setOpenModalRestaurar(false)}
        onRestaurar={handleRestaurarInsumos}
      />
    </div>
  );
};

export default CompraIngredientesModal;
