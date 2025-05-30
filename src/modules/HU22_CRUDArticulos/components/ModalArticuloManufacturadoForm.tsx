import React, { useEffect, useState } from 'react';
import type { ArticuloManufacturado } from '../../../types/Articulo';
import type { Categoria } from '../../../types/Categoria';
import * as categoriaService from '../../../shared/services/categoriaService';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';

interface ModalArticuloManufacturadoFormProps {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<ArticuloManufacturado>;
  onSubmit: (values: Partial<ArticuloManufacturado>) => void;
  mode: 'add' | 'edit' | 'view';
}

const buildInitialFormValues = (
  form: Partial<ArticuloManufacturado>,
  categorias: Categoria[]
): Record<string, string | number> => {
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

  useEffect(() => {
    setForm(initialValues);
    // Mostrar imagen si existe
    setImagenPreview(initialValues.imagen?.url ?? null);

    // Determinar categoría y subcategoría actuales
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
  }, [initialValues, open, categorias]);

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

  // Adaptar los valores iniciales para el ModalForm
  const initialFormValues = buildInitialFormValues(form, categorias);

  const handleSubmit = (values: Record<string, string | number>) => {
    if (mode === 'view') return; // No enviar en modo vista

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
      finalCategoriaId = Number(values.categoria);
    }

    onSubmit({
      ...form,
      denominacion: String(values.denominacion),
      precioVenta: Number(values.precioVenta),
      descripcion: String(values.descripcion),
      tiempoEstimadoMinutos: Number(values.tiempoEstimadoMinutos),
      categoriaId: finalCategoriaId,
      // Mantener la imagen actual si existe
      imagen: form.imagen,
      // Mantener los detalles actuales
      articuloManufacturadoDetalles: form.articuloManufacturadoDetalles ?? [],
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
                        : initialFormValues[field.name]
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
                  defaultValue={initialFormValues[field.name]}
                  className="w-full border rounded px-3 py-2"
                  required={field.required}
                  disabled={field.disabled || mode === 'view'}
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
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Guardar
              </button>
            )}
          </div>
        </form>

        {/* Detalles de preparación */}
        <div>
          <h3 className="font-bold mb-2">🍳 Detalles de preparación</h3>
          <div className="bg-gray-50 p-3 rounded">
            {Array.isArray(form.articuloManufacturadoDetalles) &&
            form.articuloManufacturadoDetalles.length > 0 ? (
              <ul className="space-y-1">
                {form.articuloManufacturadoDetalles.map(
                  (detalle: (typeof form.articuloManufacturadoDetalles)[number], idx: number) => (
                    <li key={detalle?.id ?? idx} className="flex justify-between items-center">
                      <span className="font-medium">
                        {detalle?.articuloInsumo?.denominacion ?? 'Insumo desconocido'}
                      </span>
                      <span className="text-gray-600">
                        {detalle?.cantidad ?? 0}{' '}
                        {detalle?.articuloInsumo?.unidadMedida?.denominacion ?? ''}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No hay detalles de preparación</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalArticuloManufacturadoForm;
