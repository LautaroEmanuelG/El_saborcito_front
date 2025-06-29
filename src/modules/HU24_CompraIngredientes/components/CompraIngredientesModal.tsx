// src/modules/HU24_CompraIngredientes/components/CompraIngredientesModal.tsx

import { useState, useEffect } from 'react';
import type { ArticuloInsumo, ArticuloManufacturado } from '../../../types/Articulo';
import ModalCompraSeleccionInsumo from './ModalCompraSeleccionInsumo';
import ModalRestaurarInsumo from './ModalRestaurarInsumo';
import ModalEditarInsumoCompra from './ModalEditarInsumoCompra';

import * as articuloInsumoService from '../../../shared/services/articuloInsumoService';
import { getArticuloManufacturadosByInsumo } from '../../../shared/services/articuloInsumoService';
import { validarCompra } from '../logic';
import { registrarCompra } from '../services/compraInsumoService';
import type { NuevaCompraDTO, CompraInsumoDTO } from '../model';

interface Props {
  open: boolean;
  onClose: () => void;
  onCompraRegistrada: (compra: CompraInsumoDTO) => void;
  insumosPreseleccionados?: ArticuloInsumo[];
  onActualizarPrecios?: (
    insumosConCambios: InsumoCambioPrecio[],
    articulosAfectados: ArticuloManufacturado[]
  ) => void;
}

interface InsumoCompraDetalle {
  insumo: ArticuloInsumo;
  subtotal: number; // El usuario ingresa el subtotal directamente
  cantidad: number;
}

interface InsumoCambioPrecio {
  insumoId: number;
  denominacion: string;
  precioAnterior: number;
  precioNuevo: number;
  porcentajeAumento: number;
}

