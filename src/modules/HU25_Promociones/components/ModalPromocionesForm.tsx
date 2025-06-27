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
      {
        id: 0,
        promocionId: form.id ?? 0,
        articulo: {
          ...articulo,
          imagen: articulo.imagen ?? { url: '' },
          eliminado: articulo.eliminado ?? false,
          fechaEliminacion: (articulo as any)?.fechaEliminacion ?? null,
        },
        cantidadRequerida: cantidad,
      },
    ]);
  };

  // Agregar múltiples artículos al combo
  const handleAddMultipleArticulos = (
    articulosConCantidad: { articulo: ArticuloManufacturado; cantidad: number }[]
  ) => {
    articulosConCantidad.forEach(({ articulo, cantidad }) => {
      handleAddArticulo(articulo, cantidad);
    });
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
      maxWidth="max-w-6xl"
    >
      <div className="h-[80vh] overflow-hidden">
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
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    {form.fechaDesde}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    {form.fechaHasta}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora Desde</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    {form.horaDesde}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora Hasta</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    {form.horaHasta}
                  </div>
                </div>
                {/* Checkbox de habilitado en modo view (centrado) */}
                <div className="flex items-center justify-center mt-2">
                  <input
                    id="disponibleCheckPromoView"
                    type="checkbox"
                    className="mr-2"
                    checked={isDisponible}
                    disabled
                  />
                  <label
                    htmlFor="disponibleCheckPromoView"
                    className="text-base select-none cursor-default"
                  >
                    Habilitado
                  </label>
                </div>
              </div>
              <div className="flex-1 border-l flex flex-col">
                {/* Sección de combo promoción - 50% de altura */}
                <div className="flex-1 p-4 overflow-y-auto">
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

                {/* Sección de imagen - 50% de altura */}
                {imagenPreview && (
                  <div className="flex-1 p-4 border-t flex flex-col justify-center">
                    <h4 className="text-lg font-medium mb-2">Imagen</h4>
                    <div className="flex-1 flex items-center justify-center">
                      <img
                        src={imagenPreview}
                        alt="Imagen de la promoción"
                        className="rounded max-h-40 max-w-full object-contain border"
                      />
                    </div>
                  </div>
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
              {/* Columna derecha: Lista de artículos del combo e imagen */}
              <div className="flex-1 border-l flex flex-col">
                {/* Sección de combo promoción - 50% de altura */}
                <div className="flex-1 p-4 overflow-y-auto">
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
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-center py-4">
                      No hay artículos en el combo
                    </p>
                  )}
                </div>

                {/* Sección de imagen - 50% de altura */}
                {(mode === 'add' || mode === 'edit') && (
                  <div className="flex-1 p-4 border-t flex flex-col">
                    <h4 className="text-lg font-medium mb-2">Imagen</h4>
                    <div className="flex-1 flex flex-col justify-center">
                      {imagenPreview && (
                        <div className="flex items-center justify-center mb-2">
                          <img
                            src={imagenPreview}
                            alt="Preview"
                            className="rounded max-h-40 max-w-full object-contain border"
                          />
                        </div>
                      )}

                      {/* Input file oculto */}
                      <input
                        id="imagen-upload-promocion"
                        type="file"
                        accept="image/*"
                        className="hidden"
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
                            const ALLOWED_TYPES = [
                              'image/jpeg',
                              'image/png',
                              'image/gif',
                              'image/webp',
                            ];
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

                      {/* Botón customizado dinámico */}
                      <div className="flex flex-col items-center">
                        {selectedImageFile ? (
                          // Botón compacto cuando hay imagen seleccionada
                          <label
                            htmlFor="imagen-upload-promocion"
                            className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-3 py-2 text-center transition-colors duration-200"
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <span className="text-xs text-gray-600 max-w-[120px] truncate">
                                {selectedImageFile.name}
                              </span>
                            </div>
                          </label>
                        ) : (
                          // Botón grande cuando no hay imagen seleccionada
                          <label
                            htmlFor="imagen-upload-promocion"
                            className="cursor-pointer bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg px-6 py-4 text-center transition-colors duration-200"
                          >
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-8 h-8 text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <span className="text-sm text-gray-600">Seleccionar archivo</span>
                              <span className="text-xs text-gray-400 mt-1">
                                Sin archivos seleccionados
                              </span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Mensaje de error por fechas */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">
                {error}
              </div>
            )}
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
            </div>{' '}
            {/* Modal para selección de artículos */}
            <ModalSeleccionarArticulos
              open={showModalArticulos}
              onClose={() => setShowModalArticulos(false)}
              onAddArticulo={handleAddArticulo}
              onAddMultipleArticulos={handleAddMultipleArticulos}
              articulosExistentes={detalles.map((d) => ({
                ...d.articulo,
                descripcion: (d.articulo as any).descripcion ?? '',
                tiempoEstimadoMinutos: (d.articulo as any).tiempoEstimadoMinutos ?? 0,
                articuloManufacturadoDetalles:
                  (d.articulo as any).articuloManufacturadoDetalles ?? [],
                categoriaId: (d.articulo as any).categoriaId ?? 0,
              }))}
            />
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ModalPromocionesForm;
