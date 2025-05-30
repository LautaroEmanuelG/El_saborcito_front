import React, { useEffect, useState } from 'react';
import type {
  ArticuloManufacturado,
  ArticuloInsumo,
  ArticuloManufacturadoDetalle,
} from '../../../types/Articulo';
import type { Categoria } from '../../../types/Categoria';
import * as categoriaService from '../../../shared/services/categoriaService';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';
import ModalSeleccionInsumos from './ModalSeleccionInsumos';

interface ModalArticuloManufacturadoFormProps {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<ArticuloManufacturado>;
  onSubmit: (values: Partial<ArticuloManufacturado>) => void;
  mode: 'add' | 'edit' | 'view';
}

const buildInitialFormValues = (
  form: Partial<ArticuloManufacturado>,
  categorias: Categoria[],
  mode: 'add' | 'edit' | 'view'
): Record<string, string | number> => {
  // Si es modo "add", devolver valores vacíos
  if (mode === 'add') {
    return {
      denominacion: '',
      precioVenta: 0,
      descripcion: '',
      tiempoEstimadoMinutos: 0,
      categoria: '',
      subcategoria: '',
    };
  }

  // Determinar si la categoría del artículo es una categoría padre o subcategoría
  const categoriaActual = categorias.find((cat) => cat.id === form.categoriaId);

  let categoriaId = '';
  let subcategoriaId = '';

  if (categoriaActual) {
    if (categoriaActual.tipoCategoria === null) {
      // Es una categoría padre
      categoriaId = String(categoriaActual.id ?? '');
      subcategoriaId = '';
    } else {
      // Es una subcategoría
      categoriaId = String(categoriaActual.tipoCategoria?.id ?? '');
      subcategoriaId = String(categoriaActual.id ?? '');
    }
  }

  return {
    denominacion: form.denominacion ?? '',
    precioVenta: form.precioVenta ?? 0,
    descripcion: form.descripcion ?? '',
    tiempoEstimadoMinutos: form.tiempoEstimadoMinutos ?? 0,
    categoria: categoriaId,
    subcategoria: subcategoriaId,
  };
};

