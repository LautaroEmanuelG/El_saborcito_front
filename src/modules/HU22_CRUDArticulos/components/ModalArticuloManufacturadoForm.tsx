import React, { useEffect, useState } from 'react';
import type {
  ArticuloManufacturado,
  Categoria,
  UnidadMedida,
  Imagen,
} from '../../../../types/Articulo';
import * as categoriaService from '../../../../shared/services/categoriaService';
import * as unidadMedidaService from '../../../../shared/services/unidadMedidaService';
import Modal from '../../../../shared/components/abmGenerica/components/modals/Modal';
import ModalForm from '../../../../shared/components/abmGenerica/components/modals/ModalForm';

interface ModalArticuloManufacturadoFormProps {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<ArticuloManufacturado>;
  onSubmit: (values: Partial<ArticuloManufacturado>) => void;
}

const buildInitialFormValues = (
  form: Partial<ArticuloManufacturado>
): Record<string, string | number> => ({
  ...form,
  categoria: form.categoria?.id ?? form.categoriaId ?? '',
  subcategoria: (form as { subcategoria?: Categoria }).subcategoria?.id ?? '',
});

const ModalArticuloManufacturadoForm: React.FC<ModalArticuloManufacturadoFormProps> = ({
  open,
  onClose,
  initialValues,
  onSubmit,
}) => {
  const [form, setForm] = useState<Partial<ArticuloManufacturado>>(initialValues);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialValues);
    setImagenPreview(initialValues.imagen?.url ?? null);
  }, [initialValues, open]);

  useEffect(() => {
    categoriaService.getAllCategorias().then(setCategorias);
    unidadMedidaService.getAllUnidadMedidas().then(setUnidades);
  }, []);

  useEffect(() => {
    if (form.categoria && form.categoria.id) {
      const subs = categorias.filter((cat) => cat.tipoCategoria?.id === form.categoria?.id);
      setSubcategorias(subs);
    } else {
      setSubcategorias([]);
    }
  }, [form.categoria, categorias]);

  // Mostrar imagen si existe
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Construcción dinámica de los campos para el ModalForm
  const fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: Array<{ label: string; value: string | number }>;
  }> = [
    {
      name: 'denominacion',
      label: 'Denominación',
      type: 'text',
      required: true,
    },
    {
      name: 'precioVenta',
      label: 'Precio Venta',
      type: 'number',
      required: true,
    },
    {
      name: 'categoria',
      label: 'Categoría',
      type: 'select',
      required: true,
      options: categorias
        .filter((cat) => !cat.tipoCategoria)
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
    },
    {
      name: 'tiempoEstimadoMinutos',
      label: 'Tiempo Estimado (minutos)',
      type: 'number',
      required: true,
    },
  ].filter(Boolean) as Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: Array<{ label: string; value: string | number }>;
  }>;

  // Adaptar los valores iniciales para el ModalForm
  const initialFormValues = buildInitialFormValues(form);

  const handleSubmit = (values: Record<string, string | number>) => {
    const categoriaObj = categorias.find((cat) => cat.id === Number(values.categoria));
    const subcategoriaObj = subcategorias.find((cat) => cat.id === Number(values.subcategoria));
    onSubmit({
      ...form,
      ...values,
      categoria: categoriaObj ?? null,
      subcategoria: subcategoriaObj ?? undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={form.id ? 'Editar Artículo Manufacturado' : 'Agregar Artículo Manufacturado'}
    >
      <div className="mb-4 flex flex-col items-center">
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
        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
      </div>
      <ModalForm
        open={open}
        onClose={onClose}
        title={form.id ? 'Editar Artículo Manufacturado' : 'Agregar Artículo Manufacturado'}
        fields={fields}
        initialValues={initialFormValues}
        onSubmit={handleSubmit}
      />
      <div className="mt-4">
        <h3 className="font-bold mb-2">Detalles de preparación</h3>
        <ul className="list-disc pl-6">
          {Array.isArray(form.articuloManufacturadoDetalles) &&
          form.articuloManufacturadoDetalles.length > 0 ? (
            form.articuloManufacturadoDetalles.map(
              (detalle: (typeof form.articuloManufacturadoDetalles)[number], idx: number) => (
                <li key={detalle.id ?? idx}>
                  {detalle.articuloInsumo?.denominacion ?? '-'} - {detalle.cantidad}{' '}
                  {detalle.articuloInsumo?.unidadMedida?.denominacion ?? ''}
                </li>
              )
            )
          ) : (
            <li>No hay detalles</li>
          )}
        </ul>
      </div>
    </Modal>
  );
};

export default ModalArticuloManufacturadoForm;
