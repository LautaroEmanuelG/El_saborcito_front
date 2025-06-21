// src/modules/HU24_CompraIngredientes/components/CompraIngredientesModal.tsx

import { useState } from 'react';
import type { ArticuloInsumo } from '../../../types/Articulo';
import ModalCompraSeleccionInsumo from './ModalCompraSeleccionInsumo';
import ModalRestaurarInsumo from './ModalRestaurarInsumo';
import ModalEditarInsumoCompra from './ModalEditarInsumoCompra';

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
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [detalles, setDetalles] = useState<InsumoCompraDetalle[]>([]);
  const [denominacion, setDenominacion] = useState('');
  const [loadingRegistro, setLoadingRegistro] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);
  const [insumoEditando, setInsumoEditando] = useState<{
    index: number;
    insumo: ArticuloInsumo;
    cantidad: number;
    precioCosto: number;
  } | null>(null);

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

  const handleAddMultipleInsumos = (
    insumosConPrecioYCantidad: { insumo: ArticuloInsumo; precioCosto: number; cantidad: number }[]
  ) => {
    setErrorRegistro(null);
    insumosConPrecioYCantidad.forEach(({ insumo, precioCosto, cantidad }) => {
      handleAddInsumo(insumo, precioCosto, cantidad);
    });
  };

  const handleRemoveInsumo = (index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditInsumo = (index: number) => {
    const detalle = detalles[index];
    setInsumoEditando({
      index,
      insumo: detalle.insumo,
      cantidad: detalle.cantidad,
      precioCosto: detalle.precioCosto,
    });
    setOpenModalEditar(true);
  };

  const handleSaveEditInsumo = (nuevaCantidad: number, nuevoPrecioCosto: number) => {
    if (insumoEditando) {
      setDetalles((prev) =>
        prev.map((detalle, i) =>
          i === insumoEditando.index
            ? { ...detalle, cantidad: nuevaCantidad, precioCosto: nuevoPrecioCosto }
            : detalle
        )
      );
      setInsumoEditando(null);
    }
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

          <div className="flex-1 p-2 border-l flex flex-col">
            <h3 className="text-lg font-medium mb-2">Insumos agregados</h3>
            <div className="flex-1 overflow-y-auto max-h-[300px]">
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
                        Cantidad: {d.cantidad} {d.insumo.unidadMedida?.denominacion}
                      </div>
                      <div className="text-sm text-gray-600">Costo unitario: ${d.precioCosto}</div>
                      <div className="text-sm font-medium text-blue-600">
                        Subtotal: ${(d.cantidad * d.precioCosto).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* Botón editar con icono y estilos consistentes */}
                      <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                        onClick={() => handleEditInsumo(i)}
                        title="Editar cantidad"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                          <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                          <path d="M16 5l3 3" />
                        </svg>
                      </button>
                      {/* Botón eliminar con icono y estilos consistentes */}
                      <button
                        type="button"
                        className="bg-primary hover:bg-primarydark text-white font-bold py-1 px-2 rounded"
                        onClick={() => handleRemoveInsumo(i)}
                        title="Eliminar insumo"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {detalles.length > 0 && (
              <div className="mt-4 pt-3 border-t bg-blue-50 p-3 rounded">
                <div className="text-lg font-bold text-blue-800">
                  Total: $
                  {detalles.reduce((total, d) => total + d.cantidad * d.precioCosto, 0).toFixed(2)}
                </div>
              </div>
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
      </div>{' '}
      <ModalCompraSeleccionInsumo
        open={openModalInsumo}
        onClose={() => setOpenModalInsumo(false)}
        onAddInsumo={handleAddInsumo}
        onAddMultipleInsumos={handleAddMultipleInsumos}
        insumosExistentes={detalles.map((d) => d.insumo)}
      />
      <ModalRestaurarInsumo
        open={openModalRestaurar}
        onClose={() => setOpenModalRestaurar(false)}
        onRestaurar={handleRestaurarInsumos}
      />
      <ModalEditarInsumoCompra
        open={openModalEditar}
        onClose={() => {
          setOpenModalEditar(false);
          setInsumoEditando(null);
        }}
        nombre={insumoEditando?.insumo.denominacion || ''}
        cantidad={insumoEditando?.cantidad || 0}
        precioCosto={insumoEditando?.precioCosto || 0}
        unidadMedida={insumoEditando?.insumo.unidadMedida?.denominacion}
        onSave={handleSaveEditInsumo}
      />
    </div>
  );
};

export default CompraIngredientesModal;
