import React, { useEffect, useState } from 'react';
import type { Promocion, PromocionDetalle } from '../../../types/Promocion';
import type { ArticuloManufacturado } from '../../../types/Articulo';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';
import ModalSeleccionarArticulos from './ModalSeleccionarArticulos';

interface ModalPromocionesFormProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<Promocion>;
  onSubmit?: (values: Partial<Promocion>, imageFile?: File) => void;
  mode?: 'add' | 'edit' | 'view';
}

const getInitialValues = (): Partial<Promocion> => ({
  denominacion: '',
  precioPromocional: null,
  descuento: null,
  fechaDesde: '',
  fechaHasta: '',
  horaDesde: '',
  horaHasta: '',
  promocionDetalles: [],
});

const ModalPromocionesForm: React.FC<ModalPromocionesFormProps> = ({
  open,
  onClose,
  initialValues,
  onSubmit,
  mode = 'add',
}) => {
  const [form, setForm] = useState<Partial<Promocion>>(initialValues ?? getInitialValues());
  const [detalles, setDetalles] = useState<PromocionDetalle[]>(
    initialValues?.promocionDetalles ?? []
  );
  const [showModalArticulos, setShowModalArticulos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isDisponible, setIsDisponible] = useState<boolean>(true);
  useEffect(() => {
    setForm(initialValues ?? getInitialValues());
    setDetalles(initialValues?.promocionDetalles ?? []);
    setSelectedImageFile(null); // Limpiar archivo seleccionado al abrir
    // Manejo de imagen: si es objeto, usar .url, si es string, usar directo
    const img = initialValues?.imagen
      ? typeof initialValues.imagen === 'string'
        ? initialValues.imagen
        : ((initialValues.imagen as any).url ?? null)
      : null;
    setImagenPreview(img);
    // Habilitado: si existe en initialValues, usarlo, si no, true
    setIsDisponible(
      (initialValues as any)?.habilitado !== undefined ? (initialValues as any).habilitado : true
    );
  }, [open, initialValues]);

  // Manejar cambios en los inputs
  const handleInputChange = (name: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Agregar artículo al combo
  const handleAddArticulo = (articulo: ArticuloManufacturado, cantidad: number) => {
    setDetalles((prev) => [
      ...prev,
      { id: 0, promocionId: form.id ?? 0, articulo, cantidadRequerida: cantidad },
    ]);
  };

  // Eliminar artículo del combo
  const handleRemoveArticulo = (index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  // Editar cantidad de artículo
  const handleEditCantidad = (index: number, nuevaCantidad: number) => {
    setDetalles((prev) =>
      prev.map((detalle, i) =>
        i === index ? { ...detalle, cantidadRequerida: nuevaCantidad } : detalle
      )
    );
  };
  // Submit: llama a onSubmit solo en modo add/edit
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mode === 'view') return;
    if (form.fechaDesde && form.fechaHasta && form.fechaDesde > form.fechaHasta) {
      setError('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }
    setError(null);
    if (onSubmit) {
      const detallesTransformados = detalles.map((detalle) => ({
        id: detalle.id ? detalle.id : null,
        cantidadRequerida: detalle.cantidadRequerida,
        articulo: {
          id: detalle.articulo.id,
          denominacion: detalle.articulo.denominacion,
          precioVenta: detalle.articulo.precioVenta,
        },
        promocionId: null,
      }));
      const payload = {
        ...form,
        precioPromocional: form.precioPromocional ? Number(form.precioPromocional) : undefined,
        horaDesde: form.horaDesde ? form.horaDesde : undefined,
        horaHasta: form.horaHasta ? form.horaHasta : undefined,
        articulo: null,
        promocionDetalles: detallesTransformados,
        // NO incluir imagen aquí - se envía por separado como archivo
        eliminado: !isDisponible, // Si no está disponible, marcar como eliminado (baja lógica)
        sucursal: { id: 1 }, // Asignar sucursal 1 a todas las promociones creadas
      };
      delete payload.descuento; // Eliminar descuento del payload para evitar error en backend
      onSubmit(payload as any, selectedImageFile ?? undefined);
    }
    onClose();
  };

  // Calcular descuento automático
  const calcularDescuento = () => {
    if (!detalles.length || !form.precioPromocional) return '-';
    const sumaArticulos = detalles.reduce((acc, d) => {
      const precio = d.articulo?.precioVenta ?? 0;
      return acc + precio * (d.cantidadRequerida || 1);
    }, 0);
    if (!sumaArticulos) return '-';
    const descuento = 100 - (Number(form.precioPromocional) / sumaArticulos) * 100;
    return descuento > 0 ? descuento.toFixed(0) + '%' : '0%';
  };

  // Render
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === 'add'
          ? 'Agregar Promoción'
          : mode === 'edit'
            ? 'Editar Promoción'
            : 'Ver Promoción'
      }
    >
      {mode === 'view' ? (
        <div className="flex flex-col h-full">
          <div className="flex flex-row flex-grow">
            <div className="flex-1 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Denominación</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100">
                  {form.denominacion}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio Promocional</label>
                <input
                  id="precioPromocional"
                  name="precioPromocional"
                  type="number"
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  value={form.precioPromocional?.toString() ?? ''}
                  onChange={(e) => handleInputChange('precioPromocional', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descuento (%)</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100">
                  {calcularDescuento()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha Desde</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100">{form.fechaDesde}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100">{form.fechaHasta}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora Desde</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100">{form.horaDesde}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora Hasta</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100">{form.horaHasta}</div>
              </div>
            </div>
            <div className="flex-1 p-4 max-h-96 overflow-y-auto border-l">
              <h3 className="text-lg font-medium mb-2">Combo Promoción</h3>
              {detalles.length > 0 ? (
                detalles.map((detalle, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded mb-2"
                  >
                    <div>
                      <div className="font-medium">{detalle.articulo?.denominacion}</div>
                      <div className="text-sm text-gray-600">
                        Cantidad: {detalle.cantidadRequerida}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4">
                  No hay artículos en el combo
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-2 p-4 border-t">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex flex-row flex-grow">
            {/* Columna izquierda: Formulario */}
            <div className="flex-1 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="denominacion">
                  Denominación<span className="text-red-500">*</span>
                </label>
                <input
                  id="denominacion"
                  name="denominacion"
                  type="text"
                  required
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  value={form.denominacion?.toString() ?? ''}
                  onChange={(e) => handleInputChange('denominacion', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="precioPromocional">
                  Precio Promocional
                </label>
                <input
                  id="precioPromocional"
                  name="precioPromocional"
                  type="number"
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  value={form.precioPromocional?.toString() ?? ''}
                  onChange={(e) => handleInputChange('precioPromocional', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descuento (%)</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100">
                  {calcularDescuento()}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" htmlFor="fechaDesde">
                    Fecha Desde<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fechaDesde"
                    name="fechaDesde"
                    type="date"
                    required
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                    value={form.fechaDesde?.toString() ?? ''}
                    onChange={(e) => handleInputChange('fechaDesde', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" htmlFor="fechaHasta">
                    Fecha Hasta<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fechaHasta"
                    name="fechaHasta"
                    type="date"
                    required
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                    value={form.fechaHasta?.toString() ?? ''}
                    onChange={(e) => handleInputChange('fechaHasta', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" htmlFor="horaDesde">
                    Hora Desde
                  </label>
                  <input
                    id="horaDesde"
                    name="horaDesde"
                    type="time"
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                    value={form.horaDesde?.toString() ?? ''}
                    onChange={(e) => handleInputChange('horaDesde', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" htmlFor="horaHasta">
                    Hora Hasta
                  </label>
                  <input
                    id="horaHasta"
                    name="horaHasta"
                    type="time"
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                    value={form.horaHasta?.toString() ?? ''}
                    onChange={(e) => handleInputChange('horaHasta', e.target.value)}
                  />
                </div>
              </div>
              {/* El botón solo se muestra en modo add/edit, nunca en view */}
              {(mode === 'add' || mode === 'edit') && (
                <>
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      className="bg-primary hover:bg-primarydark text-white text-sm px-3 py-1 rounded"
                      onClick={() => setShowModalArticulos(true)}
                    >
                      + Agregar Artículo
                    </button>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <input
                      id="disponibleCheckPromo"
                      type="checkbox"
                      className="mr-2"
                      checked={isDisponible}
                      onChange={() => setIsDisponible((prev) => !prev)}
                    />
                    <label
                      htmlFor="disponibleCheckPromo"
                      className="text-base select-none cursor-pointer"
                    >
                      Habilitado
                    </label>
                  </div>
                </>
              )}
            </div>
            {/* Columna derecha: Lista de artículos del combo */}
            <div className="flex-1 p-4 max-h-96 overflow-y-auto border-l">
              <h3 className="text-lg font-medium mb-2">Combo Promoción</h3>
              {detalles.length > 0 ? (
                detalles.map((detalle, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded mb-2"
                  >
                    <div>
                      <div className="font-medium">{detalle.articulo?.denominacion}</div>
                      <div className="text-sm text-gray-600">
                        Cantidad: {detalle.cantidadRequerida}
                      </div>
                    </div>
                    {(mode === 'edit' || mode === 'add') && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                          onClick={() =>
                            handleEditCantidad(index, (detalle.cantidadRequerida || 1) + 1)
                          }
                          title="Sumar cantidad"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                          onClick={() =>
                            handleEditCantidad(
                              index,
                              Math.max(1, (detalle.cantidadRequerida || 1) - 1)
                            )
                          }
                          title="Restar cantidad"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          className="bg-primary hover:bg-primarydark text-white font-bold py-1 px-2 rounded"
                          onClick={() => handleRemoveArticulo(index)}
                          title="Eliminar artículo"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4">
                  No hay artículos en el combo
                </p>
              )}
            </div>
          </div>
          {/* Mensaje de error por fechas */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">
              {error}
            </div>
          )}
          {/* Imagen: carga y preview (debajo de las columnas, centrado) */}
          {(mode === 'add' || mode === 'edit') && (
            <div className="flex flex-col items-center mt-4">
              <label className="block text-sm font-medium mb-1">Imagen</label>
              {imagenPreview && (
                <img
                  src={imagenPreview}
                  alt="Preview"
                  className="mb-2 rounded max-h-32 object-contain border"
                />
              )}{' '}
              <input
                type="file"
                accept="image/*"
                className="mb-2"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  // Validar archivo
                  try {
                    // Validar tipo de archivo
                    if (!file.type.startsWith('image/')) {
                      alert('El archivo debe ser una imagen');
                      e.target.value = '';
                      return;
                    }

                    // Validar tamaño (10MB máximo)
                    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
                    if (file.size > MAX_SIZE) {
                      alert('La imagen es demasiado grande (máximo 10MB)');
                      e.target.value = '';
                      return;
                    }

                    // Validar formatos específicos
                    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                    if (!ALLOWED_TYPES.includes(file.type)) {
                      alert('Formato no soportado. Use JPEG, PNG, GIF o WebP');
                      e.target.value = '';
                      return;
                    }

                    // Si pasa todas las validaciones, procesar la imagen
                    setSelectedImageFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagenPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } catch (error) {
                    alert('Error al procesar la imagen');
                    e.target.value = '';
                  }
                }}
              />
            </div>
          )}
          {/* Botones al final del modal */}
          <div className="flex justify-center gap-2 p-4 border-t mt-4">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primarydark text-white font-bold py-2 px-4 rounded"
            >
              {mode === 'add' ? 'Crear' : 'Guardar'}
            </button>
          </div>
          {/* Modal para selección de artículos */}
          <ModalSeleccionarArticulos
            open={showModalArticulos}
            onClose={() => setShowModalArticulos(false)}
            onAddArticulo={handleAddArticulo}
            articulosExistentes={detalles.map((d) => d.articulo as ArticuloManufacturado)}
          />
        </form>
      )}
    </Modal>
  );
};

export default ModalPromocionesForm;