const ModalArticuloManufacturadoForm: React.FC<ModalArticuloManufacturadoFormProps> = ({
  open,
  onClose,
  initialValues,
  onSubmit,
  mode,
}) => {
  const [form, setForm] = useState<Partial<ArticuloManufacturado>>(initialValues);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Categoria[]>([]);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [detalles, setDetalles] = useState<ArticuloManufacturadoDetalle[]>([]);
  const [openModalInsumos, setOpenModalInsumos] = useState(false);
  useEffect(() => {
    setForm(initialValues);
    // Mostrar imagen si existe
    setImagenPreview(initialValues.imagen?.url ?? null);

    // Construir valores del formulario usando la función existente
    const newFormValues = buildInitialFormValues(initialValues, categorias, mode);
    setFormValues(newFormValues);

    // Inicializar detalles con los datos existentes
    setDetalles(initialValues.articuloManufacturadoDetalles ?? []);

    // Limpiar estados si es modo "add" o si no hay categoriaId
    if (mode === 'add' || !initialValues.categoriaId) {
      setSelectedCategoriaId(null);
      setSelectedSubcategoriaId(null);
      setSubcategorias([]);
      // Limpiar detalles solo si es modo "add"
      if (mode === 'add') {
        setDetalles([]);
      }
      return;
    }

    // Determinar categoría y subcategoría actuales solo si hay categorias cargadas
    if (initialValues.categoriaId && categorias.length > 0) {
      const categoriaActual = categorias.find((cat) => cat.id === initialValues.categoriaId);

      if (categoriaActual) {
        if (categoriaActual.tipoCategoria === null) {
          // Es una categoría padre
          setSelectedCategoriaId(categoriaActual.id ?? null);
          setSelectedSubcategoriaId(null);
        } else {
          // Es una subcategoría
          setSelectedCategoriaId(categoriaActual.tipoCategoria?.id ?? null);
          setSelectedSubcategoriaId(categoriaActual.id ?? null);
        }
      }
    }
  }, [initialValues, open, categorias, mode]);

  useEffect(() => {
    categoriaService.getAllCategorias().then(setCategorias);
  }, []);

  useEffect(() => {
    // Cargar subcategorías basadas en la categoría seleccionada
    if (selectedCategoriaId) {
      const subs = categorias.filter((cat) => cat.tipoCategoria?.id === selectedCategoriaId);
      setSubcategorias(subs);
    } else {
      setSubcategorias([]);
    }
  }, [selectedCategoriaId, categorias]);

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === 'view') return; // No permitir cambios en modo vista
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Obtener el título del modal según el modo
  const getModalTitle = () => {
    switch (mode) {
      case 'add':
        return 'Agregar Artículo Manufacturado';
      case 'edit':
        return 'Editar Artículo Manufacturado';
      case 'view':
        return 'Ver Artículo Manufacturado';
      default:
        return 'Artículo Manufacturado';
    }
  };

  // Construcción dinámica de los campos para el ModalForm
  const fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    disabled?: boolean;
    options?: Array<{ label: string; value: string | number }>;
  }> = [
    {
      name: 'denominacion',
      label: 'Denominación',
      type: 'text',
      required: true,
      disabled: mode === 'view',
    },
    {
      name: 'precioVenta',
      label: 'Precio Venta',
      type: 'number',
      required: true,
      disabled: mode === 'view',
    },
    {
      name: 'categoria',
      label: 'Categoría',
      type: 'select',
      required: true,
      disabled: mode === 'view',
      options: categorias
        .filter((cat) => cat.tipoCategoria === null) // Solo categorías principales
        .map((cat) => ({
          label: cat.denominacion,
          value: cat.id ?? '',
        })),
    },
    subcategorias.length > 0
      ? {
          name: 'subcategoria',
          label: 'Subcategoría',
          type: 'select',
          required: false,
          disabled: mode === 'view',
          options: subcategorias.map((cat) => ({
            label: cat.denominacion,
            value: cat.id ?? '',
          })),
        }
      : null,
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'text',
      required: true,
      disabled: mode === 'view',
    },
    {
      name: 'tiempoEstimadoMinutos',
      label: 'Tiempo Estimado (minutos)',
      type: 'number',
      required: true,
      disabled: mode === 'view',
    },
  ].filter(Boolean) as Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    disabled?: boolean;
    options?: Array<{ label: string; value: string | number }>;
  }>;

  // Función para manejar cambios en los inputs
  const handleInputChange = (name: string, value: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para agregar un insumo a la lista de detalles
  const handleAddInsumo = (insumo: ArticuloInsumo, cantidad: number) => {
    // Verificar si el insumo ya existe en la lista
    const insumoExistente = detalles.find((detalle) => detalle.articuloInsumo?.id === insumo.id);

    if (insumoExistente) {
      // Si existe, actualizar la cantidad
      const index = detalles.findIndex((detalle) => detalle.articuloInsumo?.id === insumo.id);
      handleEditCantidad(index, insumoExistente.cantidad + cantidad);
    } else {
      // Si no existe, agregar nuevo detalle
      const nuevoDetalle: ArticuloManufacturadoDetalle = {
        cantidad,
        articuloInsumo: insumo,
      };
      setDetalles((prev) => [...prev, nuevoDetalle]);
    }
  };

  // Función para eliminar un insumo de la lista
  const handleRemoveInsumo = (index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  // Función para editar la cantidad de un insumo
  const handleEditCantidad = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) return;
    setDetalles((prev) =>
      prev.map((detalle, i) => (i === index ? { ...detalle, cantidad: nuevaCantidad } : detalle))
    );
  };

  // Calcular el costo estimado total de los insumos
  const calcularCostoEstimado = (): number => {
    return detalles.reduce((total, detalle) => {
      const precioUnitario = detalle.articuloInsumo?.precioCompra ?? 0;
      return total + precioUnitario * detalle.cantidad;
    }, 0);
  };

  const handleSubmit = (values: Record<string, string | number>) => {
    if (mode === 'view') return; // No enviar en modo vista

    // Usar los valores del estado actual en lugar de los del formulario
    const currentValues = { ...formValues, ...values };

    // Determinar el categoriaId final basado en la selección
    let finalCategoriaId: number;

    if (selectedSubcategoriaId && selectedSubcategoriaId > 0) {
      // Si hay subcategoría seleccionada, usar el ID de la subcategoría
      finalCategoriaId = selectedSubcategoriaId;
    } else if (selectedCategoriaId && selectedCategoriaId > 0) {
      // Si no hay subcategoría, usar el ID de la categoría padre
      finalCategoriaId = selectedCategoriaId;
    } else {
      // Fallback: usar valores del formulario
      finalCategoriaId = Number(currentValues.categoria);
    }

    onSubmit({
      ...form,
      denominacion: String(currentValues.denominacion),
      precioVenta: Number(currentValues.precioVenta),
      descripcion: String(currentValues.descripcion),
      tiempoEstimadoMinutos: Number(currentValues.tiempoEstimadoMinutos),
      categoriaId: finalCategoriaId,
      // Mantener la imagen actual si existe
      imagen: form.imagen,
      // Mantener los detalles actuales
      articuloManufacturadoDetalles: detalles,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={getModalTitle()}>
      <div className="space-y-4">
        {/* Sección de imagen */}
        <div className="flex flex-col items-center">
          {imagenPreview ? (
            <img
              src={imagenPreview}
              alt="Imagen del artículo"
              className="w-32 h-32 object-cover rounded mb-2"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded mb-2 text-gray-400">
              Sin imagen
            </div>
          )}
          {mode !== 'view' && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          )}
        </div>

        {/* Formulario principal - renderizado directamente */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const values = Object.fromEntries(formData.entries()) as Record<string, string>;
            handleSubmit(values);
          }}
          className="space-y-4"
        >
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1" htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={
                    field.name === 'categoria'
                      ? (selectedCategoriaId ?? '')
                      : field.name === 'subcategoria'
                        ? (selectedSubcategoriaId ?? '')
                        : (formValues[field.name] ?? '')
                  }
                  className="w-full border rounded px-3 py-2"
                  required={field.required}
                  disabled={field.disabled || mode === 'view'}
                  onChange={(e) => {
                    if (field.name === 'categoria') {
                      const nuevaCategoriaId = Number(e.target.value);
                      setSelectedCategoriaId(nuevaCategoriaId || null);
                      setSelectedSubcategoriaId(null); // Reset subcategoría cuando cambia categoría
                    } else if (field.name === 'subcategoria') {
                      setSelectedSubcategoriaId(Number(e.target.value) || null);
                    }
                    handleInputChange(field.name, e.target.value);
                  }}
                >
                  <option value="">Seleccione...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formValues[field.name] ?? ''}
                  className="w-full border rounded px-3 py-2"
                  required={field.required}
                  disabled={field.disabled || mode === 'view'}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              onClick={onClose}
            >
              {mode === 'view' ? 'Cerrar' : 'Cancelar'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
              >
                Guardar
              </button>
            )}
          </div>
        </form>

        {/* Detalles de preparación */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">🍳 Insumos para elaboración</h3>
            {mode !== 'view' && (
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                onClick={() => setOpenModalInsumos(true)}
              >
                + Agregar Insumo
              </button>
            )}
          </div>

          {/* Estadísticas de costos */}
          {detalles.length > 0 && (
            <div className="bg-blue-50 p-2 rounded mb-2 text-sm">
              <div className="flex justify-between">
                <span>📊 Total insumos: {detalles.length}</span>
                <span className="font-semibold">
                  💰 Costo estimado: ${calcularCostoEstimado().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded border min-h-24">
            {detalles.length > 0 ? (
              <div className="space-y-2">
                {detalles.map((detalle, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-white p-3 rounded border shadow-sm"
                  >
                    <div className="flex-1">
                      <span className="font-medium">
                        {detalle.articuloInsumo?.denominacion ?? 'Insumo desconocido'}
                      </span>
                      <div className="text-sm text-gray-600">
                        📂 {detalle.articuloInsumo?.categoria?.denominacion ?? 'Sin categoría'}
                      </div>
                      <div className="text-sm text-green-600">
                        💵 ${detalle.articuloInsumo?.precioCompra ?? 0} por{' '}
                        {detalle.articuloInsumo?.unidadMedida?.denominacion ?? 'unidad'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {mode !== 'view' ? (
                          <input
                            type="number"
                            value={detalle.cantidad}
                            onChange={(e) => handleEditCantidad(index, Number(e.target.value))}
                            min="0.01"
                            step="0.01"
                            className="w-20 text-center border rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="w-20 text-center text-sm font-medium block">
                            {detalle.cantidad}
                          </span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {detalle.articuloInsumo?.unidadMedida?.denominacion ?? ''}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold text-green-700">
                          $
                          {((detalle.articuloInsumo?.precioCompra ?? 0) * detalle.cantidad).toFixed(
                            2
                          )}
                        </div>
                        <div className="text-xs text-gray-500">subtotal</div>
                      </div>
                      {mode !== 'view' && (
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                          onClick={() => handleRemoveInsumo(index)}
                          title="Eliminar insumo"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                {mode === 'view'
                  ? 'No hay insumos configurados'
                  : 'No hay insumos agregados. Haz clic en "Agregar Insumo" para comenzar.'}
              </p>
            )}
          </div>
        </div>

        {/* Modal para selección de insumos */}
        <ModalSeleccionInsumos
          open={openModalInsumos}
          onClose={() => setOpenModalInsumos(false)}
          onAddInsumo={handleAddInsumo}
          insumosExistentes={
            detalles.map((d) => d.articuloInsumo).filter(Boolean) as ArticuloInsumo[]
          }
        />
      </div>
    </Modal>
  );
};

export default ModalArticuloManufacturadoForm;