export const CompraIngredientesModal = ({
  open,
  onClose,
  onCompraRegistrada,
  insumosPreseleccionados = [],
  onActualizarPrecios,
}: Props) => {
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
    subtotal: number;
  } | null>(null);

  // Efecto para preseleccionar insumos cuando el modal se abre
  useEffect(() => {
    if (open && insumosPreseleccionados.length > 0) {
      // Limpiar detalles existentes cuando se preseleccionan insumos
      setDetalles([]);

      // Pre-agregar insumos con valores calculados automáticamente
      const insumosConDatos = insumosPreseleccionados.map((insumo) => {
        const stockNecesario = Math.max(0, (insumo.stockMinimo ?? 0) - (insumo.stockActual ?? 0));
        const cantidadSugerida =
          stockNecesario > 0 ? stockNecesario : (insumo.stockMinimo ?? 0) * 0.5; // Si no hay déficit, sugerir 50% del mínimo
        // 🔴 IMPORTANTE: El subtotal debe ser 0 por defecto según requerimiento
        const subtotalInicial = 0;

        return {
          insumo,
          cantidad: cantidadSugerida,
          subtotal: subtotalInicial,
        };
      });

      setDetalles(insumosConDatos);

      // Establecer denominación por defecto
      if (!denominacion) {
        setDenominacion(`Reposición de Stock - ${new Date().toLocaleDateString('es-ES')}`);
      }
    }
  }, [open, insumosPreseleccionados, denominacion]);

  const handleAddInsumo = (insumo: ArticuloInsumo, subtotal: number, cantidad: number) => {
    setErrorRegistro(null);
    const idx = detalles.findIndex((d) => d.insumo.id === insumo.id);
    if (idx !== -1) {
      // Si ya existe, sumamos el subtotal y la cantidad
      setDetalles((prev) =>
        prev.map((d, i) =>
          i === idx ? { ...d, subtotal: d.subtotal + subtotal, cantidad: d.cantidad + cantidad } : d
        )
      );
    } else {
      setDetalles((prev) => [...prev, { insumo, subtotal, cantidad }]);
    }
  };

  const handleAddMultipleInsumos = (
    insumosConSubtotalYCantidad: { insumo: ArticuloInsumo; subtotal: number; cantidad: number }[]
  ) => {
    setErrorRegistro(null);
    insumosConSubtotalYCantidad.forEach(({ insumo, subtotal, cantidad }) => {
      handleAddInsumo(insumo, subtotal, cantidad);
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
      subtotal: detalle.subtotal,
    });
    setOpenModalEditar(true);
  };

  const handleSaveEditInsumo = (nuevaCantidad: number, nuevoSubtotal: number) => {
    if (insumoEditando) {
      setDetalles((prev) =>
        prev.map((detalle, i) =>
          i === insumoEditando.index
            ? { ...detalle, cantidad: nuevaCantidad, subtotal: nuevoSubtotal }
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

    // Detectar cambios de precio antes de registrar la compra
    const insumosConCambios: InsumoCambioPrecio[] = [];

    detalles.forEach((detalle) => {
      const precioUnitarioActual = detalle.insumo.precioCompra ?? 0;
      const precioUnitarioNuevo = detalle.cantidad !== 0 ? detalle.subtotal / detalle.cantidad : 0;

      // Solo considerar como cambio significativo si la diferencia es mayor al 1%
      // Y si el precio nuevo es mayor a 0 (evitar divisiones por 0 y cambios sin costo)
      if (precioUnitarioNuevo > 0 && precioUnitarioActual > 0) {
        const porcentajeDiferencia = Math.abs(
          ((precioUnitarioNuevo - precioUnitarioActual) / precioUnitarioActual) * 100
        );

        if (porcentajeDiferencia > 1) {
          const porcentajeAumento =
            ((precioUnitarioNuevo - precioUnitarioActual) / precioUnitarioActual) * 100;

          insumosConCambios.push({
            insumoId: detalle.insumo.id,
            denominacion: detalle.insumo.denominacion,
            precioAnterior: precioUnitarioActual,
            precioNuevo: precioUnitarioNuevo,
            porcentajeAumento,
          });
        }
      }
    });

    const nueva: NuevaCompraDTO = {
      denominacion,
      detalles: detalles.map((d) => ({
        insumoId: d.insumo.id,
        cantidad: d.cantidad,
        precioUnitario: d.cantidad !== 0 ? d.subtotal / d.cantidad : 0,
        subtotal: d.subtotal,
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

      // Si hay cambios de precio, llamar al callback para que el padre maneje el modal de actualización
      if (insumosConCambios.length > 0 && onActualizarPrecios) {
        // Obtener los artículos manufacturados afectados
        const todosLosArticulosAfectados: ArticuloManufacturado[] = [];
        const idsArticulosYaAgregados = new Set<number>();

        for (const cambio of insumosConCambios) {
          try {
            const articulosDeEsteInsumo = await getArticuloManufacturadosByInsumo(cambio.insumoId);

            articulosDeEsteInsumo.forEach((articulo: ArticuloManufacturado) => {
              if (!idsArticulosYaAgregados.has(articulo.id)) {
                todosLosArticulosAfectados.push(articulo);
                idsArticulosYaAgregados.add(articulo.id);
              }
            });
          } catch (error) {
            console.error(
              `Error al obtener artículos manufacturados para insumo ${cambio.insumoId}:`,
              error
            );
          }
        }

        // Llamar al callback del padre para manejar la actualización
        onActualizarPrecios(insumosConCambios, todosLosArticulosAfectados);
      } else {
        // Si no hay cambios de precio, cerrar el modal normalmente
        finalizarProceso();
      }
    } catch (e) {
      console.error(e);
      setErrorRegistro('Error al registrar la compra');
    } finally {
      setLoadingRegistro(false);
    }
  };

  // Función para finalizar el proceso de compra
  const finalizarProceso = () => {
    setDenominacion('');
    setDetalles([]);
    setErrorRegistro(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl h-[600px] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {insumosPreseleccionados.length > 0
            ? 'Reposición de Stock - Insumos Preseleccionados'
            : 'Registrar compra de insumos'}
        </h2>

        {/* Mensaje informativo para insumos preseleccionados */}
        {insumosPreseleccionados.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-blue-800 text-sm text-center">
              ✨ Se han preseleccionado <strong>{insumosPreseleccionados.length} insumos</strong>{' '}
              con stock bajo. Las cantidades y subtotales se calcularon automáticamente para
              alcanzar el stock mínimo.
            </p>
          </div>
        )}

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
                    className={`flex justify-between items-center p-2 border rounded mb-2 ${
                      d.cantidad < 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{d.insumo.denominacion}</div>
                      <div
                        className={`text-sm ${d.cantidad < 0 ? 'text-red-600' : 'text-gray-600'}`}
                      >
                        Cantidad: {d.cantidad} {d.insumo.unidadMedida?.denominacion}
                        {d.cantidad < 0 && <span className="ml-1 text-xs">(Ajuste negativo)</span>}
                      </div>
                      <div className="text-sm text-gray-600">
                        Subtotal: ${d.subtotal}
                        {d.subtotal === 0 && <span className="ml-1 text-xs">(Gratuito)</span>}
                      </div>
                      <div className="text-sm text-gray-600">
                        Precio unitario: $
                        {d.cantidad !== 0 ? (d.subtotal / d.cantidad).toFixed(2) : '0.00'}
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
                  Total: ${detalles.reduce((total, d) => total + d.subtotal, 0).toFixed(2)}
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
      </div>

      {/* Modales auxiliares - siempre disponibles */}
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
        subtotal={insumoEditando?.subtotal || 0}
        unidadMedida={insumoEditando?.insumo.unidadMedida?.denominacion}
        esParaElaborar={insumoEditando?.insumo.esParaElaborar || false}
        onSave={handleSaveEditInsumo}
      />
    </div>
  );
};

export default CompraIngredientesModal;
